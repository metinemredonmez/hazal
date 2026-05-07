import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { TotpService } from './totp.service';
import { AuditService, AuditContext } from './audit.service';

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MINUTES = 15;
const TICKET_EXPIRES = '5m';
const TOKEN_TYPE_ACCESS = 'access';
const TOKEN_TYPE_TICKET = '2fa-ticket';

export type SafeAdmin = ReturnType<AuthService['toSafeAdmin']>;

interface AccessTokenPayload {
  sub: string;
  email: string;
  type: typeof TOKEN_TYPE_ACCESS;
  tv: number;
}

interface TicketTokenPayload {
  sub: string;
  email: string;
  type: typeof TOKEN_TYPE_TICKET;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly totp: TotpService,
    private readonly audit: AuditService,
  ) {}

  toSafeAdmin(admin: Admin) {
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      phone: admin.phone,
      avatarUrl: admin.avatarUrl,
      role: admin.role,
      totpEnabled: admin.totpEnabled,
      hasGoogleLink: !!admin.googleId,
      lastLoginAt: admin.lastLoginAt,
    };
  }

  private async signAccessToken(admin: Admin) {
    const payload: AccessTokenPayload = {
      sub: admin.id,
      email: admin.email,
      type: TOKEN_TYPE_ACCESS,
      tv: admin.tokenVersion,
    };
    const expiresIn = (this.config.get<string>('JWT_EXPIRES_IN') ?? '365d') as any;
    return this.jwt.signAsync(payload, { expiresIn });
  }

  private async signTicketToken(admin: Admin) {
    const payload: TicketTokenPayload = {
      sub: admin.id,
      email: admin.email,
      type: TOKEN_TYPE_TICKET,
    };
    return this.jwt.signAsync(payload, { expiresIn: TICKET_EXPIRES });
  }

  async verifyAccessToken(token: string) {
    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token);
      if (payload.type !== TOKEN_TYPE_ACCESS) return null;
      const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub } });
      if (!admin) return null;
      if (payload.tv !== admin.tokenVersion) return null;
      return this.toSafeAdmin(admin);
    } catch {
      return null;
    }
  }

  async login(dto: LoginDto, ctx: AuditContext = {}) {
    const admin = await this.prisma.admin.findUnique({ where: { email: dto.email.toLowerCase() } });

    if (!admin) {
      await this.audit.log('login.failed', { ...ctx, success: false, metadata: { reason: 'no-such-user', email: dto.email } });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      await this.audit.log('login.locked', { adminId: admin.id, ...ctx, success: false });
      throw new ForbiddenException(
        `Account is locked. Try again after ${admin.lockedUntil.toISOString()}.`,
      );
    }

    const ok = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!ok) {
      await this.handleFailedLogin(admin);
      await this.audit.log('login.failed', { adminId: admin.id, ...ctx, success: false });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (admin.totpEnabled) {
      const ticket = await this.signTicketToken(admin);
      return {
        requires2fa: true,
        ticketToken: ticket,
        admin: { id: admin.id, email: admin.email, name: admin.name },
      };
    }

    return this.completeLogin(admin, ctx, 'login.success');
  }

  async verifyTwoFactor(ticketToken: string, code: string, ctx: AuditContext = {}) {
    let payload: TicketTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<TicketTokenPayload>(ticketToken);
    } catch {
      throw new UnauthorizedException('Ticket expired or invalid');
    }
    if (payload.type !== TOKEN_TYPE_TICKET) {
      throw new UnauthorizedException('Invalid ticket');
    }

    const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub } });
    if (!admin || !admin.totpEnabled || !admin.totpSecret) {
      throw new UnauthorizedException('2FA not configured');
    }

    if (!this.totp.verify(code, admin.totpSecret)) {
      await this.audit.log('2fa.failed', { adminId: admin.id, ...ctx, success: false });
      throw new UnauthorizedException('Invalid 2FA code');
    }

    return this.completeLogin(admin, ctx, '2fa.verified');
  }

  async loginWithGoogle(
    profile: { googleId: string; email: string; name?: string; avatar?: string },
    ctx: AuditContext = {},
  ) {
    const email = profile.email.toLowerCase();
    let admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      this.logger.warn(`Google login rejected — email not on allow-list: ${email}`);
      await this.audit.log('login.failed', { ...ctx, success: false, metadata: { reason: 'google-email-not-allowed', email } });
      throw new UnauthorizedException('Bu Google hesabı yetkili değil');
    }

    if (!admin.googleId) {
      admin = await this.prisma.admin.update({
        where: { id: admin.id },
        data: { googleId: profile.googleId, avatarUrl: admin.avatarUrl ?? profile.avatar ?? null },
      });
    } else if (admin.googleId !== profile.googleId) {
      throw new ForbiddenException('Google ID does not match the linked account');
    }

    return this.completeLogin(admin, ctx, 'login.google');
  }

  private async completeLogin(
    admin: Admin,
    ctx: AuditContext,
    auditAction: 'login.success' | 'login.google' | '2fa.verified',
  ) {
    const updated = await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ctx.ip ?? null,
      },
    });
    const token = await this.signAccessToken(updated);
    await this.audit.log(auditAction, { adminId: updated.id, ...ctx });
    return { accessToken: token, admin: this.toSafeAdmin(updated) };
  }

  private async handleFailedLogin(admin: Admin) {
    const attempts = admin.failedLoginAttempts + 1;
    const shouldLock = attempts >= LOCKOUT_THRESHOLD;
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: shouldLock ? 0 : attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000) : admin.lockedUntil,
      },
    });
  }

  async changePassword(adminId: string, dto: ChangePasswordDto, ctx: AuditContext = {}) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException();

    const ok = await bcrypt.compare(dto.currentPassword, admin.passwordHash);
    if (!ok) throw new BadRequestException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    });
    await this.audit.log('password.changed', { adminId, ...ctx });
    return { ok: true };
  }

  async updateProfile(adminId: string, dto: UpdateProfileDto, ctx: AuditContext = {}) {
    const updated = await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        name: dto.name ?? undefined,
        phone: dto.phone ?? undefined,
        avatarUrl: dto.avatarUrl ?? undefined,
      },
    });
    await this.audit.log('profile.updated', { adminId, ...ctx, metadata: { fields: Object.keys(dto) } });
    return this.toSafeAdmin(updated);
  }

  async getTwoFactorStatus(adminId: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException();
    return {
      enabled: admin.totpEnabled,
      pending: !!admin.pendingTotpSecret && !admin.totpEnabled,
    };
  }

  async setupTwoFactor(adminId: string, ctx: AuditContext = {}) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException();
    if (admin.totpEnabled) throw new ConflictException('2FA is already enabled');

    const secret = this.totp.generateSecret();
    const otpauthUrl = this.totp.buildOtpAuthUrl(admin.email, secret);
    const qrCodeDataUri = await this.totp.buildQrDataUri(otpauthUrl);

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { pendingTotpSecret: secret },
    });
    await this.audit.log('2fa.setup', { adminId, ...ctx });

    return { secret, otpauthUrl, qrCodeDataUri };
  }

  async enableTwoFactor(adminId: string, code: string, ctx: AuditContext = {}) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException();
    if (admin.totpEnabled) throw new ConflictException('2FA is already enabled');
    if (!admin.pendingTotpSecret) throw new BadRequestException('No pending 2FA setup');

    if (!this.totp.verify(code, admin.pendingTotpSecret)) {
      throw new BadRequestException('Invalid 2FA code');
    }

    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        totpSecret: admin.pendingTotpSecret,
        totpEnabled: true,
        pendingTotpSecret: null,
        tokenVersion: { increment: 1 },
      },
    });
    await this.audit.log('2fa.enabled', { adminId, ...ctx });
    return { ok: true };
  }

  async disableTwoFactor(adminId: string, password: string, ctx: AuditContext = {}) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException();
    if (!admin.totpEnabled) return { ok: true };

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) throw new BadRequestException('Password is incorrect');

    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        totpEnabled: false,
        totpSecret: null,
        pendingTotpSecret: null,
        tokenVersion: { increment: 1 },
      },
    });
    await this.audit.log('2fa.disabled', { adminId, ...ctx });
    return { ok: true };
  }

  buildFrontendCallbackUrl(token: string): string {
    const base = (this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000').replace(/\/$/, '');
    return `${base}/auth/callback#token=${encodeURIComponent(token)}`;
  }
}

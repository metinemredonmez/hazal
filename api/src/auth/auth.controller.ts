import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuditService } from './audit.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyTotpDto, EnableTotpDto, DisableTotpDto } from './dto/two-factor.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentAdmin, AuthAdmin } from './decorators/current-admin.decorator';

const ctxFromReq = (req: Request) => ({
  ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
  userAgent: req.headers['user-agent'] as string | undefined,
});

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
  ) {}

  private ensureGoogleConfigured() {
    if (!GoogleStrategy.isConfigured(this.config)) {
      throw new ServiceUnavailableException(
        'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
      );
    }
  }

  // -------------------- Email + password (with optional 2FA gate) --------------------

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, ctxFromReq(req));
  }

  @Post('2fa/verify')
  verify2fa(@Body() dto: VerifyTotpDto, @Req() req: Request) {
    return this.auth.verifyTwoFactor(dto.ticketToken, dto.code, ctxFromReq(req));
  }

  // -------------------- Profile / session --------------------

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentAdmin() admin: AuthAdmin) {
    return admin;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @CurrentAdmin() admin: AuthAdmin,
    @Body() dto: UpdateProfileDto,
    @Req() req: Request,
  ) {
    return this.auth.updateProfile(admin.id, dto, ctxFromReq(req));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @CurrentAdmin() admin: AuthAdmin,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    return this.auth.changePassword(admin.id, dto, ctxFromReq(req));
  }

  // -------------------- Two-factor management --------------------

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('2fa/status')
  twoFactorStatus(@CurrentAdmin() admin: AuthAdmin) {
    return this.auth.getTwoFactorStatus(admin.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('2fa/setup')
  setup2fa(@CurrentAdmin() admin: AuthAdmin, @Req() req: Request) {
    return this.auth.setupTwoFactor(admin.id, ctxFromReq(req));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  enable2fa(
    @CurrentAdmin() admin: AuthAdmin,
    @Body() dto: EnableTotpDto,
    @Req() req: Request,
  ) {
    return this.auth.enableTwoFactor(admin.id, dto.code, ctxFromReq(req));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  disable2fa(
    @CurrentAdmin() admin: AuthAdmin,
    @Body() dto: DisableTotpDto,
    @Req() req: Request,
  ) {
    return this.auth.disableTwoFactor(admin.id, dto.password, ctxFromReq(req));
  }

  // -------------------- Audit log (admin) --------------------

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('audit-log')
  audits(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('action') action?: string,
  ) {
    return this.audit.list({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      action,
    });
  }

  // -------------------- Google OAuth --------------------

  @Get('google/status')
  googleStatus() {
    return { configured: GoogleStrategy.isConfigured(this.config) };
  }

  @ApiExcludeEndpoint()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleStart() {
    this.ensureGoogleConfigured();
    // Passport handles redirect to Google
  }

  @ApiExcludeEndpoint()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    this.ensureGoogleConfigured();
    const profile = req.user as
      | { googleId: string; email: string; name?: string; avatar?: string }
      | undefined;
    if (!profile) throw new UnauthorizedException();

    try {
      const { accessToken } = await this.auth.loginWithGoogle(profile, ctxFromReq(req));
      return res.redirect(this.auth.buildFrontendCallbackUrl(accessToken));
    } catch {
      return res.redirect(this.auth.buildFrontendCallbackUrl('error'));
    }
  }
}

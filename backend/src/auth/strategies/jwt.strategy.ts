import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  type: string;
  tv: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'dev-secret',
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== 'access') throw new UnauthorizedException();
    const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub } });
    if (!admin) throw new UnauthorizedException();
    if (payload.tv !== admin.tokenVersion) throw new UnauthorizedException('Token revoked');
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      phone: admin.phone,
      avatarUrl: admin.avatarUrl,
      totpEnabled: admin.totpEnabled,
    };
  }
}

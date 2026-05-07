import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(config: ConfigService) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID') || 'placeholder-not-configured';
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET') || 'placeholder-not-configured';
    super({
      clientID,
      clientSecret,
      callbackURL:
        config.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  static isConfigured(config: ConfigService): boolean {
    return !!(config.get<string>('GOOGLE_CLIENT_ID') && config.get<string>('GOOGLE_CLIENT_SECRET'));
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      this.logger.warn('Google profile returned without email');
      return done(new UnauthorizedException('Google account has no email'), undefined);
    }
    done(null, {
      googleId: profile.id,
      email: email.toLowerCase(),
      name: profile.displayName,
      avatar: profile.photos?.[0]?.value,
    });
  }
}

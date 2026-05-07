import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

@Injectable()
export class TotpService {
  constructor(private readonly config: ConfigService) {
    // 30-second step, 6-digit codes, ±1 step tolerance for clock drift
    authenticator.options = { step: 30, digits: 6, window: 1 };
  }

  generateSecret(): string {
    return authenticator.generateSecret();
  }

  buildOtpAuthUrl(email: string, secret: string): string {
    const issuer = this.config.get<string>('APP_NAME') ?? 'Hazal Muti Real Estate';
    return authenticator.keyuri(email, issuer, secret);
  }

  async buildQrDataUri(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl, { errorCorrectionLevel: 'M', margin: 1, width: 256 });
  }

  verify(code: string, secret: string): boolean {
    if (!code || !secret) return false;
    try {
      return authenticator.verify({ token: code.replace(/\s+/g, ''), secret });
    } catch {
      return false;
    }
  }
}

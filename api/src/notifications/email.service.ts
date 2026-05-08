import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = parseInt(this.config.get<string>('SMTP_PORT') ?? '587', 10);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    this.from =
      this.config.get<string>('MAIL_FROM') ??
      `Hazal Muti Real Estate <noreply@hazalmuti.com>`;

    if (host && user && pass) {
      // CyberPanel + self-hosted mail servers usually have self-signed certs.
      // Set SMTP_TLS_REJECT_UNAUTHORIZED=false in env to accept them.
      const rejectUnauthorized =
        this.config.get<string>('SMTP_TLS_REJECT_UNAUTHORIZED') !== 'false';
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized },
      });
      this.logger.log(
        `✉️  SMTP configured: ${host}:${port} (from ${this.from}, tls.rejectUnauthorized=${rejectUnauthorized})`,
      );
    } else {
      this.logger.warn('SMTP not configured — emails will be logged but not sent');
    }
  }

  isConfigured(): boolean {
    return !!this.transporter;
  }

  async send(opts: SendMailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `[mail-stub] SMTP not configured — email NOT sent. To: ${opts.to} | Subject: ${opts.subject}`,
      );
      // Throw so callers know the email was not actually delivered.
      // Previously we returned silently, which made notifyNewInquiry /
      // monthly report incorrectly mark emailSentAt.
      throw new Error('SMTP not configured');
    }
    const info = await this.transporter.sendMail({
      from: this.from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    this.logger.log(`✉️  Sent to ${opts.to}: ${info.messageId}`);
  }
}

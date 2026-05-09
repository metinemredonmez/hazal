import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface MailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
}

/**
 * EmailService — sends mail via Resend (preferred) or Postfix/SMTP (fallback).
 *
 * Provider selection logic:
 *   1. If RESEND_API_KEY is set → use Resend HTTPS API (best deliverability).
 *   2. Else if SMTP_HOST + SMTP_USER + SMTP_PASS are set → use nodemailer SMTP.
 *   3. Else → log only, throw on send().
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly from: string;
  private readonly provider: 'resend' | 'smtp' | 'none';
  private readonly resend: Resend | null = null;
  private readonly transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    this.from =
      this.config.get<string>('MAIL_FROM') ??
      'Hazal Muti Real Estate <onboarding@resend.dev>';

    const resendKey = this.config.get<string>('RESEND_API_KEY');
    if (resendKey) {
      this.resend = new Resend(resendKey);
      this.provider = 'resend';
      this.logger.log(`✉️  Resend configured (from: ${this.from})`);
      return;
    }

    const host = this.config.get<string>('SMTP_HOST');
    const port = parseInt(this.config.get<string>('SMTP_PORT') ?? '587', 10);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      const rejectUnauthorized =
        this.config.get<string>('SMTP_TLS_REJECT_UNAUTHORIZED') !== 'false';
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized },
      });
      this.provider = 'smtp';
      this.logger.log(
        `✉️  SMTP configured: ${host}:${port} (from ${this.from}, tls.rejectUnauthorized=${rejectUnauthorized})`,
      );
      return;
    }

    this.provider = 'none';
    this.logger.warn('No mail provider configured — emails will throw on send');
  }

  isConfigured(): boolean {
    return this.provider !== 'none';
  }

  async send(opts: SendMailOptions): Promise<void> {
    if (this.provider === 'none') {
      this.logger.warn(
        `[mail-stub] No provider configured — email NOT sent. To: ${opts.to} | Subject: ${opts.subject}`,
      );
      throw new Error('Mail provider not configured (set RESEND_API_KEY or SMTP_*)');
    }

    if (this.provider === 'resend' && this.resend) {
      const payload: Record<string, unknown> = {
        from: this.from,
        to: opts.to,
        subject: opts.subject,
      };
      if (opts.html) payload.html = opts.html;
      if (opts.text) payload.text = opts.text;
      if (opts.replyTo) payload.replyTo = opts.replyTo;
      if (opts.attachments && opts.attachments.length > 0) {
        payload.attachments = opts.attachments.map((a) => ({
          filename: a.filename,
          content: a.content,
          path: a.path,
          contentType: a.contentType,
        }));
      }
      // Resend v6 type union requires either `react` or `html`/`text`. We pass
      // html/text dynamically so cast through unknown to bypass the strict
      // discriminated union.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await this.resend.emails.send(payload as unknown as any);
      if (result.error) {
        throw new Error(`Resend error: ${result.error.message}`);
      }
      this.logger.log(`✉️  Resend → ${opts.to}: ${result.data?.id ?? 'sent'}`);
      return;
    }

    if (this.provider === 'smtp' && this.transporter) {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
        replyTo: opts.replyTo,
        attachments: opts.attachments,
      });
      this.logger.log(`✉️  SMTP → ${opts.to}: ${info.messageId}`);
      return;
    }
  }
}

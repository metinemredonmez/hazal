import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

export type NotificationType = 'new_inquiry' | 'new_chat_message' | 'system';

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  metadata?: Prisma.InputJsonValue;
  /** If provided, also try to send an email to admin */
  email?: { to: string; subject: string; html: string; replyTo?: string };
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link,
        metadata: input.metadata ?? Prisma.JsonNull,
      },
    });

    // Fire email asynchronously, don't block
    if (input.email) {
      this.email
        .send({
          to: input.email.to,
          subject: input.email.subject,
          html: input.email.html,
          replyTo: input.email.replyTo,
        })
        .catch((err) => this.logger.warn(`Email send failed: ${err.message}`));
    }

    return notification;
  }

  async list(opts: { page?: number; pageSize?: number; unreadOnly?: boolean } = {}) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 30;
    const where: Prisma.NotificationWhereInput = {};
    if (opts.unreadOnly) where.read = false;

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { read: false } }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      unreadCount,
    };
  }

  async markRead(id: string) {
    const n = await this.prisma.notification.findUnique({ where: { id } });
    if (!n) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllRead() {
    await this.prisma.notification.updateMany({
      where: { read: false },
      data: { read: true, readAt: new Date() },
    });
    return { ok: true };
  }

  async unreadCount() {
    return this.prisma.notification.count({ where: { read: false } });
  }

  async remove(id: string) {
    await this.prisma.notification.delete({ where: { id } });
    return { ok: true };
  }

  /** Convenience: notify admin about a new inquiry. */
  async notifyNewInquiry(inquiry: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    listingId?: string | null;
    listingTitle?: string | null;
  }) {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL') ?? 'hazalmuti@hotmail.com';
    const frontendUrl = (this.config.get<string>('FRONTEND_URL') ?? 'https://hazalmuti.com').replace(/\/$/, '');
    const adminUrl = frontendUrl.replace('://hazalmuti', '://admin.hazalmuti');

    // Try to use admin-customized template first
    const settings = await this.prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
    const tmpl = (settings?.emailTemplates as Record<string, unknown> | null)?.newInquiryAdmin as
      | { subject?: { tr?: string; en?: string }; body?: { tr?: string; en?: string } }
      | undefined;
    const customSubject = tmpl?.subject?.tr;
    const customBody = tmpl?.body?.tr;

    const variables = {
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone ?? '',
      message: inquiry.message,
      listingTitle: inquiry.listingTitle ?? '',
      adminUrl,
    };
    const replaceVars = (s: string) =>
      Object.entries(variables).reduce(
        (acc, [k, v]) => acc.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v)),
        s,
      );

    let subject: string;
    let html: string;

    if (customSubject && customBody) {
      // Use admin's template — wrap plain text in branded HTML
      subject = replaceVars(customSubject);
      const plainBody = replaceVars(customBody);
      html = `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #14141A;">
          <p style="text-transform: uppercase; letter-spacing: 0.4em; color: #C9A96E; font-size: 11px; margin: 0;">Hazal Muti · Real Estate</p>
          <div style="margin-top: 24px; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${escapeHtml(plainBody)}</div>
          <p style="color: #6E6E73; font-size: 11px; margin-top: 32px; text-align: center;">© ${new Date().getFullYear()} Hazal Muti Real Estate</p>
        </div>
      `;
      return this.create({
        type: 'new_inquiry',
        title: `Yeni talep: ${inquiry.name}`,
        body: inquiry.message.substring(0, 200),
        link: `/inquiries`,
        metadata: { inquiryId: inquiry.id, email: inquiry.email },
        email: { to: adminEmail, subject, html, replyTo: inquiry.email },
      });
    }

    // Fallback: original hardcoded HTML template
    subject = `Yeni müşteri talebi — ${inquiry.name}`;
    html = `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #14141A;">
        <p style="text-transform: uppercase; letter-spacing: 0.4em; color: #C9A96E; font-size: 11px; margin: 0;">Hazal Muti · Real Estate</p>
        <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 400; margin: 16px 0;">Yeni müşteri talebi</h1>
        <p style="color: #6E6E73; font-size: 14px;">${new Date().toLocaleString('tr-TR')}</p>
        <table style="width: 100%; margin: 24px 0; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6E6E73; width: 100px;">İsim</td><td style="padding: 8px 0;"><strong>${escapeHtml(inquiry.name)}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #6E6E73;">E-posta</td><td style="padding: 8px 0;"><a href="mailto:${inquiry.email}" style="color: #C9A96E;">${escapeHtml(inquiry.email)}</a></td></tr>
          ${inquiry.phone ? `<tr><td style="padding: 8px 0; color: #6E6E73;">Telefon</td><td style="padding: 8px 0;"><a href="tel:${inquiry.phone}" style="color: #C9A96E;">${escapeHtml(inquiry.phone)}</a></td></tr>` : ''}
        </table>
        <div style="background: #F5F2EC; padding: 16px; border-left: 3px solid #C9A96E; margin: 16px 0;">
          <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">${escapeHtml(inquiry.message)}</p>
        </div>
        <p style="margin-top: 32px;">
          <a href="${adminUrl}/inquiries" style="display: inline-block; background: #14141A; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px;">Panelde aç</a>
        </p>
        <p style="color: #6E6E73; font-size: 11px; margin-top: 32px; text-align: center;">© ${new Date().getFullYear()} Hazal Muti Real Estate</p>
      </div>
    `;

    return this.create({
      type: 'new_inquiry',
      title: `Yeni talep: ${inquiry.name}`,
      body: inquiry.message.substring(0, 200),
      link: `/inquiries`,
      metadata: { inquiryId: inquiry.id, email: inquiry.email },
      email: { to: adminEmail, subject, html, replyTo: inquiry.email },
    });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

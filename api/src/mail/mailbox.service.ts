import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

export interface SendMailInput {
  to: string;
  cc?: string;
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  inReplyTo?: string;
}

@Injectable()
export class MailboxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async send(dto: SendMailInput) {
    // Send via SMTP
    const html = dto.bodyHtml ?? this.textToHtml(dto.bodyText ?? '');
    await this.email.send({
      to: dto.to,
      subject: dto.subject,
      text: dto.bodyText,
      html,
    });

    // Store as OUTBOUND for inbox/sent display
    const fromAddress =
      this.config.get<string>('SMTP_USER') ?? this.config.get<string>('MAIL_FROM') ?? '';
    const threadKey = dto.subject
      .replace(/^(re:|fwd:|fw:)\s*/i, '')
      .trim()
      .toLowerCase()
      .slice(0, 200);
    return this.prisma.emailMessage.create({
      data: {
        direction: 'OUTBOUND',
        status: 'READ',
        fromAddress,
        toAddresses: dto.to,
        ccAddresses: dto.cc ?? null,
        subject: dto.subject,
        bodyText: dto.bodyText ?? '',
        bodyHtml: html,
        inReplyTo: dto.inReplyTo ?? null,
        threadKey,
        receivedAt: new Date(),
        imapFolder: 'SENT',
      },
    });
  }

  async list(opts: {
    direction: 'INBOUND' | 'OUTBOUND';
    page?: number;
    pageSize?: number;
    search?: string;
  }) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 30;
    const where: Prisma.EmailMessageWhereInput = {
      direction: opts.direction,
      status: { not: 'DELETED' },
    };
    if (opts.search) {
      where.OR = [
        { subject: { contains: opts.search, mode: 'insensitive' } },
        { fromAddress: { contains: opts.search, mode: 'insensitive' } },
        { toAddresses: { contains: opts.search, mode: 'insensitive' } },
        { bodyText: { contains: opts.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.emailMessage.findMany({
        where,
        orderBy: { receivedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.emailMessage.count({ where }),
    ]);
    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string) {
    const msg = await this.prisma.emailMessage.findUnique({ where: { id } });
    if (!msg || msg.status === 'DELETED') throw new NotFoundException('Not found');
    return msg;
  }

  async markRead(id: string) {
    return this.prisma.emailMessage.update({
      where: { id },
      data: { status: 'READ' },
    });
  }

  async unreadCount(): Promise<number> {
    return this.prisma.emailMessage.count({
      where: { direction: 'INBOUND', status: 'UNREAD' },
    });
  }

  async softDelete(id: string) {
    await this.prisma.emailMessage.update({
      where: { id },
      data: { status: 'DELETED' },
    });
    return { ok: true };
  }

  private textToHtml(text: string): string {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
    return `<div style="font-family: Inter, system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: #14141A;">${escaped}</div>`;
  }
}

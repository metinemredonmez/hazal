import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SubscribeInput {
  email: string;
  name?: string;
  locale?: string;
  source?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(input: SubscribeInput) {
    const email = input.email.trim().toLowerCase();
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    if (existing) {
      if (existing.unsubscribed) {
        // Re-subscribe
        return this.prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            unsubscribed: false,
            unsubscribedAt: null,
            name: input.name ?? existing.name,
            locale: input.locale ?? existing.locale,
          },
        });
      }
      throw new ConflictException('Already subscribed');
    }
    return this.prisma.newsletterSubscriber.create({
      data: {
        email,
        name: input.name,
        locale: input.locale ?? 'tr',
        source: input.source ?? 'web',
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }

  async list(opts: { page?: number; pageSize?: number; includeUnsubscribed?: boolean } = {}) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 50;
    const where = opts.includeUnsubscribed ? {} : { unsubscribed: false };
    const [items, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.newsletterSubscriber.count({ where }),
    ]);
    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async stats() {
    const [active, unsubscribed, total, last30dCount] = await Promise.all([
      this.prisma.newsletterSubscriber.count({ where: { unsubscribed: false } }),
      this.prisma.newsletterSubscriber.count({ where: { unsubscribed: true } }),
      this.prisma.newsletterSubscriber.count(),
      this.prisma.newsletterSubscriber.count({
        where: {
          unsubscribed: false,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);
    return { active, unsubscribed, total, last30dCount };
  }

  async unsubscribe(id: string) {
    const sub = await this.prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Subscriber not found');
    return this.prisma.newsletterSubscriber.update({
      where: { id },
      data: { unsubscribed: true, unsubscribedAt: new Date() },
    });
  }

  async remove(id: string) {
    await this.prisma.newsletterSubscriber.delete({ where: { id } });
    return { ok: true };
  }
}

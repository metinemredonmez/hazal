import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Prisma, InquiryStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { QueryInquiriesDto } from './dto/query-inquiries.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger(InquiriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(dto: CreateInquiryDto) {
    if (dto.listingId) {
      const exists = await this.prisma.listing.findUnique({ where: { id: dto.listingId } });
      if (!exists) throw new BadRequestException('Listing not found');
    }
    const inquiry = await this.prisma.inquiry.create({ data: dto });

    // Fire notification + email asynchronously
    this.notifications
      .notifyNewInquiry({
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
        listingId: inquiry.listingId,
      })
      .then((n) => this.notificationsGateway.emitNotification(n))
      .catch((err) => this.logger.warn(`Notification failed: ${err.message}`));

    return inquiry;
  }

  async list(query: QueryInquiriesDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.InquiryWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.listingId) where.listingId = query.listingId;
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { email: { contains: query.q, mode: 'insensitive' } },
        { phone: { contains: query.q, mode: 'insensitive' } },
        { message: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.inquiry.findMany({
        where,
        include: { listing: { select: { id: true, slug: true, titleEn: true, titleTr: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.inquiry.count({ where }),
      this.prisma.inquiry.count({ where: { status: InquiryStatus.NEW } }),
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

  async getById(id: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      include: { listing: { select: { id: true, slug: true, titleEn: true, titleTr: true } } },
    });
    if (!inquiry) throw new NotFoundException('Inquiry not found');
    return inquiry;
  }

  async update(id: string, dto: UpdateInquiryDto) {
    await this.getById(id);
    return this.prisma.inquiry.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.getById(id);
    await this.prisma.inquiry.delete({ where: { id } });
    return { ok: true };
  }
}

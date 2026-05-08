import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  private listingSelect = { id: true, slug: true, titleTr: true, titleEn: true } as const;
  private inquirySelect = { id: true, name: true, email: true } as const;

  async create(dto: CreateAppointmentDto) {
    const appointment = await this.prisma.appointment.create({
      data: {
        startsAt: new Date(dto.startsAt),
        durationMin: dto.durationMin ?? 60,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        listingId: dto.listingId,
        inquiryId: dto.inquiryId,
        location: dto.location,
        notes: dto.notes,
        status: dto.status ?? AppointmentStatus.SCHEDULED,
      },
      include: {
        listing: { select: this.listingSelect },
        inquiry: { select: this.inquirySelect },
      },
    });

    // Notify
    this.notifications
      .create({
        type: 'system',
        title: 'Yeni randevu oluşturuldu',
        body: `${appointment.name} — ${new Date(appointment.startsAt).toLocaleString('tr-TR')}`,
        link: `/appointments`,
        metadata: { appointmentId: appointment.id },
      })
      .then((n) => this.notificationsGateway.emitNotification(n))
      .catch((err) => this.logger.warn(`Notification failed: ${err.message}`));

    return appointment;
  }

  async list(opts: {
    status?: AppointmentStatus;
    from?: string;
    to?: string;
    upcomingOnly?: boolean;
  } = {}) {
    const where: Prisma.AppointmentWhereInput = {};
    if (opts.status) where.status = opts.status;
    if (opts.upcomingOnly) where.startsAt = { gte: new Date() };
    if (opts.from || opts.to) {
      where.startsAt = {
        ...(where.startsAt as Prisma.DateTimeFilter),
        ...(opts.from ? { gte: new Date(opts.from) } : {}),
        ...(opts.to ? { lte: new Date(opts.to) } : {}),
      };
    }

    return this.prisma.appointment.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      include: {
        listing: { select: this.listingSelect },
        inquiry: { select: this.inquirySelect },
      },
    });
  }

  async getById(id: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        listing: { select: this.listingSelect },
        inquiry: { select: this.inquirySelect },
      },
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    return appt;
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    await this.getById(id);
    const data: Prisma.AppointmentUpdateInput = {};
    if (dto.startsAt) data.startsAt = new Date(dto.startsAt);
    if (dto.durationMin !== undefined) data.durationMin = dto.durationMin;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.listingId !== undefined) {
      data.listing = dto.listingId ? { connect: { id: dto.listingId } } : { disconnect: true };
    }
    if (dto.inquiryId !== undefined) {
      data.inquiry = dto.inquiryId ? { connect: { id: dto.inquiryId } } : { disconnect: true };
    }

    return this.prisma.appointment.update({
      where: { id },
      data,
      include: {
        listing: { select: this.listingSelect },
        inquiry: { select: this.inquirySelect },
      },
    });
  }

  async remove(id: string) {
    await this.getById(id);
    await this.prisma.appointment.delete({ where: { id } });
    return { ok: true };
  }

  async stats() {
    const now = new Date();
    const [scheduled, today, upcoming, completed] = await Promise.all([
      this.prisma.appointment.count({ where: { status: AppointmentStatus.SCHEDULED } }),
      this.prisma.appointment.count({
        where: {
          startsAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        },
      }),
      this.prisma.appointment.count({ where: { startsAt: { gte: now } } }),
      this.prisma.appointment.count({ where: { status: AppointmentStatus.COMPLETED } }),
    ]);
    return { scheduled, today, upcoming, completed };
  }
}

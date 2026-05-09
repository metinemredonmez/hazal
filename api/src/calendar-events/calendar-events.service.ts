import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  CalendarEventType,
  CalendarEventStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateEventInput {
  type: CalendarEventType;
  title: string;
  description?: string;
  startsAt: Date;
  endsAt?: Date;
  allDay?: boolean;
  color?: string;
  location?: string;
  lat?: number;
  lng?: number;
  listingId?: string;
  inquiryId?: string;
  customerName?: string;
  remindBefore?: number;
  recurrence?: string;
  notes?: string;
}

@Injectable()
export class CalendarEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateEventInput) {
    return this.prisma.calendarEvent.create({
      data: {
        type: input.type,
        title: input.title,
        description: input.description,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        allDay: input.allDay ?? false,
        color: input.color,
        location: input.location,
        lat: input.lat,
        lng: input.lng,
        listingId: input.listingId || null,
        inquiryId: input.inquiryId || null,
        customerName: input.customerName,
        remindBefore: input.remindBefore,
        recurrence: input.recurrence,
        notes: input.notes,
      },
      include: {
        listing: { select: { slug: true, titleTr: true, district: true } },
      },
    });
  }

  async list(opts: {
    fromDate?: Date;
    toDate?: Date;
    type?: CalendarEventType;
    status?: CalendarEventStatus;
    listingId?: string;
  } = {}) {
    const where: Prisma.CalendarEventWhereInput = {};
    if (opts.fromDate || opts.toDate) {
      const range: { gte?: Date; lte?: Date } = {};
      if (opts.fromDate) range.gte = opts.fromDate;
      if (opts.toDate) range.lte = opts.toDate;
      where.startsAt = range;
    }
    if (opts.type) where.type = opts.type;
    if (opts.status) where.status = opts.status;
    if (opts.listingId) where.listingId = opts.listingId;

    return this.prisma.calendarEvent.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      include: {
        listing: { select: { slug: true, titleTr: true, district: true } },
      },
    });
  }

  async findById(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        listing: { select: { slug: true, titleTr: true, district: true } },
        inquiry: { select: { name: true, email: true } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, dto: Partial<CreateEventInput> & { status?: CalendarEventStatus }) {
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(dto)) {
      if (v !== undefined) data[k] = v;
    }
    return this.prisma.calendarEvent.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.calendarEvent.delete({ where: { id } });
    return { ok: true };
  }

  /** Combined view: appointments + calendar events for a date range */
  async listCombined(fromDate: Date, toDate: Date) {
    const [events, appointments] = await Promise.all([
      this.list({ fromDate, toDate }),
      this.prisma.appointment.findMany({
        where: { startsAt: { gte: fromDate, lte: toDate } },
        include: {
          listing: { select: { slug: true, titleTr: true, district: true } },
        },
      }),
    ]);

    // Normalize appointments to event-like shape
    const apptsAsEvents = appointments.map((a) => ({
      id: `appt-${a.id}`,
      type: 'APPOINTMENT' as const,
      status: a.status as unknown as string,
      title: `Randevu: ${a.name}`,
      description: a.notes,
      startsAt: a.startsAt,
      endsAt: new Date(a.startsAt.getTime() + a.durationMin * 60_000),
      allDay: false,
      color: '#C9A96E',
      location: a.location,
      listing: a.listing,
      customerName: a.name,
      _source: 'appointment' as const,
      _appointmentId: a.id,
    }));

    return {
      events: events.map((e) => ({ ...e, _source: 'event' as const })),
      appointments: apptsAsEvents,
    };
  }

  /** Auto-create reminders from data — listing expiry */
  async syncListingExpiries(daysAhead = 7) {
    // Placeholder: in a real flow, listings would have an expiresAt field.
    // For now, this is a hook for future use. Returns 0.
    return { created: 0, daysAhead };
  }
}

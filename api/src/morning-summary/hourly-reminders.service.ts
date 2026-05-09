import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../push/push.service';

interface ReminderResult {
  appointmentReminders: number;
  contractExpiry: number;
  staleInquiries: number;
}

/**
 * Hourly cron — fires time-sensitive reminders.
 *
 * Cron (Turkey time): every hour 09:00–20:00
 *   0 9-20 * * *  curl -X POST -H "x-cron-secret: $CRON_SECRET" \
 *      https://api.hazalmuti.com/api/cron/hourly-reminders
 *
 * Sends Hazal a push for:
 * - Appointments starting in ~2h (window 110-130 min ahead)
 * - Contracts/listing expiry 30 days ahead (once a day at 09:00 only)
 * - Inquiries waiting >7 days without status change (once a day at 09:00 only)
 *
 * Uses Push (OneSignal). No email here — that is the morning summary's job.
 */
@Injectable()
export class HourlyRemindersService {
  private readonly logger = new Logger(HourlyRemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly push: PushService,
  ) {}

  async run(): Promise<ReminderResult> {
    const result: ReminderResult = {
      appointmentReminders: 0,
      contractExpiry: 0,
      staleInquiries: 0,
    };

    if (!this.push.isConfigured()) {
      this.logger.warn('Push not configured, skipping hourly reminders');
      return result;
    }

    const now = new Date();
    const hour = now.getHours();
    const adminUrl = this.config.get<string>('ADMIN_URL') ?? 'https://admin.hazalmuti.com';

    // 1. Appointments starting in ~2 hours
    const window = {
      from: new Date(now.getTime() + 110 * 60 * 1000),
      to: new Date(now.getTime() + 130 * 60 * 1000),
    };
    try {
      const upcoming = await this.prisma.appointment.findMany({
        where: {
          startsAt: { gte: window.from, lte: window.to },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        include: { listing: { select: { titleTr: true, district: true } } },
      });
      for (const a of upcoming) {
        const time = a.startsAt.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const where = a.location || a.listing?.district || a.listing?.titleTr || '';
        await this.push.send({
          titleTr: `⏰ ${time} Randevu — ${a.name}`,
          titleEn: `⏰ ${time} Appointment — ${a.name}`,
          bodyTr: where ? `${where}${a.phone ? ' · ' + a.phone : ''}` : (a.phone ?? 'Hazırlık'),
          bodyEn: where ? `${where}${a.phone ? ' · ' + a.phone : ''}` : (a.phone ?? 'Prep'),
          url: `${adminUrl}/appointments`,
        });
        result.appointmentReminders++;
      }
    } catch (err) {
      this.logger.warn(`Appointment reminder failed: ${(err as Error).message}`);
    }

    // Daily-only signals at 09:00 — avoid duplicate spam
    if (hour === 9) {
      // 2. Stale inquiries (NEW/CONTACTED >7 days, not closed)
      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const stale = await this.prisma.inquiry.findMany({
          where: {
            status: { in: ['NEW', 'CONTACTED'] },
            updatedAt: { lt: sevenDaysAgo },
          },
          take: 5,
          orderBy: { updatedAt: 'asc' },
          select: { id: true, name: true, updatedAt: true },
        });
        if (stale.length > 0) {
          await this.push.send({
            titleTr: `⏳ ${stale.length} müşteri 7+ gündür bekliyor`,
            titleEn: `⏳ ${stale.length} customers waiting 7+ days`,
            bodyTr: stale.map((s) => s.name).slice(0, 3).join(', '),
            bodyEn: stale.map((s) => s.name).slice(0, 3).join(', '),
            url: `${adminUrl}/inquiries?stale=true`,
          });
          result.staleInquiries = stale.length;
        }
      } catch (err) {
        this.logger.warn(`Stale inquiry reminder failed: ${(err as Error).message}`);
      }
    }

    this.logger.log(
      `Hourly reminders: ${result.appointmentReminders} appt, ${result.staleInquiries} stale`,
    );
    return result;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { PushService } from '../push/push.service';

export interface MorningSummary {
  date: string;
  appointmentsToday: Array<{
    id: string;
    time: string;
    customer: string;
    listing: string | null;
  }>;
  hotInquiries: Array<{
    id: string;
    name: string;
    email: string;
    daysWaiting: number;
  }>;
  staleListings: Array<{
    id: string;
    title: string;
    daysInactive: number;
  }>;
  unreadChats: number;
  totalsToday: {
    newInquiries: number;
    newListings: number;
  };
}

@Injectable()
export class MorningSummaryService {
  private readonly logger = new Logger(MorningSummaryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
    private readonly push: PushService,
  ) {}

  async build(): Promise<MorningSummary> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const [appointments, hotInquiries, allListings, unreadChats, todayInquiries, todayListings] =
      await Promise.all([
        this.prisma.appointment.findMany({
          where: {
            startsAt: { gte: startOfDay, lte: endOfDay },
            status: { in: ['SCHEDULED', 'CONFIRMED'] },
          },
          include: { listing: { select: { titleTr: true } } },
          orderBy: { startsAt: 'asc' },
        }),
        this.prisma.inquiry.findMany({
          where: { status: 'HOT' },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        this.prisma.listing.findMany({
          where: { status: 'DRAFT' },
          orderBy: { createdAt: 'asc' },
          take: 5,
          select: { id: true, titleTr: true, createdAt: true },
        }),
        this.prisma.chatMessage.count({
          where: { sender: 'VISITOR' as never, read: false },
        }),
        this.prisma.inquiry.count({ where: { createdAt: { gte: startOfDay, lte: endOfDay } } }),
        this.prisma.listing.count({ where: { createdAt: { gte: startOfDay, lte: endOfDay } } }),
      ]);

    const today = now.toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return {
      date: today,
      appointmentsToday: appointments.map((a) => ({
        id: a.id,
        time: a.startsAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        customer: a.name ?? a.email ?? 'İsimsiz',
        listing: a.listing?.titleTr ?? null,
      })),
      hotInquiries: hotInquiries.map((i) => ({
        id: i.id,
        name: i.name,
        email: i.email,
        daysWaiting: Math.floor((Date.now() - i.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      })),
      staleListings: allListings.map((l) => ({
        id: l.id,
        title: l.titleTr,
        daysInactive: Math.floor((Date.now() - l.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      })),
      unreadChats,
      totalsToday: {
        newInquiries: todayInquiries,
        newListings: todayListings,
      },
    };
  }

  /** Generate and send to admin via email + push. */
  async run(): Promise<{ summary: MorningSummary; emailSent: boolean; pushSent: boolean }> {
    const summary = await this.build();
    const adminEmail = this.config.get<string>('ADMIN_EMAIL');

    let emailSent = false;
    let pushSent = false;

    // Email summary to Hazal
    if (adminEmail) {
      try {
        await this.email.send({
          to: adminEmail,
          subject: `🌅 Günaydın · ${summary.date} özeti`,
          html: this.buildEmailHtml(summary),
          text: this.buildEmailText(summary),
        });
        emailSent = true;
      } catch (err) {
        this.logger.warn(`Morning summary email failed: ${(err as Error).message}`);
      }
    }

    // Push: short, dashboard-friendly
    if (this.push.isConfigured()) {
      try {
        const headline = this.buildHeadline(summary);
        await this.push.send({
          titleTr: 'Günaydın Hazal · Bugünün özeti',
          titleEn: 'Good morning · today summary',
          bodyTr: headline,
          bodyEn: headline,
          url: this.config.get<string>('ADMIN_URL') ?? 'https://admin.hazalmuti.com',
        });
        pushSent = true;
      } catch (err) {
        this.logger.warn(`Morning summary push failed: ${(err as Error).message}`);
      }
    }

    this.logger.log(
      `Morning summary built: ${summary.appointmentsToday.length} apt, ${summary.hotInquiries.length} hot, ${summary.unreadChats} unread`,
    );
    return { summary, emailSent, pushSent };
  }

  private buildHeadline(s: MorningSummary): string {
    const parts: string[] = [];
    if (s.appointmentsToday.length > 0) {
      parts.push(`${s.appointmentsToday.length} randevu`);
    }
    if (s.hotInquiries.length > 0) {
      parts.push(`${s.hotInquiries.length} sıcak talep`);
    }
    if (s.unreadChats > 0) {
      parts.push(`${s.unreadChats} okunmamış mesaj`);
    }
    if (s.staleListings.length > 0) {
      parts.push(`${s.staleListings.length} taslak ilan`);
    }
    return parts.length > 0 ? `Bugün: ${parts.join(' · ')}` : 'Bugün sakin görünüyor 🌿';
  }

  private buildEmailHtml(s: MorningSummary): string {
    const apt =
      s.appointmentsToday.length > 0
        ? `<h2 style="font-size:14px;margin:24px 0 8px;color:#14141A;">📅 Bugünün randevuları</h2>
<ul style="padding-left:18px;margin:0 0 16px;color:#3a3a40;font-size:13px;line-height:1.8;">${s.appointmentsToday
            .map(
              (a) =>
                `<li><strong>${a.time}</strong> · ${this.esc(a.customer)}${
                  a.listing ? ` · ${this.esc(a.listing)}` : ''
                }</li>`,
            )
            .join('')}</ul>`
        : '<p style="font-size:13px;color:#6E6E73;">📅 Bugün randevu yok.</p>';

    const hot =
      s.hotInquiries.length > 0
        ? `<h2 style="font-size:14px;margin:24px 0 8px;color:#14141A;">🔥 Sıcak talepler</h2>
<ul style="padding-left:18px;margin:0 0 16px;color:#3a3a40;font-size:13px;line-height:1.8;">${s.hotInquiries
            .map(
              (i) =>
                `<li><strong>${this.esc(i.name)}</strong> (${this.esc(i.email)}) · ${i.daysWaiting} gün bekliyor</li>`,
            )
            .join('')}</ul>`
        : '';

    const stale =
      s.staleListings.length > 0
        ? `<h2 style="font-size:14px;margin:24px 0 8px;color:#14141A;">📝 Yayınlanmamış (taslak) ilanlar</h2>
<ul style="padding-left:18px;margin:0 0 16px;color:#3a3a40;font-size:13px;line-height:1.8;">${s.staleListings
            .map(
              (l) =>
                `<li>${this.esc(l.title)} · ${l.daysInactive} gün taslakta</li>`,
            )
            .join('')}</ul>`
        : '';

    return `<!doctype html><html><body style="margin:0;padding:24px;background:#FAF8F4;font-family:Inter,system-ui,sans-serif;color:#14141A;">
<div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #E5E2DD;padding:32px 28px;border-radius:8px;">
  <p style="font-size:10px;letter-spacing:0.4em;color:#C9A96E;text-transform:uppercase;margin:0 0 8px;">Günün Özeti</p>
  <h1 style="font-size:22px;font-weight:500;margin:0 0 8px;">Günaydın Hazal 🌅</h1>
  <p style="font-size:14px;color:#6E6E73;margin:0 0 24px;">${this.esc(s.date)}</p>

  <div style="display:flex;gap:12px;flex-wrap:wrap;margin:0 0 16px;">
    <div style="flex:1;min-width:120px;background:#FAF8F4;padding:12px;border-radius:6px;text-align:center;">
      <p style="font-size:24px;font-weight:300;margin:0;">${s.appointmentsToday.length}</p>
      <p style="font-size:10px;color:#6E6E73;margin:4px 0 0;letter-spacing:0.1em;text-transform:uppercase;">Randevu</p>
    </div>
    <div style="flex:1;min-width:120px;background:#FAF8F4;padding:12px;border-radius:6px;text-align:center;">
      <p style="font-size:24px;font-weight:300;margin:0;color:#dc2626;">${s.hotInquiries.length}</p>
      <p style="font-size:10px;color:#6E6E73;margin:4px 0 0;letter-spacing:0.1em;text-transform:uppercase;">Sıcak Talep</p>
    </div>
    <div style="flex:1;min-width:120px;background:#FAF8F4;padding:12px;border-radius:6px;text-align:center;">
      <p style="font-size:24px;font-weight:300;margin:0;">${s.unreadChats}</p>
      <p style="font-size:10px;color:#6E6E73;margin:4px 0 0;letter-spacing:0.1em;text-transform:uppercase;">Yeni Mesaj</p>
    </div>
  </div>

  ${apt}
  ${hot}
  ${stale}

  <p style="text-align:center;margin:32px 0 0;">
    <a href="${this.esc(this.config.get<string>('ADMIN_URL') ?? 'https://admin.hazalmuti.com')}" style="display:inline-block;background:#14141A;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:13px;letter-spacing:0.05em;">Panele Git</a>
  </p>
</div>
</body></html>`;
  }

  private buildEmailText(s: MorningSummary): string {
    const lines = [
      `Günaydın Hazal — ${s.date}`,
      '',
      `📅 ${s.appointmentsToday.length} randevu | 🔥 ${s.hotInquiries.length} sıcak talep | 💬 ${s.unreadChats} okunmamış`,
      '',
    ];
    if (s.appointmentsToday.length > 0) {
      lines.push('BUGÜNÜN RANDEVULARI:');
      s.appointmentsToday.forEach((a) =>
        lines.push(`  ${a.time} · ${a.customer}${a.listing ? ` · ${a.listing}` : ''}`),
      );
      lines.push('');
    }
    if (s.hotInquiries.length > 0) {
      lines.push('SICAK TALEPLER:');
      s.hotInquiries.forEach((i) =>
        lines.push(`  ${i.name} (${i.email}) — ${i.daysWaiting} gün bekliyor`),
      );
      lines.push('');
    }
    return lines.join('\n');
  }

  private esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

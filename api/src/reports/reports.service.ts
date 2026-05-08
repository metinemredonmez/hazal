import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ListingStatus } from '@prisma/client';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

export interface MonthlyData {
  period: string;
  newListings: number;
  publishedListings: number;
  totalActive: number;
  totalSold: number;
  totalRented: number;
  totalInquiries: number;
  hotInquiries: number;
  appointments: number;
  totalViews: number;
  topViewed: Array<{ slug: string; titleTr: string; views: number }>;
  inquiriesByDistrict: Array<{ district: string; count: number }>;
  newSubscribers: number;
  aiCommentary: string;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private openai: OpenAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {
    const key = this.config.get<string>('OPENAI_API_KEY');
    if (key && key.length > 10) {
      this.openai = new OpenAI({ apiKey: key, timeout: 30_000 });
    }
  }

  /**
   * Generate the previous month's market report. Idempotent — if a run for
   * the same period already exists, returns it without regenerating.
   */
  async generateMonthly(opts: { force?: boolean } = {}): Promise<{ report: MonthlyData; emailed: boolean; runId: string }> {
    const now = new Date();
    // Previous month: from 1st of last month to 1st of this month
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    const existing = await this.prisma.reportRun.findUnique({
      where: { type_periodStart: { type: 'monthly', periodStart } },
    });
    if (existing && !opts.force) {
      return {
        report: existing.data as unknown as MonthlyData,
        emailed: !!existing.emailSentAt,
        runId: existing.id,
      };
    }

    const periodLabel = periodStart.toLocaleDateString('tr-TR', {
      month: 'long',
      year: 'numeric',
    });

    // Pull data in parallel
    const [
      newListings,
      publishedListings,
      totalActive,
      totalSold,
      totalRented,
      totalInquiries,
      hotInquiries,
      appointments,
      viewsAgg,
      topViewedRaw,
      inquiriesByDistrictRaw,
      newSubscribers,
    ] = await Promise.all([
      this.prisma.listing.count({
        where: { createdAt: { gte: periodStart, lt: periodEnd } },
      }),
      this.prisma.listing.count({
        where: {
          status: ListingStatus.ACTIVE,
          updatedAt: { gte: periodStart, lt: periodEnd },
        },
      }),
      this.prisma.listing.count({ where: { status: ListingStatus.ACTIVE } }),
      this.prisma.listing.count({ where: { status: ListingStatus.SOLD } }),
      this.prisma.listing.count({ where: { status: ListingStatus.RENTED } }),
      this.prisma.inquiry.count({
        where: { createdAt: { gte: periodStart, lt: periodEnd } },
      }),
      this.prisma.inquiry.count({
        where: { createdAt: { gte: periodStart, lt: periodEnd }, status: 'HOT' },
      }),
      this.prisma.appointment.count({
        where: { createdAt: { gte: periodStart, lt: periodEnd } },
      }),
      this.prisma.listing.aggregate({ _sum: { views: true } }),
      this.prisma.listing.findMany({
        orderBy: { views: 'desc' },
        take: 5,
        select: { slug: true, titleTr: true, views: true },
      }),
      this.prisma.$queryRaw<Array<{ district: string | null; count: bigint }>>`
        SELECT l."district" AS district, COUNT(i.*)::bigint AS count
        FROM "Inquiry" i
        LEFT JOIN "Listing" l ON l.id = i."listingId"
        WHERE i."createdAt" >= ${periodStart} AND i."createdAt" < ${periodEnd}
          AND l."district" IS NOT NULL
        GROUP BY l."district"
        ORDER BY count DESC
        LIMIT 5
      `,
      this.prisma.newsletterSubscriber.count({
        where: { createdAt: { gte: periodStart, lt: periodEnd }, unsubscribed: false },
      }),
    ]);

    const inquiriesByDistrict = inquiriesByDistrictRaw
      .filter((r) => r.district)
      .map((r) => ({ district: r.district as string, count: Number(r.count) }));

    const aiCommentary = await this.generateAiCommentary({
      periodLabel,
      newListings,
      totalInquiries,
      hotInquiries,
      appointments,
      newSubscribers,
      topDistrict: inquiriesByDistrict[0]?.district,
    });

    const report: MonthlyData = {
      period: periodLabel,
      newListings,
      publishedListings,
      totalActive,
      totalSold,
      totalRented,
      totalInquiries,
      hotInquiries,
      appointments,
      totalViews: viewsAgg._sum.views ?? 0,
      topViewed: topViewedRaw,
      inquiriesByDistrict,
      newSubscribers,
      aiCommentary,
    };

    // Save run (upsert)
    const run = await this.prisma.reportRun.upsert({
      where: { type_periodStart: { type: 'monthly', periodStart } },
      update: { data: report as unknown as object, periodEnd },
      create: {
        type: 'monthly',
        periodStart,
        periodEnd,
        data: report as unknown as object,
      },
    });

    // Send email
    let emailed = false;
    try {
      const adminEmail = this.config.get<string>('ADMIN_EMAIL') ?? 'hazalmuti@hotmail.com';
      const html = this.buildEmailHtml(report);
      const settings = await this.prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
      const tmpl = (settings?.emailTemplates as Record<string, unknown> | null)?.monthlyReport as
        | { subject?: { tr?: string }; body?: { tr?: string } }
        | undefined;
      const subject =
        (tmpl?.subject?.tr ?? 'Hazal Muti · {{month}} {{year}} Aylık Market Raporu')
          .replace(/\{\{month\}\}/g, periodStart.toLocaleDateString('tr-TR', { month: 'long' }))
          .replace(/\{\{year\}\}/g, String(periodStart.getFullYear()));

      await this.email.send({ to: adminEmail, subject, html });
      await this.prisma.reportRun.update({
        where: { id: run.id },
        data: { emailSentTo: adminEmail, emailSentAt: new Date() },
      });
      emailed = true;
      this.logger.log(`Monthly report emailed to ${adminEmail} for ${periodLabel}`);
    } catch (err) {
      this.logger.error(`Failed to email monthly report: ${(err as Error).message}`);
    }

    return { report, emailed, runId: run.id };
  }

  private async generateAiCommentary(input: {
    periodLabel: string;
    newListings: number;
    totalInquiries: number;
    hotInquiries: number;
    appointments: number;
    newSubscribers: number;
    topDistrict?: string;
  }): Promise<string> {
    if (!this.openai) {
      return `${input.periodLabel} özeti: ${input.newListings} yeni ilan, ${input.totalInquiries} talep (${input.hotInquiries} sıcak), ${input.appointments} randevu. ${
        input.topDistrict ? `En çok ilgi gören bölge: ${input.topDistrict}.` : ''
      }`;
    }
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              "Sen Hazal Muti Real Estate'in aylık market raporu yazarısın. Kısa ve profesyonel Türkçe yorum yap.",
          },
          {
            role: 'user',
            content: `Şu metrikleri 3-4 cümleyle yorumla — trend, dikkat çeken noktalar, gelecek ay için öneri:
Dönem: ${input.periodLabel}
Yeni ilan: ${input.newListings}
Talep sayısı: ${input.totalInquiries} (${input.hotInquiries} sıcak)
Randevu: ${input.appointments}
Yeni bülten abonesi: ${input.newSubscribers}
${input.topDistrict ? `En çok ilgi gören bölge: ${input.topDistrict}` : ''}`,
          },
        ],
        temperature: 0.6,
        max_tokens: 250,
      });
      return completion.choices[0]?.message?.content?.trim() ?? '';
    } catch (err) {
      this.logger.warn(`AI commentary failed: ${(err as Error).message}`);
      return '';
    }
  }

  private buildEmailHtml(r: MonthlyData): string {
    const tableRow = (label: string, value: number | string) => `
      <tr>
        <td style="padding: 8px 0; color: #6E6E73; font-size: 13px;">${label}</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 500;">${value}</td>
      </tr>
    `;
    const topListings = r.topViewed
      .map(
        (l) => `<li style="margin: 4px 0;"><strong>${l.titleTr}</strong> — ${l.views} görüntüleme</li>`,
      )
      .join('');
    const districtsList = r.inquiriesByDistrict
      .map((d) => `<li style="margin: 4px 0;">${d.district} — ${d.count} talep</li>`)
      .join('');
    return `
<div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #14141A;">
  <p style="text-transform: uppercase; letter-spacing: 0.4em; color: #C9A96E; font-size: 11px; margin: 0;">Hazal Muti · Real Estate</p>
  <h1 style="font-family: Georgia, serif; font-size: 28px; font-weight: 400; margin: 16px 0;">${r.period} Aylık Rapor</h1>

  ${r.aiCommentary ? `
  <div style="background: #F5F2EC; padding: 16px; border-left: 3px solid #C9A96E; margin: 16px 0;">
    <p style="margin: 0; font-size: 14px; line-height: 1.6;">${r.aiCommentary}</p>
  </div>
  ` : ''}

  <h2 style="font-family: Georgia, serif; font-size: 18px; margin-top: 32px;">Özet metrikler</h2>
  <table style="width: 100%; border-collapse: collapse;">
    ${tableRow('Yeni ilan eklendi', r.newListings)}
    ${tableRow('Aktif ilan toplamı', r.totalActive)}
    ${tableRow('Yeni talep (inquiry)', r.totalInquiries)}
    ${tableRow('Sıcak talep', r.hotInquiries)}
    ${tableRow('Randevu', r.appointments)}
    ${tableRow('Yeni bülten abonesi', r.newSubscribers)}
    ${tableRow('Toplam görüntüleme', r.totalViews)}
  </table>

  ${topListings ? `
  <h2 style="font-family: Georgia, serif; font-size: 18px; margin-top: 32px;">En çok görüntülenen ilanlar</h2>
  <ol style="font-size: 14px; padding-left: 20px;">${topListings}</ol>
  ` : ''}

  ${districtsList ? `
  <h2 style="font-family: Georgia, serif; font-size: 18px; margin-top: 32px;">İlgi gören bölgeler</h2>
  <ul style="font-size: 14px; padding-left: 20px;">${districtsList}</ul>
  ` : ''}

  <p style="color: #6E6E73; font-size: 11px; margin-top: 32px; text-align: center;">© ${new Date().getFullYear()} Hazal Muti Real Estate</p>
</div>
    `;
  }

  async listRuns(limit = 12) {
    return this.prisma.reportRun.findMany({
      orderBy: { periodStart: 'desc' },
      take: limit,
    });
  }
}

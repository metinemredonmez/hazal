/**
 * Seed default mail templates (Turkish, real estate flow).
 *
 * Run: npx tsx prisma/seed-mail-templates.ts
 *
 * Idempotent — only seeds if no templates exist OR if `--force` is passed.
 */
import { PrismaClient, MailTemplateCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedTemplate {
  name: string;
  category: MailTemplateCategory;
  subject: string;
  bodyHtml: string;
  variables?: Array<{ key: string; label: string; type?: string; default?: string }>;
  isDefault?: boolean;
}

const TEMPLATES: SeedTemplate[] = [
  {
    name: 'Yeni İlan Bildirimi',
    category: 'PROMOTION',
    subject: 'Yeni ilan: {{listingTitle}}',
    isDefault: true,
    variables: [
      { key: 'customerName', label: 'Müşteri adı', default: 'Değerli Müşterimiz' },
      { key: 'listingTitle', label: 'İlan başlığı' },
      { key: 'listingPrice', label: 'Fiyat' },
      { key: 'listingUrl', label: 'İlan linki' },
    ],
    bodyHtml: `<p>Sayın {{customerName}},</p>
<p>Portföyüme yeni eklenen, ilgilenebileceğinizi düşündüğüm bir ilan var:</p>
<p><strong>{{listingTitle}}</strong><br/>
Fiyat: <strong>{{listingPrice}}</strong></p>
<p><a href="{{listingUrl}}" style="display:inline-block;background:#14141A;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;">İlanı İncele</a></p>
<p>Detaylar veya yerinde inceleme için lütfen iletişime geçiniz.</p>
<p>Saygılarımla,<br/>Hazal Muti<br/>Hazal Muti Real Estate</p>`,
  },
  {
    name: 'Randevu Onayı',
    category: 'APPOINTMENT',
    subject: 'Randevu Onayı — {{appointmentDate}}',
    variables: [
      { key: 'customerName', label: 'Müşteri adı' },
      { key: 'appointmentDate', label: 'Tarih', type: 'date' },
      { key: 'appointmentTime', label: 'Saat' },
      { key: 'listingTitle', label: 'İlan başlığı' },
      { key: 'address', label: 'Adres' },
    ],
    bodyHtml: `<p>Sayın {{customerName}},</p>
<p>Randevunuz aşağıdaki bilgilerle onaylanmıştır:</p>
<table style="border-collapse:collapse;margin:16px 0;">
  <tr><td style="padding:6px 12px;border-bottom:1px solid #E5E2DD;color:#6E6E73;">Tarih</td><td style="padding:6px 12px;border-bottom:1px solid #E5E2DD;"><strong>{{appointmentDate}}</strong></td></tr>
  <tr><td style="padding:6px 12px;border-bottom:1px solid #E5E2DD;color:#6E6E73;">Saat</td><td style="padding:6px 12px;border-bottom:1px solid #E5E2DD;"><strong>{{appointmentTime}}</strong></td></tr>
  <tr><td style="padding:6px 12px;border-bottom:1px solid #E5E2DD;color:#6E6E73;">İlan</td><td style="padding:6px 12px;border-bottom:1px solid #E5E2DD;">{{listingTitle}}</td></tr>
  <tr><td style="padding:6px 12px;color:#6E6E73;">Adres</td><td style="padding:6px 12px;">{{address}}</td></tr>
</table>
<p>Görüşmek dileğiyle.</p>
<p>Saygılarımla,<br/>Hazal Muti</p>`,
  },
  {
    name: 'Randevu Hatırlatması',
    category: 'APPOINTMENT',
    subject: 'Hatırlatma · Yarın saat {{appointmentTime}} randevumuz var',
    variables: [
      { key: 'customerName', label: 'Müşteri adı' },
      { key: 'appointmentTime', label: 'Saat' },
      { key: 'address', label: 'Adres' },
    ],
    bodyHtml: `<p>Sayın {{customerName}},</p>
<p>Yarın saat <strong>{{appointmentTime}}</strong>'de yapılacak randevumuzu hatırlatmak isterim.</p>
<p>Buluşma yeri: {{address}}</p>
<p>Bir değişiklik olması durumunda lütfen mümkün olan en kısa sürede bildiriniz.</p>
<p>Saygılarımla,<br/>Hazal Muti</p>`,
  },
  {
    name: 'Fiyat Teklifi',
    category: 'OFFER',
    subject: 'Fiyat Teklifi — {{listingTitle}}',
    variables: [
      { key: 'customerName', label: 'Müşteri adı' },
      { key: 'listingTitle', label: 'İlan başlığı' },
      { key: 'listPrice', label: 'Liste fiyatı' },
      { key: 'offerPrice', label: 'Teklif edilen fiyat' },
      { key: 'validUntil', label: 'Geçerlilik tarihi', type: 'date' },
    ],
    bodyHtml: `<p>Sayın {{customerName}},</p>
<p>Görüşmemize istinaden aşağıdaki ilan için resmi fiyat teklifimi sunuyorum:</p>
<table style="border-collapse:collapse;margin:16px 0;">
  <tr><td style="padding:6px 12px;border-bottom:1px solid #E5E2DD;color:#6E6E73;">İlan</td><td style="padding:6px 12px;border-bottom:1px solid #E5E2DD;"><strong>{{listingTitle}}</strong></td></tr>
  <tr><td style="padding:6px 12px;border-bottom:1px solid #E5E2DD;color:#6E6E73;">Liste Fiyatı</td><td style="padding:6px 12px;border-bottom:1px solid #E5E2DD;">{{listPrice}}</td></tr>
  <tr><td style="padding:6px 12px;border-bottom:1px solid #E5E2DD;color:#6E6E73;">Teklif</td><td style="padding:6px 12px;border-bottom:1px solid #E5E2DD;color:#C9A96E;font-weight:600;">{{offerPrice}}</td></tr>
  <tr><td style="padding:6px 12px;color:#6E6E73;">Geçerlilik</td><td style="padding:6px 12px;">{{validUntil}}</td></tr>
</table>
<p>Bu teklif yukarıdaki tarihe kadar geçerlidir. Müzakere için her zaman müsaitim.</p>
<p>Saygılarımla,<br/>Hazal Muti</p>`,
  },
  {
    name: 'Müşteri Takip — 7 gün',
    category: 'FOLLOWUP',
    subject: 'Hâlâ ilgileniyor musunuz?',
    variables: [
      { key: 'customerName', label: 'Müşteri adı' },
      { key: 'listingTitle', label: 'İlan başlığı' },
    ],
    bodyHtml: `<p>Sayın {{customerName}},</p>
<p>Geçen hafta görüştüğümüz <strong>{{listingTitle}}</strong> hakkında düşüncelerinizi merak ettim.</p>
<p>İlanı görmek, sorularınızı yanıtlamak veya alternatif portföy önerileri için hazırım. Size uygun bir zaman bildirirseniz organize edebilirim.</p>
<p>Saygılarımla,<br/>Hazal Muti</p>`,
  },
  {
    name: 'Teşekkür',
    category: 'THANKYOU',
    subject: 'Teşekkürler · {{listingTitle}}',
    variables: [
      { key: 'customerName', label: 'Müşteri adı' },
      { key: 'listingTitle', label: 'İlan başlığı' },
    ],
    bodyHtml: `<p>Sayın {{customerName}},</p>
<p><strong>{{listingTitle}}</strong> sürecinde göstermiş olduğunuz güven için içtenlikle teşekkür ederim.</p>
<p>Yeni evinizde sağlık, mutluluk ve huzur dilerim. Gelecek tüm gayrimenkul ihtiyaçlarınızda yine yanınızda olmaktan memnuniyet duyarım.</p>
<p>Saygılarımla,<br/>Hazal Muti</p>`,
  },
];

async function main(force = false) {
  const existing = await prisma.mailTemplate.count();
  if (existing > 0 && !force) {
    console.log(`✓ ${existing} mail templates already exist. Use --force to overwrite.`);
    return;
  }

  if (force) {
    await prisma.mailTemplate.deleteMany({});
    console.log('🗑  Existing templates cleared (--force).');
  }

  for (const t of TEMPLATES) {
    await prisma.mailTemplate.create({
      data: {
        name: t.name,
        category: t.category,
        subject: t.subject,
        bodyHtml: t.bodyHtml,
        bodyText: stripHtml(t.bodyHtml),
        variables: t.variables ?? null,
        isDefault: t.isDefault ?? false,
      },
    });
    console.log(`  ✓ ${t.name}`);
  }
  console.log(`✓ ${TEMPLATES.length} mail templates seeded.`);
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

main(process.argv.includes('--force'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

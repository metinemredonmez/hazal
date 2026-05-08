/**
 * Non-destructive defaults update for Hazal Muti.
 * Run on the VPS: `cd /root/hazal-muti/api && yarn ts-node prisma/update-defaults.ts`
 *
 * - Sets brandName to "Hazal Muti" (fixes old "Hazal Mutin" / "Hazal Muti Real Estate")
 * - Fills phone/email/whatsapp if blank
 * - Fills hero/about/SEO Tr+En texts if blank
 * - Never overwrites a field Hazal has already filled in
 */
import 'dotenv/config';
import { PrismaClient, Currency } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULTS = {
  brandName: 'Hazal Muti',
  tagline: 'İstanbul lüks gayrimenkul · Kişisel danışmanlık',
  phone: '+90 532 512 76 28',
  whatsapp: '+90 532 512 76 28',
  email: 'info@hazalmuti.com',
  address: 'İstanbul, Türkiye',
  instagram: 'https://instagram.com/hazalmuti',
  linkedin: 'https://linkedin.com/in/hazalmuti',
  youtube: '',
  facebook: '',
  primaryColor: '#14141A',
  accentColor: '#C9A96E',
  defaultCurrency: Currency.TRY,
  defaultLocale: 'tr',
  heroTitleTr: "İstanbul'da seçkin gayrimenkul",
  heroTitleEn: 'Curated real estate in Istanbul',
  heroSubtitleTr: "Bebek'ten Bodrum'a — şahsen seçilmiş portföy.",
  heroSubtitleEn: 'From Bebek to Bodrum — a personally curated portfolio.',
  aboutTr:
    "Hazal Muti, İstanbul'un en prestijli semtlerinde lüks gayrimenkul danışmanlığı yapmaktadır. Müşterilerine birebir özen göstererek doğru ev, doğru zaman ve doğru fiyat üçgeninde rehberlik eder.",
  aboutEn:
    "Hazal Muti is a luxury real estate advisor focused on Istanbul's most prestigious neighborhoods. She works one-on-one with each client to find the right home at the right moment and the right price.",
  seoTitleTr: 'Hazal Muti · İstanbul lüks gayrimenkul',
  seoTitleEn: 'Hazal Muti · Istanbul luxury real estate',
  seoDescTr:
    'Bebek, Etiler, Cihangir, Bodrum — özenle seçilmiş satılık ve kiralık lüks daireler, villalar. Kişisel danışmanlık ve diskresyon.',
  seoDescEn:
    'Bebek, Etiler, Cihangir, Bodrum — hand-picked luxury homes and villas for sale and rent. Personal advisory with full discretion.',
};

async function main() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });

  if (!existing) {
    await prisma.siteSettings.create({ data: { id: 'singleton', ...DEFAULTS } });
    console.log('✓ Created site settings with defaults');
    return;
  }

  const updates: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(DEFAULTS)) {
    const current = (existing as Record<string, unknown>)[key];
    if (current === null || current === undefined || current === '') {
      updates[key] = val;
    }
  }
  // Force-fix legacy brand strings
  if (
    existing.brandName === 'Hazal Mutin' ||
    existing.brandName === 'Hazal Muti Real Estate' ||
    !existing.brandName
  ) {
    updates.brandName = 'Hazal Muti';
  }

  if (Object.keys(updates).length === 0) {
    console.log('ℹ All fields already set — nothing to update');
    return;
  }

  await prisma.siteSettings.update({ where: { id: 'singleton' }, data: updates });
  console.log(`✓ Updated ${Object.keys(updates).length} field(s):`);
  for (const k of Object.keys(updates)) console.log(`   · ${k}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

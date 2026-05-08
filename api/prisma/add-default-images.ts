/**
 * One-shot script: mevcut demo ilanlara default fotoğraf ekler.
 *
 * Sadece foto'su olmayan ilanlara dokunur (non-destructive).
 * Eşleşmeyi titleTr üstünden yapar.
 *
 * Çalıştırma:
 *   cd /var/www/hazal/api
 *   npx ts-node prisma/add-default-images.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function url(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/2400/1600`;
}

const SEEDS_BY_TITLE: Record<string, string[]> = {
  'Bebek Boğaz Manzaralı Lüks Daire': [
    'bebek-bosphorus-1',
    'bebek-bosphorus-2',
    'bebek-bosphorus-3',
    'bebek-bosphorus-4',
  ],
  'Yalıkavak Modern Lüks Villa': [
    'yalikavak-villa-1',
    'yalikavak-villa-2',
    'yalikavak-villa-3',
    'yalikavak-villa-4',
  ],
  'Cihangir Tarihi Apartman Dairesi': [
    'cihangir-heritage-1',
    'cihangir-heritage-2',
    'cihangir-heritage-3',
    'cihangir-heritage-4',
  ],
  'Alaçatı Taş Ev — Bahçeli': [
    'alacati-stone-1',
    'alacati-stone-2',
    'alacati-stone-3',
    'alacati-stone-4',
  ],
  'Etiler 3+1 Modern Daire': [
    'etiler-modern-1',
    'etiler-modern-2',
    'etiler-modern-3',
    'etiler-modern-4',
  ],
  'Tarabya Boğaz Manzaralı Triplex': [
    'tarabya-triplex-1',
    'tarabya-triplex-2',
    'tarabya-triplex-3',
    'tarabya-triplex-4',
  ],
  'Göcek Marina Lüks Apart': [
    'gocek-marina-1',
    'gocek-marina-2',
    'gocek-marina-3',
    'gocek-marina-4',
  ],
  'Zekeriyaköy Müstakil Villa — Bahçeli': [
    'zekeriyakoy-villa-1',
    'zekeriyakoy-villa-2',
    'zekeriyakoy-villa-3',
    'zekeriyakoy-villa-4',
  ],
};

// Bilinmeyen başlıklar için kategori bazlı fallback
const FALLBACK_BY_CATEGORY: Record<string, string[]> = {
  APARTMENT: ['apt-1', 'apt-2', 'apt-3', 'apt-4'],
  VILLA: ['villa-1', 'villa-2', 'villa-3', 'villa-4'],
  HOUSE: ['house-1', 'house-2', 'house-3', 'house-4'],
  LAND: ['land-1', 'land-2', 'land-3', 'land-4'],
  OFFICE: ['office-1', 'office-2', 'office-3', 'office-4'],
  COMMERCIAL: ['commercial-1', 'commercial-2', 'commercial-3', 'commercial-4'],
  OTHER: ['other-1', 'other-2', 'other-3', 'other-4'],
};

async function main() {
  const listings = await prisma.listing.findMany({
    include: { images: true },
  });

  let touched = 0;
  let skipped = 0;
  let totalImages = 0;

  for (const listing of listings) {
    if (listing.images.length > 0) {
      console.log(`⏭  ${listing.titleTr} — already has ${listing.images.length} images, skip`);
      skipped += 1;
      continue;
    }

    const seeds =
      SEEDS_BY_TITLE[listing.titleTr] ??
      FALLBACK_BY_CATEGORY[listing.category]?.map((s) => `${listing.id}-${s}`) ??
      [`${listing.id}-1`, `${listing.id}-2`, `${listing.id}-3`, `${listing.id}-4`];

    await prisma.$transaction(
      seeds.map((seed, idx) =>
        prisma.listingImage.create({
          data: {
            listingId: listing.id,
            url: url(seed),
            order: idx,
            isPrimary: idx === 0,
          },
        }),
      ),
    );

    touched += 1;
    totalImages += seeds.length;
    console.log(`✓ ${listing.titleTr} — ${seeds.length} images added`);
  }

  console.log('');
  console.log(`Summary: ${touched} listings updated, ${skipped} skipped, ${totalImages} images created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

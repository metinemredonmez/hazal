/**
 * İlan görsellerini /sample-apartments/ altındaki gerçek fotolarla değiştir.
 *
 * Run: npx tsx prisma/replace-listing-images.ts
 *
 * - Mevcut tüm ListingImage'leri siler (placeholder Unsplash)
 * - 37 fotoyu listings'lere eşit dağıtır (her ilana 5-6 foto)
 * - İlk foto isPrimary
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLE_FILES = [
  'DSC_0214.jpg',
  'DSC_0241.jpg',
  'DSC_0247.jpg',
  'DSC_0248.jpg',
  'DSC_0252.jpg',
  'DSC_0256.jpg',
  'DSC_0258.jpg',
  'DSC_0260.jpg',
  'DSC_0263.jpg',
  'DSC_0266.jpg',
  'DSC_0268.jpg',
  'DSC_0270.jpg',
  'DSC_0271.jpg',
  'DSC_0272.jpg',
  'DSC_0273.jpg',
  'DSC_0276.jpg',
  'DSC_0278.jpg',
  'DSC_0279.jpg',
  'DSC_0280.jpg',
  'DSC_0281.jpg',
  'DSC_0283.jpg',
  'DSC_0284.jpg',
  'DSC_0285.jpg',
  'DSC_0287.jpg',
  'DSC_0288.jpg',
  'DSC_0289.jpg',
  'DSC_0290.jpg',
  'DSC_0291.jpg',
  'DSC_0292.jpg',
  'DSC_0295.jpg',
  'DSC_0297.jpg',
  'DSC_0298.jpg',
  'DSC_0299.jpg',
  'DSC_0300.jpg',
  'DSC_0301.jpg',
  'DSC_0302.jpg',
  'DSC_0303.jpg',
];

const BASE = process.env.WEB_BASE_URL ?? 'https://hazalmuti.com';

async function main() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, slug: true, titleTr: true },
  });
  if (listings.length === 0) {
    console.log('Hiç ilan yok, işlem yapılmadı.');
    return;
  }

  const photosPerListing = Math.max(3, Math.floor(SAMPLE_FILES.length / listings.length));
  console.log(
    `${listings.length} ilan, ${SAMPLE_FILES.length} foto → ilan başına ~${photosPerListing}`,
  );

  // Eski görselleri sil
  const deleted = await prisma.listingImage.deleteMany({});
  console.log(`🗑  Silinen eski görsel: ${deleted.count}`);

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    // Her ilana benzersiz bir slice ata; foto bitince başa dön (loop)
    const startIdx = (i * photosPerListing) % SAMPLE_FILES.length;
    const slice: string[] = [];
    for (let j = 0; j < photosPerListing; j++) {
      slice.push(SAMPLE_FILES[(startIdx + j) % SAMPLE_FILES.length]);
    }

    await prisma.$transaction(
      slice.map((file, idx) =>
        prisma.listingImage.create({
          data: {
            listingId: listing.id,
            url: `${BASE}/sample-apartments/${file}`,
            order: idx,
            isPrimary: idx === 0,
          },
        }),
      ),
    );

    console.log(`  ✓ ${listing.titleTr.slice(0, 40)} — ${slice.length} foto eklendi`);
  }

  console.log(`\n✅ Tamamlandı. ${listings.length} ilana toplam ${listings.length * photosPerListing} foto eklendi.`);
  console.log(`URL örneği: ${BASE}/sample-apartments/${SAMPLE_FILES[0]}`);
}

main()
  .catch((e) => {
    console.error('❌', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

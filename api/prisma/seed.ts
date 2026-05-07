import 'dotenv/config';
import { PrismaClient, ListingStatus, ListingType, ListingCategory, Currency } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import slugify from 'slugify';

const prisma = new PrismaClient();

interface DemoListing {
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  price: number;
  currency: Currency;
  type: ListingType;
  category: ListingCategory;
  bedrooms?: number;
  bathrooms?: number;
  areaM2?: number;
  city?: string;
  district?: string;
  status: ListingStatus;
  featured?: boolean;
}

const DEMO_LISTINGS: DemoListing[] = [
  {
    titleTr: 'Bebek Boğaz Manzaralı Lüks Daire',
    titleEn: 'Bebek Bosphorus View Luxury Apartment',
    descriptionTr:
      "İstanbul Boğazı'nın panoramik manzarasına sahip bu eşsiz daire, Bebek'in en prestijli noktasında yer almaktadır. 240 m² brüt alanı, geniş yaşam alanları, master ebeveyn yatak odası ve özel teras ile lüksü ve konforu bir araya getiriyor. Akıllı ev sistemi, italyan mutfak, doğal mermer banyolar.",
    descriptionEn:
      "Set in Bebek's most prestigious location, this exceptional apartment offers panoramic views of the Bosphorus. 240 m² of refined living, wide reception spaces, a master suite, and a private terrace deliver effortless luxury. Smart-home automation, Italian kitchen, natural-stone bathrooms.",
    price: 45000000,
    currency: Currency.TRY,
    type: ListingType.SALE,
    category: ListingCategory.APARTMENT,
    bedrooms: 4,
    bathrooms: 3,
    areaM2: 240,
    city: 'İstanbul',
    district: 'Beşiktaş / Bebek',
    status: ListingStatus.ACTIVE,
    featured: true,
  },
  {
    titleTr: 'Yalıkavak Modern Lüks Villa',
    titleEn: 'Yalıkavak Modern Luxury Villa',
    descriptionTr:
      "Bodrum Yalıkavak'ta deniz manzaralı, özel havuzlu modern villa. 5 yatak odası, 6 banyo, geniş bahçe ve infinity havuz. Cam cepheli yaşam alanı, açık mutfak, hizmetli odası, kapalı garaj. Marina'ya 5 dakika.",
    descriptionEn:
      "Modern sea-view villa with a private infinity pool in Yalıkavak, Bodrum. Five bedrooms, six bathrooms, expansive garden, and a glass-fronted living wing. Open kitchen, staff quarters, covered garage. Five minutes to the marina.",
    price: 2950000,
    currency: Currency.USD,
    type: ListingType.SALE,
    category: ListingCategory.VILLA,
    bedrooms: 5,
    bathrooms: 6,
    areaM2: 480,
    city: 'Muğla',
    district: 'Bodrum / Yalıkavak',
    status: ListingStatus.ACTIVE,
    featured: true,
  },
  {
    titleTr: 'Cihangir Tarihi Apartman Dairesi',
    titleEn: 'Cihangir Heritage Apartment',
    descriptionTr:
      "Cihangir'in karakterini koruyan tarihi apartmanda restore edilmiş, ferah daire. Yüksek tavanlar, ahşap parke, orijinal detaylar. 3 yatak odası, çalışma odası, geniş salon. Boğaz manzaralı balkon. Galata'ya yürüme mesafesi.",
    descriptionEn:
      "A restored apartment in a heritage Cihangir building. High ceilings, original woodwork, three bedrooms, a study, and a generous reception room. Bosphorus-view balcony. Walking distance to Galata.",
    price: 950000,
    currency: Currency.USD,
    type: ListingType.SALE,
    category: ListingCategory.APARTMENT,
    bedrooms: 3,
    bathrooms: 2,
    areaM2: 165,
    city: 'İstanbul',
    district: 'Beyoğlu / Cihangir',
    status: ListingStatus.ACTIVE,
    featured: true,
  },
  {
    titleTr: 'Alaçatı Taş Ev — Bahçeli',
    titleEn: 'Alaçatı Stone House with Garden',
    descriptionTr:
      "Alaçatı'nın taş sokaklarında özenle restore edilmiş 19. yüzyıl Rum evi. 3 yatak odası, taş ocak, iç avlu ve özel havuz. Otantik mimari, modern konfor. Yel değirmenleri ve plajlara yürüme mesafesi.",
    descriptionEn:
      "A meticulously restored 19th-century Greek house on Alaçatı's signature stone streets. Three bedrooms, a stone fireplace, an inner courtyard, and a private pool. Authentic architecture meets modern comfort.",
    price: 1450000,
    currency: Currency.EUR,
    type: ListingType.SALE,
    category: ListingCategory.HOUSE,
    bedrooms: 3,
    bathrooms: 3,
    areaM2: 220,
    city: 'İzmir',
    district: 'Çeşme / Alaçatı',
    status: ListingStatus.ACTIVE,
    featured: true,
  },
  {
    titleTr: 'Etiler 3+1 Modern Daire',
    titleEn: 'Etiler Modern 3-Bedroom Apartment',
    descriptionTr:
      "Etiler'in sakin sokaklarında yenilenmiş 3+1 daire. 165 m², ışık alan geniş salon, açık mutfak, ebeveyn banyolu yatak odası. Site içinde, 24 saat güvenlik, kapalı otopark. Akmerkez ve Etiler'in en iyi restoranlarına yürüme mesafesi.",
    descriptionEn:
      "A renovated three-bedroom apartment on a quiet Etiler street. 165 m², bright reception, open kitchen, en-suite master. Gated complex with 24-hour security and underground parking. Walk to Akmerkez and Etiler's restaurants.",
    price: 18500000,
    currency: Currency.TRY,
    type: ListingType.SALE,
    category: ListingCategory.APARTMENT,
    bedrooms: 3,
    bathrooms: 2,
    areaM2: 165,
    city: 'İstanbul',
    district: 'Beşiktaş / Etiler',
    status: ListingStatus.ACTIVE,
  },
  {
    titleTr: 'Tarabya Boğaz Manzaralı Triplex',
    titleEn: 'Tarabya Bosphorus-View Triplex',
    descriptionTr:
      "Tarabya'da kiralık triplex daire. Üç katta 320 m² yaşam alanı, 4 yatak odası, 4 banyo, geniş teras, özel asansör, kapalı otopark. Boğaz tam manzaralı, eşyalı ve giriş hazır.",
    descriptionEn:
      "A triplex apartment for rent in Tarabya. 320 m² across three floors, four bedrooms, four bathrooms, an expansive terrace, private elevator, and parking. Full Bosphorus views; furnished and move-in ready.",
    price: 250000,
    currency: Currency.TRY,
    type: ListingType.RENT,
    category: ListingCategory.APARTMENT,
    bedrooms: 4,
    bathrooms: 4,
    areaM2: 320,
    city: 'İstanbul',
    district: 'Sarıyer / Tarabya',
    status: ListingStatus.ACTIVE,
  },
  {
    titleTr: 'Göcek Marina Lüks Apart',
    titleEn: 'Göcek Marina Luxury Apartment',
    descriptionTr:
      "Göcek Marina'nın hemen yanında kiralık eşyalı daire. 2 yatak odası, geniş teras, denize sıfır site içinde havuz ve plaj erişimi. Tekne sahipleri için ideal yazlık konumu.",
    descriptionEn:
      "A furnished apartment for rent next to Göcek Marina. Two bedrooms, a wide terrace, pool and beach access in a seafront complex. Ideal summer base for boat owners.",
    price: 4500,
    currency: Currency.EUR,
    type: ListingType.RENT,
    category: ListingCategory.APARTMENT,
    bedrooms: 2,
    bathrooms: 2,
    areaM2: 110,
    city: 'Muğla',
    district: 'Fethiye / Göcek',
    status: ListingStatus.ACTIVE,
  },
  {
    titleTr: 'Zekeriyaköy Müstakil Villa — Bahçeli',
    titleEn: 'Zekeriyaköy Detached Villa with Garden',
    descriptionTr:
      "Zekeriyaköy'de doğa içinde 5+2 müstakil villa. 850 m² arsa, 420 m² yaşam alanı, özel havuz, sauna, kapalı garaj. Ana yatak odası geniş giyinme odası ve mermer banyolu.",
    descriptionEn:
      "A detached villa in Zekeriyaköy set in nature. 850 m² plot, 420 m² living area, private pool, sauna, indoor garage. Master suite with a generous dressing room and marble bathroom.",
    price: 4200000,
    currency: Currency.USD,
    type: ListingType.SALE,
    category: ListingCategory.VILLA,
    bedrooms: 5,
    bathrooms: 4,
    areaM2: 420,
    city: 'İstanbul',
    district: 'Sarıyer / Zekeriyaköy',
    status: ListingStatus.ACTIVE,
  },
];

async function generateUniqueSlug(base: string): Promise<string> {
  const baseSlug = slugify(base, { lower: true, strict: true, trim: true }) || 'listing';
  let candidate = baseSlug;
  let counter = 1;
  while (await prisma.listing.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
  return candidate;
}

async function main() {
  // 1) Admin user
  const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
  const name = process.env.ADMIN_NAME ?? 'Hazal Muti';
  const phone = process.env.ADMIN_PHONE ?? '+905325127628';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, name, phone },
    create: { email, passwordHash, name, phone },
  });
  console.log(`✓ Admin seeded: ${email} (${phone})`);

  // 2) Site settings
  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: { brandName: 'Hazal Muti Real Estate' },
    create: {
      id: 'singleton',
      brandName: 'Hazal Muti Real Estate',
      tagline: 'Premium properties, personal service.',
      defaultLocale: 'tr',
      heroTitleTr: 'Hayalinizdeki Eve Bir Adım Daha Yakın',
      heroTitleEn: 'One Step Closer to Your Dream Home',
      heroSubtitleTr: 'Seçkin ilanlar, kişisel hizmet.',
      heroSubtitleEn: 'Curated listings, personal service.',
      aboutTr: 'Hazal Muti hakkında metin buraya...',
      aboutEn: 'About Hazal Muti text here...',
    },
  });
  console.log('✓ Site settings seeded');

  // 3) Demo listings (only if none exist OR SEED_DEMO=force)
  const existingCount = await prisma.listing.count();
  const force = process.env.SEED_DEMO === 'force';

  if (existingCount > 0 && !force) {
    console.log(`ℹ Skipping demo listings — ${existingCount} already exist (set SEED_DEMO=force to re-seed)`);
    return;
  }

  if (force) {
    await prisma.listing.deleteMany({});
    console.log('⚠ Cleared existing listings (SEED_DEMO=force)');
  }

  let created = 0;
  for (const demo of DEMO_LISTINGS) {
    const slug = await generateUniqueSlug(demo.titleEn);
    await prisma.listing.create({ data: { ...demo, slug } });
    created += 1;
  }
  console.log(`✓ Created ${created} demo listings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

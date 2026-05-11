import 'dotenv/config';
import {
  PrismaClient,
  ListingStatus,
  ListingType,
  ListingCategory,
  Currency,
  AdminRole,
  InquiryStatus,
  ChatSender,
  ChatChannel,
  CustomerStatus,
  CustomerSource,
  CalendarEventType,
  CalendarEventStatus,
  DocumentCategory,
  BlogPostStatus,
  BlogPostKind,
  EmailDirection,
  EmailStatus,
  MailTemplateCategory,
} from '@prisma/client';
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
  imageSeeds?: string[];
}

function seedToImageUrl(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/2400/1600`;
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
    imageSeeds: ['bebek-bosphorus-1', 'bebek-bosphorus-2', 'bebek-bosphorus-3', 'bebek-bosphorus-4'],
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
    imageSeeds: ['yalikavak-villa-1', 'yalikavak-villa-2', 'yalikavak-villa-3', 'yalikavak-villa-4'],
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
    imageSeeds: ['cihangir-heritage-1', 'cihangir-heritage-2', 'cihangir-heritage-3', 'cihangir-heritage-4'],
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
    imageSeeds: ['alacati-stone-1', 'alacati-stone-2', 'alacati-stone-3', 'alacati-stone-4'],
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
    imageSeeds: ['etiler-modern-1', 'etiler-modern-2', 'etiler-modern-3', 'etiler-modern-4'],
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
    imageSeeds: ['tarabya-triplex-1', 'tarabya-triplex-2', 'tarabya-triplex-3', 'tarabya-triplex-4'],
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
    imageSeeds: ['gocek-marina-1', 'gocek-marina-2', 'gocek-marina-3', 'gocek-marina-4'],
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
    imageSeeds: ['zekeriyakoy-villa-1', 'zekeriyakoy-villa-2', 'zekeriyakoy-villa-3', 'zekeriyakoy-villa-4'],
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
    update: { passwordHash, name, phone, role: AdminRole.SUPER_ADMIN },
    create: { email, passwordHash, name, phone, role: AdminRole.SUPER_ADMIN },
  });
  console.log(`✓ Super Admin seeded: ${email} (${phone})`);

  // 2) Site settings — non-destructive: only fill empty fields
  const existingSettings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  const SETTINGS_DEFAULTS = {
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
    heroTitleTr: 'İstanbul\'da seçkin gayrimenkul',
    heroTitleEn: 'Curated real estate in Istanbul',
    heroSubtitleTr: 'Bebek\'ten Bodrum\'a — şahsen seçilmiş portföy.',
    heroSubtitleEn: 'From Bebek to Bodrum — a personally curated portfolio.',
    aboutTr:
      'Hazal Muti, İstanbul\'un en prestijli semtlerinde lüks gayrimenkul danışmanlığı yapmaktadır. Müşterilerine birebir özen göstererek doğru ev, doğru zaman ve doğru fiyat üçgeninde rehberlik eder.',
    aboutEn:
      'Hazal Muti is a luxury real estate advisor focused on Istanbul\'s most prestigious neighborhoods. She works one-on-one with each client to find the right home at the right moment and the right price.',
    seoTitleTr: 'Hazal Muti · İstanbul lüks gayrimenkul',
    seoTitleEn: 'Hazal Muti · Istanbul luxury real estate',
    seoDescTr:
      'Bebek, Etiler, Cihangir, Bodrum — özenle seçilmiş satılık ve kiralık lüks daireler, villalar. Kişisel danışmanlık ve diskresyon.',
    seoDescEn:
      'Bebek, Etiler, Cihangir, Bodrum — hand-picked luxury homes and villas for sale and rent. Personal advisory with full discretion.',
  };

  if (!existingSettings) {
    await prisma.siteSettings.create({ data: { id: 'singleton', ...SETTINGS_DEFAULTS } });
    console.log('✓ Site settings created with defaults');
  } else {
    // Only fill blanks; don't overwrite anything Hazal has set
    const fillBlanks: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(SETTINGS_DEFAULTS)) {
      const current = (existingSettings as Record<string, unknown>)[key];
      if (current === null || current === undefined || current === '') {
        fillBlanks[key] = val;
      }
    }
    // Always fix the brand if it still says the old value
    if (existingSettings.brandName === 'Hazal Mutin' || existingSettings.brandName === 'Hazal Muti Real Estate') {
      fillBlanks.brandName = 'Hazal Muti';
    }
    if (Object.keys(fillBlanks).length > 0) {
      await prisma.siteSettings.update({ where: { id: 'singleton' }, data: fillBlanks });
      console.log(`✓ Site settings: filled ${Object.keys(fillBlanks).length} blank field(s)`);
    } else {
      console.log('ℹ Site settings already complete');
    }
  }

  // 3) Demo listings (only if none exist OR SEED_DEMO=force)
  const existingCount = await prisma.listing.count();
  const force = process.env.SEED_DEMO === 'force';

  if (existingCount > 0 && !force) {
    console.log(`ℹ Skipping demo listings — ${existingCount} already exist (set SEED_DEMO=force to re-seed)`);
  } else {
    if (force) {
      await prisma.listing.deleteMany({});
      console.log('⚠ Cleared existing listings (SEED_DEMO=force)');
    }

    let created = 0;
    for (const demo of DEMO_LISTINGS) {
      const slug = await generateUniqueSlug(demo.titleEn);
      const { imageSeeds, ...rest } = demo;
      const images = (imageSeeds ?? []).map((seed, idx) => ({
        url: seedToImageUrl(seed),
        order: idx,
        isPrimary: idx === 0,
      }));
      await prisma.listing.create({
        data: {
          ...rest,
          slug,
          images: images.length > 0 ? { create: images } : undefined,
        },
      });
      created += 1;
    }
    console.log(`✓ Created ${created} demo listings (with images)`);
  }

  // 4) Demo appointments (only if none exist OR SEED_DEMO=force)
  const existingApptCount = await prisma.appointment.count();
  if (existingApptCount > 0 && !force) {
    console.log(`ℹ Skipping demo appointments — ${existingApptCount} already exist`);
  } else {
    if (force) {
      await prisma.appointment.deleteMany({});
      console.log('⚠ Cleared existing appointments (SEED_DEMO=force)');
    }

    const listings = await prisma.listing.findMany({ take: 4, orderBy: { createdAt: 'desc' } });
    const now = new Date();
    const day = (offsetDays: number, hour: number, min = 0): Date => {
      const d = new Date(now);
      d.setDate(d.getDate() + offsetDays);
      d.setHours(hour, min, 0, 0);
      return d;
    };

    const DEMO_APPTS: Array<{
      startsAt: Date;
      durationMin: number;
      name: string;
      email: string;
      phone: string;
      listingId?: string;
      status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
      location?: string;
      notes?: string;
    }> = [
      {
        startsAt: day(1, 11, 0), // yarın 11:00
        durationMin: 60,
        name: 'Ayşe Yılmaz',
        email: 'ayse.yilmaz@example.com',
        phone: '+90 532 111 22 33',
        listingId: listings[0]?.id,
        status: 'CONFIRMED',
        location: listings[0]?.district ?? 'Bebek, İstanbul',
        notes: 'Müşteri Boğaz manzaralı seçenekleri görmek istiyor. Saat 11:00 dairede buluşma.',
      },
      {
        startsAt: day(2, 14, 30), // 2 gün sonra 14:30
        durationMin: 90,
        name: 'Mehmet Demir',
        email: 'mehmet@example.com',
        phone: '+90 533 444 55 66',
        listingId: listings[1]?.id,
        status: 'SCHEDULED',
        location: listings[1]?.district ?? 'Yalıkavak, Bodrum',
        notes: 'Yatırım amaçlı bakıyor. Eşi de katılacak.',
      },
      {
        startsAt: day(3, 16, 0), // 3 gün sonra 16:00
        durationMin: 60,
        name: 'Selin Aydın',
        email: 'selin.aydin@example.com',
        phone: '+90 535 777 88 99',
        listingId: listings[2]?.id,
        status: 'SCHEDULED',
        location: listings[2]?.district ?? 'Cihangir, İstanbul',
        notes: 'Tarihi yapı + restorasyon detayları öğrenmek istiyor.',
      },
      {
        startsAt: day(7, 10, 0), // 1 hafta sonra
        durationMin: 60,
        name: 'James Thompson',
        email: 'james@example.com',
        phone: '+44 7700 900123',
        listingId: listings[3]?.id,
        status: 'SCHEDULED',
        location: listings[3]?.district ?? 'Etiler, İstanbul',
        notes: 'İngiliz yatırımcı. EN sunum gerekecek.',
      },
      {
        startsAt: day(-2, 15, 0), // 2 gün önce — geçmiş
        durationMin: 60,
        name: 'Fatma Kaya',
        email: 'fatma@example.com',
        phone: '+90 536 333 44 55',
        listingId: listings[0]?.id,
        status: 'COMPLETED',
        location: listings[0]?.district ?? 'Bebek',
        notes: 'Görüşme tamamlandı, müşteri 2 hafta düşünmek istiyor.',
      },
    ];

    let apptCreated = 0;
    for (const a of DEMO_APPTS) {
      await prisma.appointment.create({ data: a });
      apptCreated += 1;
    }
    console.log(`✓ Created ${apptCreated} demo appointments`);
  }

  // ============================================================
  // 5) Customers (CRM) — idempotent
  // ============================================================
  if ((await prisma.customer.count()) === 0 || force) {
    if (force) await prisma.customer.deleteMany({});
    await prisma.customer.createMany({
      data: [
        {
          name: 'Ayşe Yılmaz',
          email: 'ayse.yilmaz@example.com',
          phone: '+90 532 111 22 33',
          whatsapp: '+90 532 111 22 33',
          status: CustomerStatus.ACTIVE,
          source: CustomerSource.WEB,
          budget: 50000000 as any,
          budgetCurrency: Currency.TRY,
          preferences: 'Boğaz manzaralı, 3+1 minimum, Bebek/Etiler bölgesi',
          interestedIn: ['APARTMENT'],
          districts: ['Bebek', 'Etiler', 'Cihangir'],
          preferredContact: 'whatsapp',
          score: 85,
          scoreNote: 'Bütçe net, hızlı karar veriyor',
          tags: ['VIP', 'Sıcak Lead'],
          notes: 'Boğaz manzarası şart. Eşi de görüşmelere katılıyor.',
        },
        {
          name: 'Mehmet Demir',
          email: 'mehmet@example.com',
          phone: '+90 533 444 55 66',
          status: CustomerStatus.LEAD,
          source: CustomerSource.REFERRAL,
          budget: 3000000 as any,
          budgetCurrency: Currency.USD,
          preferences: 'Yatırım amaçlı villa, Bodrum',
          interestedIn: ['VILLA'],
          districts: ['Yalıkavak', 'Türkbükü'],
          preferredContact: 'phone',
          score: 65,
          tags: ['Yatırımcı'],
          notes: 'Eşi ile birlikte değerlendiriyor.',
        },
        {
          name: 'Selin Aydın',
          email: 'selin.aydin@example.com',
          phone: '+90 535 777 88 99',
          status: CustomerStatus.CLIENT,
          source: CustomerSource.SOCIAL,
          budget: 1200000 as any,
          budgetCurrency: Currency.USD,
          preferences: 'Tarihi yapı, karakter, Cihangir/Galata',
          interestedIn: ['APARTMENT'],
          districts: ['Cihangir', 'Galata'],
          preferredContact: 'email',
          score: 90,
          tags: ['Satış Tamamlandı', '2026'],
          notes: 'Cihangir Heritage daire satın aldı. Referans veriyor.',
        },
        {
          name: 'James Thompson',
          email: 'james@example.com',
          phone: '+44 7700 900123',
          status: CustomerStatus.ACTIVE,
          source: CustomerSource.WEB,
          budget: 5000000 as any,
          budgetCurrency: Currency.USD,
          preferences: 'Investment property, English-speaking advisor needed',
          interestedIn: ['APARTMENT', 'VILLA'],
          districts: ['Bebek', 'Etiler'],
          preferredContact: 'email',
          score: 70,
          tags: ['Yabancı', 'EN'],
          notes: 'UK based investor. Needs EN documentation.',
        },
        {
          name: 'Fatma Kaya',
          email: 'fatma@example.com',
          phone: '+90 536 333 44 55',
          status: CustomerStatus.INACTIVE,
          source: CustomerSource.PHONE,
          budget: 25000000 as any,
          budgetCurrency: Currency.TRY,
          preferences: 'Aile için, 4+1, bahçeli',
          interestedIn: ['VILLA', 'HOUSE'],
          districts: ['Zekeriyaköy', 'Sarıyer'],
          preferredContact: 'phone',
          score: 40,
          tags: ['Soğuk Lead'],
          notes: '2 hafta düşünme süresi istedi, geri dönmedi.',
        },
        {
          name: 'Burak Şahin',
          email: 'burak.sahin@example.com',
          phone: '+90 537 222 11 00',
          status: CustomerStatus.LEAD,
          source: CustomerSource.SOCIAL,
          preferences: 'Kiralık, eşyalı, yazlık 2-3 ay',
          interestedIn: ['APARTMENT'],
          districts: ['Göcek', 'Yalıkavak'],
          preferredContact: 'whatsapp',
          score: 50,
          tags: ['Kiralık'],
        },
        {
          name: 'Elif Çelik',
          email: 'elif.celik@example.com',
          phone: '+90 538 999 88 77',
          status: CustomerStatus.LOST,
          source: CustomerSource.WEB,
          score: 20,
          tags: ['Kaybedildi'],
          notes: 'Başka emlakçıdan aldı.',
        },
      ],
    });
    console.log('✓ Created 7 demo customers');
  } else {
    console.log('ℹ Customers already exist, skipped');
  }

  const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'asc' }, take: 10 });
  const listingsList = await prisma.listing.findMany({ orderBy: { createdAt: 'asc' }, take: 10 });

  // ============================================================
  // 6) Inquiries (talepler) — idempotent
  // ============================================================
  if ((await prisma.inquiry.count()) === 0 || force) {
    if (force) await prisma.inquiry.deleteMany({});
    const inquiriesData = [
      {
        name: 'Ayşe Yılmaz',
        email: 'ayse.yilmaz@example.com',
        phone: '+90 532 111 22 33',
        message: 'Bebek dairesi hâlâ müsait mi? Bu hafta görmek istiyorum.',
        status: InquiryStatus.HOT,
        notes: 'Aradı, Cuma 11:00 randevu verildi.',
        listingId: listingsList[0]?.id,
        customerId: customers[0]?.id,
      },
      {
        name: 'Mehmet Demir',
        email: 'mehmet@example.com',
        phone: '+90 533 444 55 66',
        message: 'Yalıkavak villayı yatırım amaçlı düşünüyorum. Detaylı bilgi alabilir miyim?',
        status: InquiryStatus.CONTACTED,
        notes: 'WhatsApp üzerinden cevap verildi, broşür gönderildi.',
        listingId: listingsList[1]?.id,
        customerId: customers[1]?.id,
      },
      {
        name: 'Selin Aydın',
        email: 'selin.aydin@example.com',
        phone: '+90 535 777 88 99',
        message: 'Cihangir dairesinin tapu durumu ve aidat bilgilerini öğrenebilir miyim?',
        status: InquiryStatus.CLOSED,
        notes: 'Satış tamamlandı 🎉',
        listingId: listingsList[2]?.id,
        customerId: customers[2]?.id,
      },
      {
        name: 'James Thompson',
        email: 'james@example.com',
        phone: '+44 7700 900123',
        message: 'Hi, I am interested in the Etiler apartment. Could we schedule a viewing this weekend? I prefer English-speaking communication.',
        status: InquiryStatus.NEW,
        listingId: listingsList[4]?.id,
        customerId: customers[3]?.id,
      },
      {
        name: 'Burak Şahin',
        email: 'burak.sahin@example.com',
        phone: '+90 537 222 11 00',
        message: 'Göcek dairesi Temmuz–Eylül için müsait mi? Eşyalı kiralık arıyorum.',
        status: InquiryStatus.NEW,
        listingId: listingsList[6]?.id,
        customerId: customers[5]?.id,
      },
      {
        name: 'Ziya Öztürk',
        email: 'ziya.ozturk@example.com',
        phone: '+90 539 555 66 77',
        message: 'Alaçatı taş ev için fiyatta esneklik var mı? Peşin ödeme yapabilirim.',
        status: InquiryStatus.HOT,
        listingId: listingsList[3]?.id,
      },
      {
        name: 'Nilgün Arslan',
        email: 'nilgun@example.com',
        phone: '+90 541 888 77 66',
        message: 'Portföyünüzdeki diğer satılık villalar hakkında bilgi almak istiyorum.',
        status: InquiryStatus.NEW,
      },
    ];
    for (const i of inquiriesData) {
      await prisma.inquiry.create({ data: i });
    }
    console.log(`✓ Created ${inquiriesData.length} demo inquiries`);
  } else {
    console.log('ℹ Inquiries already exist, skipped');
  }

  // ============================================================
  // 7) Contacts (kişi rehberi — iş kontakları)
  // ============================================================
  if ((await prisma.contact.count()) === 0 || force) {
    if (force) await prisma.contact.deleteMany({});
    await prisma.contact.createMany({
      data: [
        {
          name: 'Av. Murat Korkmaz',
          phone: '+90 532 998 12 34',
          email: 'murat@korkmazhukuk.com',
          company: 'Korkmaz Hukuk Bürosu',
          role: 'Gayrimenkul Avukatı',
          category: 'Avukat',
          notes: 'Tapu işlemleri ve sözleşme kontrolü.',
          tags: ['Tapu', 'Sözleşme'],
          favorite: true,
        },
        {
          name: 'Onur Beyaz',
          phone: '+90 533 776 54 32',
          email: 'onur@beyazfoto.com',
          company: 'Beyaz Fotoğraf Stüdyo',
          role: 'Emlak Fotoğrafçısı',
          category: 'Fotoğraf',
          notes: 'Drone + iç mekan + 3D tour. 1 gün önceden randevu.',
          tags: ['Foto', 'Drone'],
          favorite: true,
        },
        {
          name: 'Banu Aktaş',
          phone: '+90 535 112 33 44',
          email: 'banu@aktasdekorasyon.com',
          company: 'Aktaş İç Mimari',
          role: 'İç Mimar',
          category: 'Dekorasyon',
          notes: 'Boş dairelere staging yapıyor.',
          tags: ['Staging'],
        },
        {
          name: 'Cem Tunç',
          phone: '+90 537 555 99 00',
          email: 'cem@tuncekspertiz.com',
          company: 'Tunç Ekspertiz',
          role: 'Gayrimenkul Değerleme Uzmanı',
          category: 'Ekspertiz',
          tags: ['Bankacılık'],
        },
        {
          name: 'Volkan Şenol',
          phone: '+90 542 333 22 11',
          company: 'Şenol Tadilat',
          role: 'Tadilat Ustası',
          category: 'Tadilat',
          notes: 'Acil tadilat işlerinde 24 saat içinde gelebiliyor.',
          tags: ['Acil', 'Tadilat'],
        },
      ],
    });
    console.log('✓ Created 5 demo contacts');
  } else {
    console.log('ℹ Contacts already exist, skipped');
  }

  // ============================================================
  // 8) Blog Posts
  // ============================================================
  if ((await prisma.blogPost.count()) === 0 || force) {
    if (force) await prisma.blogPost.deleteMany({});
    const blogPosts = [
      {
        slug: 'bodrum-da-emlak-nasil-alinir',
        kind: BlogPostKind.ARTICLE,
        status: BlogPostStatus.PUBLISHED,
        titleTr: "Bodrum'da Emlak Nasıl Alınır? 2026 Rehberi",
        titleEn: 'How to Buy Real Estate in Bodrum — 2026 Guide',
        excerptTr: 'Yabancılar ve yerli yatırımcılar için adım adım rehber: tapu, vergi, finansman.',
        excerptEn: 'A step-by-step guide for foreign and domestic buyers: deeds, taxes, financing.',
        bodyTr: '# Bodrum\'da Emlak Almak\n\nBodrum yarımadası son 10 yılda lüks yatırımcıların gözdesi haline geldi. Bu yazıda satın alma sürecinin tüm adımlarını paylaşıyoruz...',
        bodyEn: '# Buying Real Estate in Bodrum\n\nThe Bodrum peninsula has become a top choice for luxury investors in the past decade. In this article we share every step of the purchase process...',
        coverImage: seedToImageUrl('blog-bodrum-guide'),
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        views: 1247,
      },
      {
        slug: 'istanbul-bogaz-manzarali-daire-secimi',
        kind: BlogPostKind.ARTICLE,
        status: BlogPostStatus.PUBLISHED,
        titleTr: 'Boğaz Manzaralı Daire Seçerken Dikkat Edilmesi Gerekenler',
        titleEn: 'What to Consider When Choosing a Bosphorus-View Apartment',
        excerptTr: 'Manzara, kat, cephe, ses, ışık — uzman bakışıyla.',
        excerptEn: 'View, floor, orientation, sound, light — through an expert lens.',
        bodyTr: '# Boğaz Manzaralı Daire Rehberi\n\nİstanbul Boğazı manzaralı her daire eşit değildir. Bir dairenin değerini gerçekten belirleyen 7 detayı bu yazıda paylaşıyorum...',
        bodyEn: '# Bosphorus-View Apartment Guide\n\nNot every Bosphorus-view apartment is equal. In this article I share the 7 details that truly define an apartment\'s value...',
        coverImage: seedToImageUrl('blog-bosphorus-view'),
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        views: 892,
      },
      {
        slug: 'forbes-hazal-muti-roportaj',
        kind: BlogPostKind.PRESS,
        status: BlogPostStatus.PUBLISHED,
        titleTr: 'Forbes Türkiye — "Lüks Emlakta Diskresyonun Önemi" Röportaj',
        titleEn: 'Forbes Turkey — "Discretion in Luxury Real Estate" Interview',
        excerptTr: 'Forbes Türkiye dergisi Ocak 2026 sayısı için Hazal Muti ile röportaj.',
        excerptEn: 'Interview with Hazal Muti for Forbes Turkey, January 2026 issue.',
        bodyTr: '',
        bodyEn: '',
        coverImage: seedToImageUrl('blog-forbes-interview'),
        externalUrl: 'https://forbes.com.tr',
        publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        views: 2341,
      },
      {
        slug: 'yalikavak-villa-sanal-tur',
        kind: BlogPostKind.VIDEO,
        status: BlogPostStatus.PUBLISHED,
        titleTr: 'Yalıkavak Villa — Sanal Tur (4K)',
        titleEn: 'Yalıkavak Villa — Virtual Tour (4K)',
        excerptTr: '480 m² yaşam alanı, infinity havuz, deniz manzarası — cinematik gezinti.',
        excerptEn: '480 m² living area, infinity pool, sea view — cinematic walkthrough.',
        bodyTr: '',
        bodyEn: '',
        coverImage: seedToImageUrl('blog-yalikavak-tour'),
        externalUrl: 'https://youtube.com/watch?v=demo',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        views: 567,
      },
      {
        slug: 'taslak-2027-emlak-trendleri',
        kind: BlogPostKind.ARTICLE,
        status: BlogPostStatus.DRAFT,
        titleTr: '2027 Emlak Trendleri (taslak)',
        titleEn: '2027 Real Estate Trends (draft)',
        bodyTr: 'Taslak yazı...',
        bodyEn: 'Draft post...',
      },
    ];
    for (const p of blogPosts) {
      await prisma.blogPost.create({ data: p });
    }
    console.log(`✓ Created ${blogPosts.length} demo blog posts`);
  } else {
    console.log('ℹ Blog posts already exist, skipped');
  }

  // ============================================================
  // 9) Newsletter subscribers
  // ============================================================
  if ((await prisma.newsletterSubscriber.count()) === 0 || force) {
    if (force) await prisma.newsletterSubscriber.deleteMany({});
    await prisma.newsletterSubscriber.createMany({
      data: [
        { email: 'ayse.yilmaz@example.com', name: 'Ayşe Yılmaz', locale: 'tr', source: 'web' },
        { email: 'mehmet@example.com', name: 'Mehmet Demir', locale: 'tr', source: 'footer' },
        { email: 'james@example.com', name: 'James Thompson', locale: 'en', source: 'popup' },
        { email: 'selin.aydin@example.com', name: 'Selin Aydın', locale: 'tr', source: 'web' },
        { email: 'burak.sahin@example.com', name: 'Burak Şahin', locale: 'tr', source: 'manual' },
        { email: 'eski.abone@example.com', name: 'Eski Abone', locale: 'tr', source: 'web', unsubscribed: true, unsubscribedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        { email: 'jane.doe@example.com', name: 'Jane Doe', locale: 'en', source: 'web' },
        { email: 'okan.aksoy@example.com', name: 'Okan Aksoy', locale: 'tr', source: 'footer' },
      ],
      skipDuplicates: true,
    });
    console.log('✓ Created 8 newsletter subscribers');
  } else {
    console.log('ℹ Newsletter subscribers already exist, skipped');
  }

  // ============================================================
  // 10) Mail templates
  // ============================================================
  if ((await prisma.mailTemplate.count()) === 0 || force) {
    if (force) await prisma.mailTemplate.deleteMany({});
    await prisma.mailTemplate.createMany({
      data: [
        {
          name: 'Randevu Onay',
          category: MailTemplateCategory.APPOINTMENT,
          subject: 'Randevunuz onaylandı — {{date}}',
          bodyHtml: '<p>Merhaba {{name}},</p><p>{{date}} tarihinde {{time}} saatinde {{location}} adresinde planlanmıştır.</p><p>Görüşmek üzere,<br/>Hazal Muti</p>',
          bodyText: 'Merhaba {{name}}, randevunuz {{date}} {{time}} {{location}} için onaylanmıştır.',
          variables: [
            { key: 'name', label: 'Müşteri Adı', type: 'text' },
            { key: 'date', label: 'Tarih', type: 'date' },
            { key: 'time', label: 'Saat', type: 'time' },
            { key: 'location', label: 'Yer', type: 'text' },
          ],
          isDefault: true,
        },
        {
          name: 'Teklif Sunumu',
          category: MailTemplateCategory.OFFER,
          subject: '{{listing}} için özel teklifimiz',
          bodyHtml: '<p>Sayın {{name}},</p><p>{{listing}} için özel teklifimizi ekte bulabilirsiniz.</p><p>Detayları görüşmek için müsait olduğunuzda lütfen bana ulaşın.</p>',
          variables: [
            { key: 'name', label: 'Müşteri Adı', type: 'text' },
            { key: 'listing', label: 'İlan Başlığı', type: 'text' },
          ],
        },
        {
          name: 'Takip (1 hafta sonra)',
          category: MailTemplateCategory.FOLLOWUP,
          subject: 'Geçen hafta görüştüğümüz {{listing}} hakkında',
          bodyHtml: '<p>Merhaba {{name}},</p><p>Geçen hafta {{listing}} hakkında konuşmuştuk. Karar sürecinde size yardımcı olabileceğim bir şey var mı?</p>',
          variables: [
            { key: 'name', label: 'Müşteri Adı', type: 'text' },
            { key: 'listing', label: 'İlan Başlığı', type: 'text' },
          ],
        },
        {
          name: 'Doğum Günü',
          category: MailTemplateCategory.THANKYOU,
          subject: 'Doğum gününüz kutlu olsun {{name}} 🎉',
          bodyHtml: '<p>Sevgili {{name}},</p><p>Doğum gününüzü kutlar, sağlık ve mutluluk dolu bir yıl dilerim.</p><p>Hazal Muti</p>',
          variables: [{ key: 'name', label: 'Müşteri Adı', type: 'text' }],
        },
        {
          name: 'Yeni İlan Bildirimi',
          category: MailTemplateCategory.PROMOTION,
          subject: 'Sizin için seçtiğim yeni bir ilan: {{listing}}',
          bodyHtml: '<p>Merhaba {{name}},</p><p>Tercihlerinize uyan yeni bir ilan portföyüme eklendi: <a href="{{url}}">{{listing}}</a></p>',
          variables: [
            { key: 'name', label: 'Alıcı', type: 'text' },
            { key: 'listing', label: 'İlan Başlığı', type: 'text' },
            { key: 'url', label: 'İlan URL', type: 'url' },
          ],
        },
      ],
    });
    console.log('✓ Created 5 mail templates');
  } else {
    console.log('ℹ Mail templates already exist, skipped');
  }

  // ============================================================
  // 11) Document templates
  // ============================================================
  if ((await prisma.documentTemplate.count()) === 0 || force) {
    if (force) await prisma.documentTemplate.deleteMany({});
    await prisma.documentTemplate.createMany({
      data: [
        {
          name: 'Standart Aracılık Sözleşmesi',
          category: DocumentCategory.CONTRACT,
          htmlBody: '<h1>EMLAK ARACILIK SÖZLEŞMESİ</h1><p>Tarih: {{tarih}}</p><p>Müşteri: {{musteri_adi}}</p><p>Gayrimenkul: {{gayrimenkul}}</p><p>Komisyon: %{{komisyon}}</p><p><strong>Aracı:</strong> Hazal Muti</p><p>{{HAZAL_IMZA}}</p>',
          variables: [
            { key: 'tarih', label: 'Tarih', type: 'date' },
            { key: 'musteri_adi', label: 'Müşteri Adı', type: 'text' },
            { key: 'gayrimenkul', label: 'Gayrimenkul', type: 'text' },
            { key: 'komisyon', label: 'Komisyon (%)', type: 'number', default: '2' },
          ],
          description: 'Standart komisyon sözleşmesi şablonu',
          isDefault: true,
        },
        {
          name: 'Görme Teklifi',
          category: DocumentCategory.CONTRACT,
          htmlBody: '<h1>GAYRİMENKUL ALIM TEKLİFİ</h1><p>Sayın {{satici}},</p><p>{{gayrimenkul}} için <strong>{{teklif}} {{para_birimi}}</strong> tutarında teklifimi sunuyorum.</p><p>Tarih: {{tarih}}</p><p>{{HAZAL_IMZA}}</p>',
          variables: [
            { key: 'satici', label: 'Satıcı Adı', type: 'text' },
            { key: 'gayrimenkul', label: 'Gayrimenkul', type: 'text' },
            { key: 'teklif', label: 'Teklif Tutarı', type: 'number' },
            { key: 'para_birimi', label: 'Para Birimi', type: 'text', default: 'TL' },
            { key: 'tarih', label: 'Tarih', type: 'date' },
          ],
        },
        {
          name: 'Premium İlan Broşürü',
          category: DocumentCategory.BROCHURE,
          htmlBody: '<div class="brochure"><h1>{{baslik}}</h1><p>{{aciklama}}</p><p>Fiyat: {{fiyat}}</p></div>',
          variables: [
            { key: 'baslik', label: 'İlan Başlığı', type: 'text' },
            { key: 'aciklama', label: 'Açıklama', type: 'text' },
            { key: 'fiyat', label: 'Fiyat', type: 'text' },
          ],
          isDefault: true,
        },
      ],
    });
    console.log('✓ Created 3 document templates');
  } else {
    console.log('ℹ Document templates already exist, skipped');
  }

  // ============================================================
  // 12) Calendar events
  // ============================================================
  if ((await prisma.calendarEvent.count()) === 0 || force) {
    if (force) await prisma.calendarEvent.deleteMany({});
    const now = new Date();
    const day = (offset: number, h: number, m = 0) => {
      const d = new Date(now);
      d.setDate(d.getDate() + offset);
      d.setHours(h, m, 0, 0);
      return d;
    };
    const events = [
      {
        type: CalendarEventType.OPEN_HOUSE,
        status: CalendarEventStatus.PLANNED,
        title: 'Bebek dairesi — açık ev',
        description: 'Cumartesi 14:00–17:00 randevusuz ziyaret.',
        startsAt: day(5, 14, 0),
        endsAt: day(5, 17, 0),
        location: 'Bebek, İstanbul',
        listingId: listingsList[0]?.id,
        color: '#C9A96E',
      },
      {
        type: CalendarEventType.LISTING_EXPIRY,
        status: CalendarEventStatus.PLANNED,
        title: 'Etiler ilanı yenileme tarihi',
        startsAt: day(20, 9, 0),
        allDay: true,
        listingId: listingsList[4]?.id,
        remindBefore: 24 * 60,
      },
      {
        type: CalendarEventType.PAYMENT_DUE,
        status: CalendarEventStatus.PLANNED,
        title: 'Tarabya kira tahsilat',
        startsAt: day(8, 10, 0),
        allDay: true,
        listingId: listingsList[5]?.id,
        recurrence: 'monthly',
        customerName: 'Mevcut kiracı',
      },
      {
        type: CalendarEventType.INSPECTION,
        status: CalendarEventStatus.PLANNED,
        title: 'Yalıkavak villa — ekspertiz',
        description: 'Banka ekspertizi için randevu.',
        startsAt: day(4, 11, 0),
        endsAt: day(4, 13, 0),
        location: 'Yalıkavak, Bodrum',
        listingId: listingsList[1]?.id,
      },
      {
        type: CalendarEventType.MARKETING_ACTION,
        status: CalendarEventStatus.PLANNED,
        title: 'Instagram reel paylaş — Cihangir',
        startsAt: day(2, 9, 0),
        allDay: false,
        listingId: listingsList[2]?.id,
        remindBefore: 60,
      },
      {
        type: CalendarEventType.REMINDER,
        status: CalendarEventStatus.DONE,
        title: 'Av. Murat ile sözleşme imzalama',
        startsAt: day(-3, 15, 0),
        location: 'Korkmaz Hukuk Bürosu',
      },
    ];
    for (const e of events) {
      await prisma.calendarEvent.create({ data: e });
    }
    console.log(`✓ Created ${events.length} calendar events`);
  } else {
    console.log('ℹ Calendar events already exist, skipped');
  }

  // ============================================================
  // 13) Chat sessions + messages
  // ============================================================
  if ((await prisma.chatSession.count()) === 0 || force) {
    if (force) {
      await prisma.chatMessage.deleteMany({});
      await prisma.chatSession.deleteMany({});
    }
    const sess1 = await prisma.chatSession.create({
      data: {
        visitorId: 'visitor-demo-1',
        visitorName: 'Ayşe Yılmaz',
        visitorEmail: 'ayse.yilmaz@example.com',
        visitorPhone: '+90 532 111 22 33',
        channel: ChatChannel.WEB,
        closed: false,
      },
    });
    await prisma.chatMessage.createMany({
      data: [
        { sessionId: sess1.id, sender: ChatSender.VISITOR, content: 'Merhaba, Bebek dairesi hakkında bilgi alabilir miyim?', read: true },
        { sessionId: sess1.id, sender: ChatSender.ADMIN, content: 'Merhaba Ayşe Hanım, tabii ki. Hangi konuda detay istersiniz?', read: true },
        { sessionId: sess1.id, sender: ChatSender.VISITOR, content: 'Cephe yönü ve aidat?', read: true },
        { sessionId: sess1.id, sender: ChatSender.ADMIN, content: 'Daire güney-batı cepheli, gün boyu güneş alıyor. Aidat 8.500 TL/ay (kapıcı, asansör, havuz dahil).', read: true },
        { sessionId: sess1.id, sender: ChatSender.VISITOR, content: 'Cuma öğleden sonra görebilir miyiz?', read: false },
      ],
    });

    const sess2 = await prisma.chatSession.create({
      data: {
        visitorId: 'visitor-demo-2',
        visitorName: 'James Thompson',
        visitorEmail: 'james@example.com',
        channel: ChatChannel.WHATSAPP,
        externalRef: 'wa-447700900123',
        closed: false,
      },
    });
    await prisma.chatMessage.createMany({
      data: [
        { sessionId: sess2.id, sender: ChatSender.VISITOR, content: 'Hi, I saw the Etiler apartment on your website. Could we arrange a viewing this weekend?', read: true },
        { sessionId: sess2.id, sender: ChatSender.ADMIN, content: 'Hello James, of course. I have Saturday 14:00 or Sunday 11:00 available. Which works best?', read: true },
        { sessionId: sess2.id, sender: ChatSender.VISITOR, content: 'Saturday 14:00 is perfect. The address?', read: false },
      ],
    });

    const sess3 = await prisma.chatSession.create({
      data: {
        visitorId: 'visitor-demo-3',
        visitorName: 'Anonim ziyaretçi',
        channel: ChatChannel.WEB,
        closed: true,
      },
    });
    await prisma.chatMessage.createMany({
      data: [
        { sessionId: sess3.id, sender: ChatSender.VISITOR, content: 'Bodrum yazlık var mı?', read: true },
        { sessionId: sess3.id, sender: ChatSender.ADMIN, content: 'Yalıkavak ve Göcek\'te birkaç portföyüm var. Email bırakırsanız broşür gönderebilirim.', read: true },
      ],
    });
    console.log('✓ Created 3 chat sessions with messages');
  } else {
    console.log('ℹ Chat sessions already exist, skipped');
  }

  // ============================================================
  // 14) Email messages (mail kutusu)
  // ============================================================
  if ((await prisma.emailMessage.count()) === 0 || force) {
    if (force) await prisma.emailMessage.deleteMany({});
    let uid = 1;
    await prisma.emailMessage.createMany({
      data: [
        {
          direction: EmailDirection.INBOUND,
          status: EmailStatus.UNREAD,
          imapUid: String(uid++),
          fromAddress: 'ayse.yilmaz@example.com',
          fromName: 'Ayşe Yılmaz',
          toAddresses: 'info@hazalmuti.com',
          subject: 'Bebek dairesi — Cuma randevu',
          bodyText: 'Merhaba Hazal Hanım, Cuma 11:00 randevumuz onaylandı mı?',
          bodyHtml: '<p>Merhaba Hazal Hanım, Cuma 11:00 randevumuz onaylandı mı?</p>',
          receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          direction: EmailDirection.OUTBOUND,
          status: EmailStatus.READ,
          imapUid: String(uid++),
          imapFolder: 'SENT',
          fromAddress: 'info@hazalmuti.com',
          fromName: 'Hazal Muti',
          toAddresses: 'ayse.yilmaz@example.com',
          subject: 'Re: Bebek dairesi — Cuma randevu',
          bodyText: 'Tabii Ayşe Hanım, randevumuz onaylı. Görüşmek üzere.',
          bodyHtml: '<p>Tabii Ayşe Hanım, randevumuz onaylı. Görüşmek üzere.</p>',
          receivedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        },
        {
          direction: EmailDirection.INBOUND,
          status: EmailStatus.UNREAD,
          imapUid: String(uid++),
          fromAddress: 'james@example.com',
          fromName: 'James Thompson',
          toAddresses: 'info@hazalmuti.com',
          subject: 'Etiler apartment viewing request',
          bodyText: 'Hi Hazal, could we arrange a viewing for the Etiler apartment this Saturday?',
          bodyHtml: '<p>Hi Hazal, could we arrange a viewing for the Etiler apartment this Saturday?</p>',
          receivedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
        {
          direction: EmailDirection.INBOUND,
          status: EmailStatus.READ,
          imapUid: String(uid++),
          fromAddress: 'cem@tuncekspertiz.com',
          fromName: 'Cem Tunç',
          toAddresses: 'info@hazalmuti.com',
          subject: 'Yalıkavak villa — ekspertiz raporu hazır',
          bodyText: 'Hazal Hanım, Yalıkavak villa ekspertiz raporu PDF olarak ekte. Toplam değer: $2.85M.',
          bodyHtml: '<p>Hazal Hanım, Yalıkavak villa ekspertiz raporu PDF olarak ekte. Toplam değer: $2.85M.</p>',
          hasAttachment: true,
          receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          direction: EmailDirection.INBOUND,
          status: EmailStatus.UNREAD,
          imapUid: String(uid++),
          fromAddress: 'newsletter@bloomberg.com',
          fromName: 'Bloomberg Real Estate',
          toAddresses: 'info@hazalmuti.com',
          subject: 'Weekly: Istanbul luxury market update',
          bodyText: 'This week in Istanbul luxury real estate...',
          bodyHtml: '<p>This week in Istanbul luxury real estate...</p>',
          receivedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
      ],
    });
    console.log('✓ Created 5 email messages');
  } else {
    console.log('ℹ Email messages already exist, skipped');
  }

  // ============================================================
  // 15) Notifications
  // ============================================================
  if ((await prisma.notification.count()) === 0 || force) {
    if (force) await prisma.notification.deleteMany({});
    await prisma.notification.createMany({
      data: [
        {
          type: 'new_inquiry',
          title: 'Yeni talep',
          body: 'Ayşe Yılmaz — Bebek dairesi için bilgi istedi',
          link: '/inquiries',
          read: false,
        },
        {
          type: 'new_chat_message',
          title: 'Yeni sohbet mesajı',
          body: 'Ayşe Yılmaz: "Cuma öğleden sonra görebilir miyiz?"',
          link: '/chat',
          read: false,
        },
        {
          type: 'new_inquiry',
          title: 'Yeni talep — WhatsApp',
          body: 'James Thompson — Etiler apartment viewing',
          link: '/inquiries',
          read: true,
          readAt: new Date(Date.now() - 30 * 60 * 1000),
        },
        {
          type: 'system',
          title: 'Sistem güncellemesi',
          body: 'AI Yardımcı modülü etkinleştirildi.',
          link: '/ai',
          read: true,
          readAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ],
    });
    console.log('✓ Created 4 notifications');
  } else {
    console.log('ℹ Notifications already exist, skipped');
  }

  // ============================================================
  // 16) Audit logs
  // ============================================================
  if ((await prisma.auditLog.count()) === 0 || force) {
    if (force) await prisma.auditLog.deleteMany({});
    const adminRecord = await prisma.admin.findUnique({ where: { email } });
    if (adminRecord) {
      await prisma.auditLog.createMany({
        data: [
          {
            adminId: adminRecord.id,
            action: 'auth.login',
            success: true,
            ip: '85.108.45.12',
            userAgent: 'Mozilla/5.0 (Macintosh) Chrome/131',
            createdAt: new Date(Date.now() - 30 * 60 * 1000),
          },
          {
            adminId: adminRecord.id,
            action: 'listing.create',
            success: true,
            ip: '85.108.45.12',
            metadata: { listingTitle: 'Bebek Boğaz Manzaralı Lüks Daire' },
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            adminId: adminRecord.id,
            action: 'inquiry.status.change',
            success: true,
            ip: '85.108.45.12',
            metadata: { from: 'NEW', to: 'HOT' },
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          },
          {
            adminId: null,
            action: 'auth.login',
            success: false,
            ip: '203.0.113.42',
            userAgent: 'curl/8.4',
            metadata: { reason: 'invalid_credentials', attemptedEmail: 'admin@hazalmuti.com' },
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          },
          {
            adminId: adminRecord.id,
            action: 'profile.update',
            success: true,
            ip: '85.108.45.12',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        ],
      });
      console.log('✓ Created 5 audit logs');
    }
  } else {
    console.log('ℹ Audit logs already exist, skipped');
  }

  // ============================================================
  // 17) Saved searches
  // ============================================================
  if ((await prisma.savedSearch.count()) === 0 || force) {
    if (force) await prisma.savedSearch.deleteMany({});
    await prisma.savedSearch.createMany({
      data: [
        {
          email: 'ayse.yilmaz@example.com',
          name: 'Ayşe Yılmaz',
          label: 'Bebek 3+1 boğaz manzaralı',
          criteria: { type: 'SALE', category: 'APARTMENT', district: 'Bebek', minBedrooms: 3, maxPrice: 60000000, currency: 'TRY' },
          frequency: 'daily',
          active: true,
        },
        {
          email: 'james@example.com',
          name: 'James Thompson',
          label: 'Etiler / Bebek investment',
          criteria: { type: 'SALE', category: 'APARTMENT', minPrice: 1000000, maxPrice: 5000000, currency: 'USD' },
          frequency: 'instant',
          active: true,
        },
        {
          email: 'burak.sahin@example.com',
          name: 'Burak Şahin',
          label: 'Yazlık kiralık Göcek',
          criteria: { type: 'RENT', district: 'Göcek' },
          frequency: 'weekly',
          active: true,
        },
      ],
    });
    console.log('✓ Created 3 saved searches');
  } else {
    console.log('ℹ Saved searches already exist, skipped');
  }

  // ============================================================
  // 18) Visited locations
  // ============================================================
  if ((await prisma.visitedLocation.count()) === 0 || force) {
    if (force) await prisma.visitedLocation.deleteMany({});
    await prisma.visitedLocation.createMany({
      data: [
        {
          lat: 41.0775, lng: 29.0436,
          label: 'Bebek — Bebek Boğaz Manzaralı Lüks Daire',
          customerName: 'Ayşe Yılmaz',
          notes: 'Daire çok beğenildi, 2. ziyaret planlandı.',
          visitedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          lat: 37.0789, lng: 27.3094,
          label: 'Yalıkavak — Villa ekspertiz ziyareti',
          customerName: 'Mehmet Demir',
          visitedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        {
          lat: 41.0316, lng: 28.9846,
          label: 'Cihangir — Heritage daire kapanış',
          customerName: 'Selin Aydın',
          notes: 'Tapu işlemleri tamamlandı 🎉',
          visitedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          lat: 38.2858, lng: 26.3853,
          label: 'Alaçatı — Taş ev sahibiyle görüşme',
          visitedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
      ],
    });
    console.log('✓ Created 4 visited locations');
  } else {
    console.log('ℹ Visited locations already exist, skipped');
  }

  console.log('\n🎉 Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

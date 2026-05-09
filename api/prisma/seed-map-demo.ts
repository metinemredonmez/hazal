/**
 * Map demo data seed — fills lat/lng on existing listings, creates sample
 * visited locations, calendar events with coordinates so the harita page
 * shows pins for testing.
 *
 * Run: npx tsx prisma/seed-map-demo.ts
 *      npx tsx prisma/seed-map-demo.ts --reset    # wipe + reseed
 */
import { PrismaClient, CalendarEventType, CalendarEventStatus } from '@prisma/client';

const prisma = new PrismaClient();

// İstanbul lüks/premium semt merkezleri
const ISTANBUL: Record<string, { lat: number; lng: number }> = {
  Bebek: { lat: 41.0773, lng: 29.0428 },
  Etiler: { lat: 41.0822, lng: 29.0377 },
  Zekeriyaköy: { lat: 41.1714, lng: 29.0337 },
  Cihangir: { lat: 41.0312, lng: 28.9803 },
  Nişantaşı: { lat: 41.0480, lng: 28.9925 },
  Beşiktaş: { lat: 41.0421, lng: 29.0078 },
  Ortaköy: { lat: 41.0480, lng: 29.0265 },
  Tarabya: { lat: 41.1228, lng: 29.0731 },
  Yeniköy: { lat: 41.1080, lng: 29.0598 },
  Sarıyer: { lat: 41.1681, lng: 29.0563 },
  Ulus: { lat: 41.0707, lng: 29.0387 },
  Levent: { lat: 41.0820, lng: 29.0123 },
  Maslak: { lat: 41.1093, lng: 29.0156 },
  Arnavutköy: { lat: 41.0664, lng: 29.0420 },
  Kuruçeşme: { lat: 41.0567, lng: 29.0386 },
};

const DEFAULT = ISTANBUL.Bebek;

function jitter(coord: number, range = 0.005): number {
  // ±~250m random offset to avoid pin overlap
  return coord + (Math.random() - 0.5) * range;
}

async function main(reset = false) {
  if (reset) {
    console.log('🗑  Resetting visited locations + map calendar events...');
    await prisma.visitedLocation.deleteMany({});
    await prisma.calendarEvent.deleteMany({
      where: { type: { in: ['OPEN_HOUSE', 'INSPECTION', 'PLANNED_VISIT'] as CalendarEventType[] } },
    });
  }

  // ─── 1. UPDATE LISTINGS ──────────────────────────────────────────
  const listings = await prisma.listing.findMany();
  let updatedListings = 0;
  for (const l of listings) {
    if (l.lat != null && l.lng != null) continue;
    const seed =
      (l.district && ISTANBUL[l.district]) ||
      (l.district && Object.entries(ISTANBUL).find(([k]) =>
        l.district!.toLowerCase().includes(k.toLowerCase()),
      )?.[1]) ||
      DEFAULT;
    await prisma.listing.update({
      where: { id: l.id },
      data: { lat: jitter(seed.lat), lng: jitter(seed.lng) },
    });
    updatedListings++;
    console.log(
      `  ✓ ${l.titleTr.slice(0, 40)} → ${l.district ?? 'Bebek (varsayılan)'}`,
    );
  }
  console.log(`✅ ${updatedListings} ilana koordinat eklendi\n`);

  // ─── 2. VISITED LOCATIONS (gri pinler) ───────────────────────────
  const visits = [
    {
      ...ISTANBUL.Bebek,
      label: 'Bebek Cevdetpaşa Cad.',
      customer: 'Ahmet Yılmaz',
      notes: 'Yer gösterdim, deniz manzaralı. Müşteri çok beğendi, fiyat müzakeresi devam ediyor.',
      daysAgo: 3,
    },
    {
      ...ISTANBUL.Etiler,
      label: 'Etiler Tepecik Yolu',
      customer: 'Ayşe Demir',
      notes: '2+1 daire, kiralık. Tereddütlü, alternatif arıyor.',
      daysAgo: 7,
    },
    {
      ...ISTANBUL.Cihangir,
      label: 'Cihangir Sıraselviler',
      customer: 'Mehmet Kaya',
      notes: 'Kafe ile yan yana, gürültülü çıktı. Müşteri vazgeçti.',
      daysAgo: 12,
    },
    {
      ...ISTANBUL.Tarabya,
      label: 'Tarabya Yat Limanı',
      customer: 'Ali Çelik',
      notes: 'Boğaz manzaralı premium, 9.5M teklif yapıldı.',
      daysAgo: 18,
    },
    {
      ...ISTANBUL.Nişantaşı,
      label: 'Nişantaşı Teşvikiye',
      customer: 'Zeynep Arslan',
      notes: 'Konut + iş yeri kombinasyonu. Süreç devam ediyor.',
      daysAgo: 22,
    },
    {
      ...ISTANBUL.Levent,
      label: 'Levent Kanyon yakını',
      customer: 'Burak Şahin',
      notes: '3+1 ofis-konut, ekspertiz tamam.',
      daysAgo: 28,
    },
    {
      ...ISTANBUL.Yeniköy,
      label: 'Yeniköy sahil',
      customer: 'Selin Erdem',
      notes: 'Yalı tipi, premium. Müşteri yurtdışında.',
      daysAgo: 35,
    },
    {
      ...ISTANBUL.Zekeriyaköy,
      label: 'Zekeriyaköy site içi',
      customer: 'Cem Akın',
      notes: 'Bahçeli villa, 2 ay sonra teslim.',
      daysAgo: 45,
    },
  ];

  for (const v of visits) {
    await prisma.visitedLocation.create({
      data: {
        lat: jitter(v.lat),
        lng: jitter(v.lng),
        label: v.label,
        customerName: v.customer,
        notes: v.notes,
        visitedAt: new Date(Date.now() - v.daysAgo * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`  ✓ ${v.label} (${v.daysAgo}gün önce)`);
  }
  console.log(`✅ ${visits.length} geçmiş ziyaret eklendi\n`);

  // ─── 3. CALENDAR EVENTS (mor pinler) ─────────────────────────────
  const events = [
    {
      type: 'OPEN_HOUSE' as CalendarEventType,
      title: 'Açık Ev — Bebek 3+1 Boğaz Manzaralı',
      ...ISTANBUL.Bebek,
      daysAhead: 3,
      location: 'Bebek Mah. Cevdetpaşa Cad.',
    },
    {
      type: 'INSPECTION' as CalendarEventType,
      title: 'Ekspertiz — Etiler 4+1',
      ...ISTANBUL.Etiler,
      daysAhead: 5,
      location: 'Etiler Mah. Akmerkez yakını',
    },
    {
      type: 'PLANNED_VISIT' as CalendarEventType,
      title: 'Yer Gösterimi — Ortaköy 2+1',
      ...ISTANBUL.Ortaköy,
      daysAhead: 7,
      location: 'Ortaköy sahil',
    },
    {
      type: 'CONTRACT_END' as CalendarEventType,
      title: 'Kira Sözleşmesi Bitiş — Nişantaşı',
      ...ISTANBUL.Nişantaşı,
      daysAhead: 14,
      location: 'Nişantaşı Teşvikiye',
    },
  ];

  for (const e of events) {
    const startsAt = new Date(Date.now() + e.daysAhead * 24 * 60 * 60 * 1000);
    startsAt.setHours(10 + Math.floor(Math.random() * 6), 0, 0, 0);
    await prisma.calendarEvent.create({
      data: {
        type: e.type,
        status: 'PLANNED' as CalendarEventStatus,
        title: e.title,
        startsAt,
        lat: jitter(e.lat),
        lng: jitter(e.lng),
        location: e.location,
      },
    });
    console.log(`  ✓ ${e.title}`);
  }
  console.log(`✅ ${events.length} etkinlik eklendi\n`);

  // ─── 4. UPDATE APPOINTMENTS ──────────────────────────────────────
  // Today's appointments — used for "Bugünün rotası" route
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get listings with lat/lng to attach today's appointments to
  const listingsWithCoords = await prisma.listing.findMany({
    where: { lat: { not: null }, lng: { not: null } },
    take: 4,
  });

  if (listingsWithCoords.length >= 2) {
    // Delete existing today's demo appointments to avoid duplicates
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    await prisma.appointment.deleteMany({
      where: {
        startsAt: { gte: today, lt: tomorrow },
        notes: { contains: '[demo]' },
      },
    });

    const todaysApts = [
      {
        hour: 10,
        name: 'Selin Yıldız',
        listing: listingsWithCoords[0],
      },
      {
        hour: 13,
        name: 'Cenk Demir',
        listing: listingsWithCoords[1],
      },
      ...(listingsWithCoords[2]
        ? [{ hour: 15, name: 'Berfin Akyol', listing: listingsWithCoords[2] }]
        : []),
      ...(listingsWithCoords[3]
        ? [{ hour: 17, name: 'Tolga Kara', listing: listingsWithCoords[3] }]
        : []),
    ];

    for (const a of todaysApts) {
      const startsAt = new Date(today);
      startsAt.setHours(a.hour, 0, 0, 0);
      await prisma.appointment.create({
        data: {
          name: a.name,
          email: `${a.name.toLowerCase().replace(/\s/g, '.')}@example.com`,
          phone: `+90 532 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
          startsAt,
          durationMin: 60,
          listingId: a.listing.id,
          status: 'CONFIRMED',
          notes: '[demo] Map seed ile oluşturuldu',
        },
      });
      console.log(`  ✓ Bugün ${a.hour}:00 — ${a.name} → ${a.listing.titleTr.slice(0, 30)}`);
    }
    console.log(`✅ ${todaysApts.length} bugünkü randevu eklendi (rotada görünecek)\n`);
  }

  console.log('🗺️  HARİTA DEMO HAZIR!');
  console.log('   Şimdi /harita sayfasını yenile — tüm pinleri göreceksin:');
  console.log('   🟡 Altın pinler  → İlanlar (koordinatlı)');
  console.log('   🔵 Mavi pinler   → Bugünkü randevular');
  console.log('   🟣 Mor pinler    → Etkinlikler');
  console.log('   ⚫ Gri pinler    → Geçmiş ziyaretler');
  console.log('   ✨ "Bugünün Rotası" butonu da aktif olur (≥2 randevu var)');
}

main(process.argv.includes('--reset'))
  .catch((err) => {
    console.error('❌ Hata:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

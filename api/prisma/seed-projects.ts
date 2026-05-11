/**
 * Projects seed — Hazal'ın tanıttığı geliştirici projeleri.
 * İlk seed: Atılgan Royal & Atılgan Oasis (Mavişehir / Karşıyaka / İzmir).
 *
 * Run: npx tsx prisma/seed-projects.ts
 *      npx tsx prisma/seed-projects.ts --reset
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PROJECTS = [
  {
    slug: 'atilgan-oasis',
    brandTr: 'Atılgan İnşaat',
    brandEn: 'Atılgan İnşaat',
    nameTr: 'Atılgan Oasis',
    nameEn: 'Atılgan Oasis',
    taglineTr: "Mavişehir'de deniz, doğa ve müstakil yaşam — zamansız bir villa konsepti.",
    taglineEn: "Sea, nature and detached living in Mavişehir — a timeless villa concept.",
    locationTr: 'Mavişehir · Karşıyaka · İzmir',
    locationEn: 'Mavişehir · Karşıyaka · İzmir',
    descriptionTr:
      "Atılgan Oasis, Mavişehir'in prestijli aksında 78 adet villadan oluşan butik bir villa projesidir. Deniz hattına yakın konumu, akıllı ev sistemleri ve özel yüzme havuzlu villaları ile İzmir'in yükselen değerleri arasında öne çıkar.",
    descriptionEn:
      "Atılgan Oasis is a boutique 78-villa development on Mavişehir's prestigious axis. With its proximity to the coastline, full smart-home integration and private pools, it stands out among İzmir's rising values.",
    heroImage: '/sample-apartments/DSC_0276.jpg',
    heroVideo: '/showcase/oasis-2026-02-24.mp4',
    specs: [
      { labelTr: 'Daire tipleri', labelEn: 'Villa types', valueTr: '4+1 · 5+1 · 8+1', valueEn: '4+1 · 5+1 · 8+1' },
      { labelTr: 'Villa büyüklüğü', labelEn: 'Villa size', valueTr: '426 – 869 m²', valueEn: '426 – 869 m²' },
      { labelTr: 'Toplam villa', labelEn: 'Total villas', valueTr: '78 villa', valueEn: '78 villas' },
      { labelTr: 'Konum', labelEn: 'Location', valueTr: 'Mavişehir / Karşıyaka', valueEn: 'Mavişehir / Karşıyaka' },
    ],
    featuresTr: [
      'Her villaya özel yüzme havuzu',
      'Her villaya özel bahçe',
      'Akıllı ev sistemleri (KNX)',
      'Yüz tanıma + parmak izi giriş',
      'Görüntülü diafon',
      'Şömine, ebeveyn banyosu, giyinme odası',
      'Full ankastre mutfak + kiler',
      'Yerden ısıtma & soğutma',
      'Fitness salonu',
      '7/24 güvenlik',
      'Her villaya özel otopark',
      'Jakuzi, barbekü, teras',
    ],
    featuresEn: [
      'Private swimming pool per villa',
      'Private garden per villa',
      'Smart-home systems (KNX)',
      'Face recognition + fingerprint entry',
      'Video intercom',
      'Fireplace, master bath, dressing room',
      'Full built-in kitchen + pantry',
      'Underfloor heating & cooling',
      'Fitness center',
      '24/7 security',
      'Private parking per villa',
      'Jacuzzi, BBQ, terrace',
    ],
    gallery: [
      '/sample-apartments/DSC_0214.jpg',
      '/sample-apartments/DSC_0241.jpg',
      '/sample-apartments/DSC_0252.jpg',
      '/sample-apartments/DSC_0266.jpg',
      '/sample-apartments/DSC_0276.jpg',
      '/sample-apartments/DSC_0285.jpg',
      '/sample-apartments/DSC_0292.jpg',
      '/sample-apartments/DSC_0301.jpg',
    ],
    brochureUrl: 'https://atilganinsaat.com/proje/oasis',
    statusTr: 'Satışı devam eden proje',
    statusEn: 'On sale',
    statusTone: 'live',
    featured: true,
    order: 0,
    isPublished: true,
  },
  {
    slug: 'atilgan-royal',
    brandTr: 'Atılgan İnşaat',
    brandEn: 'Atılgan İnşaat',
    nameTr: 'Atılgan Royal',
    nameEn: 'Atılgan Royal',
    taglineTr:
      "Mavişehir'de deniz manzarası, lüks mimari ve ayrıcalıklı yaşam standardı — 94 bağımsız bölüm, 8 müstakil villa, 5 ticari ünite.",
    taglineEn:
      'Sea views, luxury architecture and elevated living in Mavişehir — 94 residences, 8 detached villas and 5 commercial units.',
    locationTr: 'Mavişehir · Karşıyaka · İzmir',
    locationEn: 'Mavişehir · Karşıyaka · İzmir',
    descriptionTr:
      "Atılgan Royal, Karşıyaka Mavişehir'de konumlanan 27 katlı tek kule ve 8 adet müstakil villadan oluşan prestijli bir yaşam projesidir. 39.000 m² inşaat alanı içinde 2.700 m² yeşil alan ayrılan projede 94 bağımsız bölüm ve 5 ticari ünite yer alır. Daireler Versace, La Fabbrica ve Valentino markalı seramikler ile Vanucci ve Bulthaup mutfak donanımlarıyla teslim edilmiştir. Mimar Ömer Çamoğlu imzalı, teslim edilmiş bir projedir.",
    descriptionEn:
      "Atılgan Royal is a prestigious residential development on Karşıyaka Mavişehir comprising a single 27-storey tower and 8 detached villas. The 39,000 m² gross construction includes 2,700 m² of green areas, with 94 residences and 5 commercial units. Apartments are delivered with Versace, La Fabbrica and Valentino ceramics and Vanucci & Bulthaup kitchens. Signed by architect Ömer Çamoğlu — delivered and move-in ready.",
    heroImage: '/sample-apartments/DSC_0287.jpg',
    heroVideo: '/showcase/oasis-2025-11-25.mp4',
    specs: [
      { labelTr: 'Bağımsız bölüm', labelEn: 'Residences', valueTr: '94 daire + 8 villa', valueEn: '94 units + 8 villas' },
      { labelTr: 'Daire tipleri', labelEn: 'Unit mix', valueTr: '2+1 · 3+1 · Dubleks · Penthouse · Villa', valueEn: '2+1 · 3+1 · Duplex · Penthouse · Villa' },
      { labelTr: 'Büyüklükler', labelEn: 'Sizes', valueTr: '144 – 428 m² (villa 418 m² + 200-400 m² bahçe)', valueEn: '144 – 428 m² (villa 418 m² + 200-400 m² garden)' },
      { labelTr: 'Mimari', labelEn: 'Architect', valueTr: 'Ömer Çamoğlu', valueEn: 'Ömer Çamoğlu' },
      { labelTr: 'İnşaat alanı', labelEn: 'Construction area', valueTr: '39.000 m² (2.700 m² yeşil)', valueEn: '39,000 m² (2,700 m² green)' },
      { labelTr: 'Teslim', labelEn: 'Delivery', valueTr: 'Tamamlandı — hazır teslim', valueEn: 'Delivered — move-in ready' },
    ],
    featuresTr: [
      'Sahile sıfır körfez manzarası',
      'Açık yüzme havuzu (sosyal)',
      '8 villada özel havuz + bahçe',
      'SPA & Sauna',
      'Yerden ısıtma',
      'Her odaya özel banyo',
      'Versace · La Fabbrica · Valentino seramik',
      'Vanucci · Bulthaup mutfak',
      'Her daireye 2 araç otopark',
      'Tramvay + toplu taşıma yürüme mesafesinde',
      'Mavibahçe AVM ve Hilltown Karşıyaka yakını',
      '5 ticari ünite — sosyal ihtiyaçlar entegre',
    ],
    featuresEn: [
      'Front-line gulf view',
      'Open swimming pool (social)',
      'Private pool + garden for 8 villas',
      'SPA & Sauna',
      'Underfloor heating',
      'En-suite bathrooms',
      'Versace · La Fabbrica · Valentino ceramics',
      'Vanucci · Bulthaup kitchens',
      '2-car private parking per unit',
      'Walking distance to tram and public transport',
      'Close to Mavibahçe Mall and Hilltown Karşıyaka',
      '5 retail units — integrated daily amenities',
    ],
    gallery: [
      '/sample-apartments/DSC_0287.jpg',
      '/sample-apartments/DSC_0289.jpg',
      '/sample-apartments/DSC_0295.jpg',
      '/sample-apartments/DSC_0297.jpg',
      '/sample-apartments/DSC_0299.jpg',
      '/sample-apartments/DSC_0303.jpg',
    ],
    brochureUrl: 'https://atilganinsaat.com/proje/atilgan-royal',
    statusTr: 'Teslim edilmiş — hazır',
    statusEn: 'Delivered — ready',
    statusTone: 'live',
    featured: true,
    order: 1,
    isPublished: true,
  },
];

async function main(reset = false) {
  if (reset) {
    console.log('🗑  Clearing existing projects...');
    await prisma.project.deleteMany({});
  }

  for (const p of PROJECTS) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      create: p as any,
      update: p as any,
    });
    console.log(`  🏛  ${p.nameTr}`);
  }

  console.log(`\n✅ ${PROJECTS.length} proje yüklendi (upsert)`);
  console.log('   🌐 Web: https://hazalmuti.com/koleksiyon');
  console.log('   ⚙  Admin: https://admin.hazalmuti.com/projeler');
}

main(process.argv.includes('--reset'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

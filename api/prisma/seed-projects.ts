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
      "Atılgan koleksiyonunun premium tier'ı — sınırlı sayıda özel villa, mahremiyet ve zarafet.",
    taglineEn:
      'The premium tier of the Atılgan collection — a limited series of private villas with discretion and refinement.',
    locationTr: 'Mavişehir · Karşıyaka · İzmir',
    locationEn: 'Mavişehir · Karşıyaka · İzmir',
    descriptionTr:
      'Atılgan Royal, Atılgan Oasis koleksiyonu içinde özel olarak tanımlanmış bir seçkidir. Sınırlı sayıda mahrem konumlu villadan oluşur; kapsam, malzeme ve sosyal alan ayrıcalıkları standart koleksiyonun üzerine inşa edilir. Detaylar şahsi görüşme ile paylaşılır.',
    descriptionEn:
      'Atılgan Royal is a curated selection within the broader Atılgan Oasis collection — a limited number of villas in discreet positions, with elevated specifications and exclusive amenities. Details are shared in private consultation.',
    heroImage: '/sample-apartments/DSC_0287.jpg',
    heroVideo: '/showcase/oasis-2025-11-25.mp4',
    specs: [
      { labelTr: 'Seçki', labelEn: 'Selection', valueTr: 'Mahdut sayıda villa', valueEn: 'Limited number of villas' },
      { labelTr: 'Tip aralığı', labelEn: 'Type range', valueTr: '5+1 · 8+1 premium', valueEn: '5+1 · 8+1 premium' },
      { labelTr: 'Konum', labelEn: 'Location', valueTr: 'Private sok. / Mavişehir', valueEn: 'Private street / Mavişehir' },
      { labelTr: 'Erişim', labelEn: 'Access', valueTr: 'Davet ile görüşme', valueEn: 'By invitation only' },
    ],
    featuresTr: [
      'Mahremiyet odaklı konumlama',
      'Genişletilmiş özel havuz + spa alanı',
      'Premium malzeme ve teslim seçenekleri',
      'Özelleştirilebilir iç mimari',
      'Ayrıcalıklı concierge hizmeti',
      'Diğer detaylar şahsi görüşmede paylaşılır',
    ],
    featuresEn: [
      'Privacy-focused positioning',
      'Extended private pool + spa area',
      'Premium material and delivery options',
      'Customizable interior architecture',
      'Concierge service',
      'Further details shared in private consultation',
    ],
    gallery: [
      '/sample-apartments/DSC_0287.jpg',
      '/sample-apartments/DSC_0289.jpg',
      '/sample-apartments/DSC_0295.jpg',
      '/sample-apartments/DSC_0297.jpg',
      '/sample-apartments/DSC_0299.jpg',
      '/sample-apartments/DSC_0303.jpg',
    ],
    brochureUrl: null,
    statusTr: 'Davet ile',
    statusEn: 'By invitation',
    statusTone: 'exclusive',
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

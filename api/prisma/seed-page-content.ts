/**
 * Page content + settings seed — Hazal Muti'nin web sayfaları için
 * gerçek içerik. Anasayfa, Hakkımda, İletişim sekmelerini doldurur.
 *
 * Run: npx tsx prisma/seed-page-content.ts
 *      npx tsx prisma/seed-page-content.ts --reset    # mevcut pageContent'i siler
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PAGE_CONTENT = {
  home: {
    heroEyebrow: {
      tr: 'Premium portföy · İstanbul · Bodrum',
      en: 'Premium portfolio · Istanbul · Bodrum',
    },
    heroCtaLabel: {
      tr: 'İlanları keşfet',
      en: 'Explore listings',
    },
    featuredTitle: {
      tr: 'Öne çıkan ilanlar',
      en: 'Featured listings',
    },
    featuredSubtitle: {
      tr: 'Bu ay özenle seçilmiş portföy.',
      en: "This month's hand-picked portfolio.",
    },
    aboutHeading: {
      tr: 'Her müşteri,\ntek bir hikâye.',
      en: 'Every client,\na single story.',
    },
    aboutCtaLabel: {
      tr: 'Hakkımda',
      en: 'About me',
    },
    contactHeading: {
      tr: 'Sıradaki ev,\nbirlikte bulunur.',
      en: 'Your next home,\nfound together.',
    },
    contactSubtitle: {
      tr: 'Sessiz, kişisel ve sonuç odaklı bir gayrimenkul deneyimi. İhtiyacınızı dinleyerek başlıyoruz.',
      en: 'A discreet, personal and results-driven real estate experience. We start by listening to what you need.',
    },
    contactCtaLabel: {
      tr: 'İletişime geç',
      en: 'Get in touch',
    },
  },
  about: {
    heroEyebrow: {
      tr: 'Hakkımda',
      en: 'About',
    },
    heroTitle: {
      tr: 'Premium gayrimenkul,\nkişisel hizmet.',
      en: 'Premium properties,\npersonal service.',
    },
    intro: {
      tr: "İstanbul'un seçkin lokasyonlarında premium gayrimenkul danışmanlığı sunuyorum.",
      en: "I provide premium real estate advisory across İstanbul's most distinguished neighborhoods.",
    },
    bio1: {
      tr: "Coldwell Banker CB Plus'ta gayrimenkul danışmanıyım. İstanbul ve Bodrum'da satış ve kiralama süreçlerinde müşterilere eşlik ediyorum.",
      en: "I am a real estate consultant at Coldwell Banker CB Plus. I support clients through sales and leasing processes in İstanbul and Bodrum.",
    },
    bio2: {
      tr: "Her müşterinin önceliği farklı. Bu yüzden hızlı sonuç yerine doğru karara odaklanıyorum: ihtiyacı dinleyip portföyden uygun seçenekleri sunmak, yer gösterimi ve sözleşme sürecinde yanınızda olmak.",
      en: "Every client has different priorities. So I focus on the right decision rather than the fastest outcome: listening, presenting fitting options from the portfolio, and being there through viewings and contracts.",
    },
    specialties: {
      tr: 'Boğaz hattı (Bebek, Yeniköy, Tarabya)\nEtiler, Cihangir\nBodrum (Yalıkavak, Türkbükü)\nYabancı alıcı süreçleri',
      en: 'Bosphorus line (Bebek, Yeniköy, Tarabya)\nEtiler, Cihangir\nBodrum (Yalıkavak, Türkbükü)\nForeign buyer processes',
    },
    quote: {
      tr: '',
      en: '',
    },
    quoteAuthor: '',
  },
  contact: {
    heroEyebrow: {
      tr: 'İletişim',
      en: 'Contact',
    },
    heroTitle: {
      tr: 'Birlikte\nkeşfedelim.',
      en: "Let's explore\ntogether.",
    },
    intro: {
      tr: 'Aradığınız evi tarif edin; portföyümden ve ağımdan size uygun seçenekleri sunalım. Yer gösterimi, ekspertiz ve sözleşme süreçlerinde uçtan uca yanınızdayım.',
      en: 'Describe the home you are looking for; let me bring you tailored options from my portfolio and network. I support you end-to-end across viewings, valuation and contract.',
    },
    workingHours: {
      tr: 'Pazartesi – Cumartesi · 09:00 – 19:00\nPazar · Randevu ile',
      en: 'Monday – Saturday · 09:00 – 19:00\nSunday · By appointment',
    },
    addressLine: {
      tr: 'İstanbul · Bodrum',
      en: 'İstanbul · Bodrum',
    },
  },
};

const SETTINGS_DEFAULTS = {
  brandName: 'Hazal Muti',
  tagline: 'Coldwell Banker · İstanbul lüks gayrimenkul',
  phone: '+90 532 512 76 28',
  whatsapp: '+90 532 512 76 28',
  email: 'hazal.muti@cb.com.tr',
  address: 'CB PLUS · İstanbul',
  aboutTr:
    "Coldwell Banker CB Plus'ta gayrimenkul danışmanıyım. İstanbul ve Bodrum'da satış ve kiralama süreçlerinde müşterilere eşlik ediyorum.",
  aboutEn:
    "I am a real estate consultant at Coldwell Banker CB Plus. I support clients through sales and leasing in İstanbul and Bodrum.",
  instagram: 'https://www.instagram.com/cb.hazalmuti/',
};

async function main(reset = false) {
  const existing = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
  });

  if (!existing) {
    console.log('⚠️  SiteSettings.singleton kaydı yok, oluşturuluyor...');
    await prisma.siteSettings.create({
      data: {
        id: 'singleton',
        brandName: SETTINGS_DEFAULTS.brandName,
        tagline: SETTINGS_DEFAULTS.tagline,
        aboutTr: SETTINGS_DEFAULTS.aboutTr,
        aboutEn: SETTINGS_DEFAULTS.aboutEn,
        instagram: SETTINGS_DEFAULTS.instagram,
        pageContent: PAGE_CONTENT,
      },
    });
    console.log('✅ SiteSettings + page content oluşturuldu');
    return;
  }

  // Update strategy:
  // - reset: pageContent'i tamamen değiştir
  // - default: sadece eksik alanları doldur (mevcut kullanıcı düzenlemeleri korunur)
  let nextContent: typeof PAGE_CONTENT;
  if (reset) {
    nextContent = PAGE_CONTENT;
    console.log('🗑  Mevcut pageContent siliniyor, yenisi yazılıyor...');
  } else {
    const current = (existing.pageContent as typeof PAGE_CONTENT) ?? {};
    nextContent = mergeDeep(current, PAGE_CONTENT) as typeof PAGE_CONTENT;
    console.log('🔀 Mevcut içerikle birleştiriliyor (kullanıcı düzenlemeleri korunur)...');
  }

  const settingsUpdate: Record<string, string> = {};
  if (!existing.brandName || existing.brandName.includes('Mutin')) {
    settingsUpdate.brandName = SETTINGS_DEFAULTS.brandName;
  }
  if (!existing.tagline) settingsUpdate.tagline = SETTINGS_DEFAULTS.tagline;
  if (!existing.phone) settingsUpdate.phone = SETTINGS_DEFAULTS.phone;
  if (!existing.whatsapp) settingsUpdate.whatsapp = SETTINGS_DEFAULTS.whatsapp;
  if (!existing.email) settingsUpdate.email = SETTINGS_DEFAULTS.email;
  if (!existing.address) settingsUpdate.address = SETTINGS_DEFAULTS.address;
  if (!existing.aboutTr) settingsUpdate.aboutTr = SETTINGS_DEFAULTS.aboutTr;
  if (!existing.aboutEn) settingsUpdate.aboutEn = SETTINGS_DEFAULTS.aboutEn;
  if (!existing.instagram) settingsUpdate.instagram = SETTINGS_DEFAULTS.instagram;
  // --reset modunda her alanı override et
  if (reset) {
    Object.assign(settingsUpdate, SETTINGS_DEFAULTS);
  }

  await prisma.siteSettings.update({
    where: { id: 'singleton' },
    data: {
      ...settingsUpdate,
      pageContent: nextContent,
    },
  });

  const updatedFields = Object.keys(settingsUpdate);
  if (updatedFields.length > 0) {
    console.log(`✅ Settings güncellendi: ${updatedFields.join(', ')}`);
  } else {
    console.log('ℹ️  Settings alanları zaten dolu, dokunulmadı');
  }
  console.log('✅ Page content (anasayfa + hakkımda + iletişim) yazıldı');
  console.log('\n🌐 Web sayfalarında değişiklikleri görmek için web rebuild gerekmiyor.');
  console.log('   Sayfa yenilendiğinde otomatik gelir (cache yok).');
}

// Deep merge: source non-empty değerlerle target'ı tamamla
function mergeDeep(target: object, source: object): object {
  if (!target || typeof target !== 'object') return source;
  const result: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    const tv = (target as Record<string, unknown>)[key];
    const sv = (source as Record<string, unknown>)[key];
    if (sv && typeof sv === 'object' && !Array.isArray(sv)) {
      result[key] = mergeDeep((tv ?? {}) as object, sv as object);
    } else if (sv !== undefined && sv !== '') {
      // Sadece target'ta yok veya boşsa source'tan al
      if (tv === undefined || tv === null || tv === '') {
        result[key] = sv;
      }
    }
  }
  return result;
}

main(process.argv.includes('--reset'))
  .catch((err) => {
    console.error('❌ Hata:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

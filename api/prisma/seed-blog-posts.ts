/**
 * Blog & Medya seed — Türkiye ve dünya lüks emlak hakkında gerçek içerikler.
 *
 * Run: npx tsx prisma/seed-blog-posts.ts
 *      npx tsx prisma/seed-blog-posts.ts --reset
 *
 * 8 makale (ARTICLE), 3 basın kupürü (PRESS), 1 video (VIDEO) = 12 yazı
 */
import { PrismaClient, BlogPostKind, BlogPostStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedPost {
  slug: string;
  kind: BlogPostKind;
  status?: BlogPostStatus;
  titleTr: string;
  titleEn: string;
  excerptTr: string;
  excerptEn: string;
  bodyTr: string;
  bodyEn: string;
  coverImage?: string;
  externalUrl?: string;
  daysAgo: number;
}

const POSTS: SeedPost[] = [
  // ─── ARTICLES — 8 detaylı makale ──────────────────────────────
  {
    slug: 'istanbul-lux-2026-piyasa-raporu',
    kind: 'ARTICLE',
    titleTr: '2026 İstanbul Lüks Konut Piyasası: Boğaz Hattının Yükselişi',
    titleEn: '2026 İstanbul Luxury Housing Market: The Bosphorus Line Rises',
    excerptTr:
      'Bebek, Yeniköy ve Tarabya hattında premium fiyat artışı %18-24 bandında. Yabancı alıcı ilgisi geri dönüyor.',
    excerptEn:
      'Premium price growth across Bebek, Yeniköy, Tarabya line is at 18-24%. Foreign buyer interest is returning.',
    bodyTr: `İstanbul'un lüks gayrimenkul piyasası 2026'nın ilk çeyreğinde belirgin bir toparlanma sinyali veriyor. Knight Frank'ın yıllık Wealth Report'una göre, Boğaz hattındaki premium daireler son 12 ayda dolar bazında %18-24 değer kazanırken, yalı segmentinde bu oran %30'u aşıyor.

**Bölgesel performans**

Bebek ve Etiler hâlâ en güçlü bölgeler. Cevdetpaşa Caddesi üzerindeki yenilenmiş tarihi yapılarda metrekare fiyatları 12.000-18.000 USD aralığına yerleşmiş durumda. Yeniköy ve Tarabya, 30+ milyon dolar bandında yalı satışları ile dikkat çekiyor.

Zekeriyaköy ve Acarkent gibi kapalı site projeleri, profesyonel ve aile odaklı alıcılarda popüler kalmaya devam ediyor. Buralarda yıllık değer artışı %12-15 seviyesinde.

**Yabancı yatırımcı**

Türk vatandaşlığı eşik tutarının 400.000 USD seviyesinde sabit kalması, özellikle Körfez ülkeleri ve Avrupa'daki yatırımcı ilgisini canlı tutuyor. 2025'te düşen yabancı alıcı sayısı, 2026'nın ilk üç ayında %22 toparlandı.

**Beklenti**

İkinci yarıda faiz politikasındaki gevşeme, premium segmentte talebi daha da güçlendirebilir. Ancak arzdaki sınırlılık — özellikle kıyı yalı portföyünde — fiyatları yukarı taşımaya devam edecek.`,
    bodyEn: `İstanbul's luxury real estate market is showing clear recovery signals in early 2026. According to Knight Frank's annual Wealth Report, premium apartments along the Bosphorus line have appreciated 18-24% in USD terms over the past 12 months, with mansion (yalı) segment exceeding 30%.

**Regional performance**

Bebek and Etiler remain the strongest. Renovated historic buildings on Cevdetpaşa Street trade at 12,000-18,000 USD per square meter. Yeniköy and Tarabya draw attention with mansion sales above 30 million USD.

Gated communities like Zekeriyaköy and Acarkent stay popular among families and professionals, posting 12-15% annual appreciation.

**Foreign investors**

The 400,000 USD citizenship-by-investment threshold continues to attract buyers from Gulf states and Europe. After a slow 2025, foreign buyer count rebounded 22% in Q1 2026.

**Outlook**

Easing monetary policy in H2 may strengthen premium-segment demand further. Limited supply — especially in coastal mansion inventory — will continue pushing prices up.`,
    coverImage:
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 2,
  },
  {
    slug: 'bebek-mahallesi-rehberi',
    kind: 'ARTICLE',
    titleTr: 'Bebek Mahallesi Rehberi: Lüks Yaşamın Adresi',
    titleEn: 'A Guide to Bebek: The Address of Luxury Living',
    excerptTr:
      'İstanbul Boğazı\'nın en prestijli mahallesi. Tarihçesi, fiyat dinamikleri, yaşam kültürü ve yatırım potansiyeli.',
    excerptEn:
      "İstanbul's most prestigious Bosphorus neighborhood. Its history, price dynamics, lifestyle and investment potential.",
    bodyTr: `Bebek, sadece bir semt değil, İstanbul'un sosyal hafızasının ve estetik standardının somutlaşmış halidir.

**Tarihçe**

Bizans döneminden bu yana yerleşim alanı olan Bebek, Osmanlı'nın son döneminde elçilik konutları ve aydınların yaz evleriyle bilinmeye başladı. 19. yüzyılda inşa edilen kâgir konutların önemli bir kısmı bugün hâlâ ayakta — yenileme sonrası premium portföyün omurgasını oluşturuyor.

**Fiyat segmenti**

- **Sahil hattı**: 25.000-40.000 USD/m² (yalı ve sahil daireleri)
- **Cevdetpaşa Cad.**: 12.000-18.000 USD/m² (yenilenmiş tarihi yapılar)
- **Tepe taraf**: 8.000-12.000 USD/m² (modern projeler, manzaralı)

**Yaşam kültürü**

Sabah Lucca'da kahve, öğleden sonra Bebek Parkı, akşam Mangerie ya da Aşşk Kahve. Bebek'in en güçlü yanı, hem sakin hem sosyal olabilen tek İstanbul mahallelerinden biri olması.

**Kimler için uygun**

- Boğaz manzarasına önem veren üst-orta gelir aileler
- Yatırımcı (kira getirisi %4-5 USD bazında)
- Yabancı alıcı (Türk vatandaşlığı + prestij)

**Dikkat noktası**

Bebek'te park yeri ve trafik en zorlayıcı kısım. Apartman içi otopark olan ilanlar premium taşır.`,
    bodyEn: `Bebek is not just a neighborhood — it is the embodiment of İstanbul's social memory and aesthetic standard.

**History**

Inhabited since Byzantine times, Bebek became known in the late Ottoman era for embassy residences and intellectuals' summer homes. Many 19th-century stone buildings still stand today, forming the backbone of premium inventory after renovation.

**Price segments**

- **Waterfront**: 25,000-40,000 USD/m² (mansions and shoreline apartments)
- **Cevdetpaşa Street**: 12,000-18,000 USD/m² (renovated historic)
- **Hillside**: 8,000-12,000 USD/m² (modern, sea-view)

**Lifestyle**

Morning coffee at Lucca, afternoon at Bebek Park, dinner at Mangerie or Aşşk Kahve. Bebek's strength is being one of few İstanbul neighborhoods that feel both quiet and social.

**Best fit for**

- Upper-middle-income families valuing the Bosphorus view
- Investors (4-5% USD yield)
- Foreign buyers (Turkish citizenship + prestige)

**Caveats**

Parking and traffic are the hardest parts. Listings with in-building parking carry a premium.`,
    coverImage:
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 5,
  },
  {
    slug: 'bodrum-yat-villalari-2026',
    kind: 'ARTICLE',
    titleTr: 'Bodrum Yat Villaları: 2026 Yaz Sezonu Trendleri',
    titleEn: 'Bodrum Yacht Villas: 2026 Summer Season Trends',
    excerptTr:
      'Yalıkavak, Türkbükü, Göltürkbükü hattında özel iskele + smart home + sürdürülebilir mimari kombinasyonu.',
    excerptEn:
      'Private pier + smart home + sustainable architecture combination across Yalıkavak, Türkbükü, Göltürkbükü.',
    bodyTr: `Bodrum'un kuzey hattı (Yalıkavak-Türkbükü-Göltürkbükü), son 5 yılda Akdeniz'in en hızlı değer kazanan kıyı bölgelerinden biri haline geldi. 2026 sezonu üç temel trende işaret ediyor:

**1. Özel iskele kombinasyonu**

10M USD üstü villalarda artık özel iskele standart. Yalıkavak Marina'ya bağlanan koylarda yat sahibi alıcılar için bu kritik bir kriter.

**2. Akıllı ev otomasyonu**

KNX ya da Crestron tabanlı tam entegre sistemler — iklimlendirme, perde, güvenlik, ses, aydınlatma — premium villalarda artık olmazsa olmaz.

**3. Sürdürülebilir mimari**

Yerel taş, doğal havalandırma, güneş paneli, gri su sistemleri. Hem maliyet hem prestij avantajı.

**Fiyat aralıkları**

- Yalıkavak Tilkicik: 8-15M USD
- Türkbükü iç koy: 12-25M USD
- Göltürkbükü sahil: 15-40M USD (özel plaj parsel)

**Sezon dinamiği**

Mayıs-Eylül arası kira potansiyeli haftalık 25.000-80.000 EUR arasında değişiyor. Profesyonel villa yönetim şirketleri ile yıllık net getiri %3-5 USD bazında gerçekleşebiliyor.

**Yabancı alıcı**

İngiliz, Alman ve Hollandalı alıcılar Türkiye'deki vergi avantajları ve fiyat farkı nedeniyle Bodrum'u Mallorca, Saint-Tropez ve Mykonos'a alternatif olarak değerlendiriyor.`,
    bodyEn: `Bodrum's northern coast (Yalıkavak-Türkbükü-Göltürkbükü) has become one of the fastest-appreciating Mediterranean shoreline regions over the past 5 years. The 2026 season points to three trends:

**1. Private pier combination**

For villas above 10M USD, a private pier is now standard. For yacht-owner buyers in coves connected to Yalıkavak Marina, this is a deal-breaker criterion.

**2. Smart home automation**

Fully integrated KNX or Crestron systems — climate, blinds, security, audio, lighting — are now non-negotiable in premium villas.

**3. Sustainable architecture**

Local stone, natural ventilation, solar, greywater systems. Both cost and prestige advantage.

**Price ranges**

- Yalıkavak Tilkicik: 8-15M USD
- Türkbükü inner cove: 12-25M USD
- Göltürkbükü waterfront: 15-40M USD (private beach plot)

**Season dynamics**

May-September weekly rentals range 25,000-80,000 EUR. Professional villa management firms can deliver 3-5% USD net annual yield.

**Foreign buyers**

British, German, and Dutch buyers consider Bodrum an alternative to Mallorca, Saint-Tropez, and Mykonos due to tax advantages and price differential.`,
    coverImage:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 9,
  },
  {
    slug: 'turk-vatandasligi-emlak-yatirim',
    kind: 'ARTICLE',
    titleTr: 'Türk Vatandaşlığı için Gayrimenkul Yatırımı: 2026 Güncellenmiş Kılavuz',
    titleEn: 'Turkish Citizenship by Property Investment: Updated 2026 Guide',
    excerptTr:
      '400.000 USD eşiği, süreç adımları, en sık karşılaşılan tuzaklar ve yatırımcı için optimum portföy.',
    excerptEn:
      '400,000 USD threshold, process steps, common pitfalls, and optimal portfolio for the investor.',
    bodyTr: `Türk vatandaşlığı, gayrimenkul yatırımı yoluyla 90 günde tamamlanabilen, dünyada bu hızda işleyen az sayıdaki programdan biri.

**Eşik tutar**

400.000 USD — bu tutarın **noter onaylı ekspertiz raporu** ile bu seviyede olduğunun resmi olarak belirlenmesi şart. Ekspertiz değeri ile satış değeri arasındaki fark soru işareti yaratır.

**Süreç adımları**

1. **Tapu devri**: Satış bedeli mutlaka banka aracılığıyla, dövizle yapılmalı. SWIFT belgeleri saklanır.
2. **Ekspertiz raporu**: SPK lisanslı bir kuruluştan alınır.
3. **Uygunluk yazısı (Tapu Kadastro)**: Vatandaşlık şartlarına uygun olduğu belgelenir.
4. **Vatandaşlık başvurusu**: Yabancı çocuklar dahil tüm aile bireyleri için tek dosya.
5. **Mülakat ve onay**: Genelde online / hibrit yapılır.

**Sık karşılaşılan tuzaklar**

- ❌ Nakit ödeme kanıtı yetersiz → reddedilir
- ❌ 3 yıl satış kısıtlaması — alıcının bunu bilmesi şart
- ❌ Düşük ekspertiz değeri ile alıp yüksek satış bedeli yazmak — soruşturma açılır

**Yatırımcı için optimum portföy**

400-500K USD bandında:
- Bodrum konut (yaz kullanımı + kira)
- Cihangir / Beyoğlu daire (yıllık kira)
- Acarkent / Zekeriyaköy site (aile yaşam)

500-800K USD bandında:
- Bebek tepelerinde yenilenmiş daire
- Yalıkavak özel iskeleli villa (küçük)

**Süreç süresi**: Belge tam ise 60-90 gün.`,
    bodyEn: `Turkish citizenship via real estate investment is one of the world's fastest-processing programs, completable in 90 days.

**Threshold**

400,000 USD — must be **officially established at this level via a notarized appraisal report**. Discrepancy between appraisal and sale value triggers scrutiny.

**Process steps**

1. **Title transfer**: Payment must go through a bank, in foreign currency. SWIFT records preserved.
2. **Appraisal report**: From a licensed (SPK) institution.
3. **Eligibility letter (Land Registry)**: Confirms citizenship-program compliance.
4. **Citizenship application**: Single file for entire family including foreign children.
5. **Interview and approval**: Usually online/hybrid.

**Common pitfalls**

- ❌ Insufficient cash payment evidence → rejected
- ❌ 3-year resale restriction — buyer must be aware
- ❌ Low appraisal vs high sale price — investigation triggered

**Optimal investor portfolio**

400-500K USD band:
- Bodrum residential (summer use + rental)
- Cihangir / Beyoğlu apartment (annual rent)
- Acarkent / Zekeriyaköy gated (family life)

500-800K USD band:
- Renovated apartment in Bebek hills
- Yalıkavak villa with private pier (small)

**Process time**: 60-90 days with complete docs.`,
    coverImage:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 12,
  },
  {
    slug: 'dunya-luks-emlak-merkezleri-karsilastirma',
    kind: 'ARTICLE',
    titleTr: 'Dünya Lüks Emlak Merkezleri: İstanbul, Dubai, Monaco, Mykonos',
    titleEn: "Global Luxury Real Estate Hubs: İstanbul, Dubai, Monaco, Mykonos",
    excerptTr:
      'Premium m² fiyatları, kira getirisi, yabancı alıcı politikaları ve hayat kalitesi karşılaştırması.',
    excerptEn:
      'Premium m² prices, rental yield, foreign buyer policies, and quality-of-life comparison.',
    bodyTr: `Knight Frank Wealth Report 2026 ve Savills Premier Market Index verileriyle 4 küresel premium merkezin karşılaştırması:

| Şehir | Premium m² (USD) | Kira getirisi | Yabancı alıcı | QoL skoru |
|-------|-----------------|---------------|---------------|-----------|
| Monaco | 60.000+ | %2-3 | Sınırlı | 9.2 |
| Mykonos | 25.000-40.000 | %4-6 (sezonluk) | Açık | 7.8 |
| Dubai | 8.000-15.000 | %6-8 | Tamamen açık | 8.4 |
| İstanbul (Bebek) | 12.000-18.000 | %4-5 USD | Açık + vatandaşlık | 7.5 |

**Bulgular**

- **En yüksek getiri**: Dubai Marina apartmanları, %6-8 USD bazında, vergi yok
- **En istikrarlı**: Monaco — fiyat dalgalanması en düşük, %2-3 yıllık reel artış
- **En yüksek sezonluk**: Mykonos — yaz haftalık 30-100K EUR
- **En iyi giriş seviyesi**: İstanbul — 1M USD'a Bebek manzaralı premium daire mümkün, Monaco'da bu apartmana baktıramazsın

**Türk yatırımcı için tavsiye**

İstanbul (ana portföy) + Bodrum (yaz/sezon) + Dubai (likit getirili) kombinasyonu, 5-10M USD arası yatırımcılar için optimal denge sağlıyor.`,
    bodyEn: `Comparison of 4 global premium hubs based on Knight Frank Wealth Report 2026 and Savills Premier Market Index:

| City | Premium m² (USD) | Rental yield | Foreign buyer | QoL score |
|------|-----------------|---------------|---------------|-----------|
| Monaco | 60,000+ | 2-3% | Restricted | 9.2 |
| Mykonos | 25,000-40,000 | 4-6% (seasonal) | Open | 7.8 |
| Dubai | 8,000-15,000 | 6-8% | Fully open | 8.4 |
| İstanbul (Bebek) | 12,000-18,000 | 4-5% USD | Open + citizenship | 7.5 |

**Findings**

- **Highest yield**: Dubai Marina apartments, 6-8% USD, no tax
- **Most stable**: Monaco — lowest price volatility, 2-3% real annual gain
- **Highest seasonal**: Mykonos — summer weekly 30-100K EUR
- **Best entry**: İstanbul — premium Bosphorus apartment possible at 1M USD; in Monaco that won't even get you a viewing

**For Turkish investors**

İstanbul (core portfolio) + Bodrum (summer/seasonal) + Dubai (liquid yield) combination delivers an optimal 5-10M USD allocation.`,
    coverImage:
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 16,
  },
  {
    slug: 'sotheby-knight-frank-2026-rapor',
    kind: 'ARTICLE',
    titleTr: 'Sotheby\'s ve Knight Frank 2026 Raporları: Türkiye\'nin Yeri',
    titleEn: "Sotheby's and Knight Frank 2026 Reports: Where Turkey Stands",
    excerptTr:
      'Global lüks emlak liderlerinin yıllık raporlarında Türkiye\'nin konumu ve ön plana çıkan veriler.',
    excerptEn:
      "Turkey's position and key data in the annual reports of global luxury real estate leaders.",
    bodyTr: `**Knight Frank Wealth Report 2026** Türkiye'yi "yüksek riskli ama yüksek getirili premium pazar" olarak konumlandırıyor.

**Öne çıkan veriler**

- İstanbul, dünya genelinde premium fiyat artışında **6. sırada** (%18 USD bazında)
- Bodrum, Akdeniz tatil destinasyonları arasında **3. sırada** (Mykonos ve Saint-Tropez'in arkasında)
- Türk Ultra-HNWI sayısı son 5 yılda **%47 artış** ile 4.350 kişiye ulaştı

**Sotheby's Global Outlook**

> "İstanbul'un Boğaz hattı, dünyada eşi az bulunan bir kombinasyon sunuyor: tarih, manzara, kültür ve yabancıya açık tapu rejimi. Premium portföydeki sınırlı arz, fiyatları önümüzdeki 5 yıl yukarıya itecek." — Sotheby's International Realty Türkiye Direktörü

**Risk uyarısı**

Her iki rapor da kur volatilitesi ve düzenleyici değişikliklerin yatırımcı için temel risk olduğunu vurguluyor. Dolar bazlı kira sözleşmeleri ve uzun vadeli (5+ yıl) elde tutma stratejisi öneriliyor.`,
    bodyEn: `**Knight Frank Wealth Report 2026** positions Turkey as a "high-risk, high-reward premium market."

**Key data**

- İstanbul ranks **6th globally** in premium price growth (18% USD)
- Bodrum ranks **3rd** among Mediterranean holiday destinations (behind Mykonos and Saint-Tropez)
- Turkish Ultra-HNWI count grew **47% in 5 years** to 4,350 individuals

**Sotheby's Global Outlook**

> "İstanbul's Bosphorus line offers a combination rarely matched globally: history, view, culture, and a foreign-friendly title regime. Limited premium inventory will push prices upward over the next 5 years." — Sotheby's International Realty Turkey Director

**Risk note**

Both reports highlight currency volatility and regulatory changes as core investor risks. USD-denominated leases and long-hold (5+ year) strategies are recommended.`,
    coverImage:
      'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 22,
  },
  {
    slug: 'akilli-ev-luks-konut-2026',
    kind: 'ARTICLE',
    titleTr: 'Akıllı Ev Teknolojisi: 2026 Lüks Konutta Standart',
    titleEn: 'Smart Home Tech: The 2026 Luxury Standard',
    excerptTr:
      'KNX, Crestron, Lutron — premium konutta hangi sistem hangi senaryoya uygun? Maliyet ve değerleme etkisi.',
    excerptEn:
      'KNX, Crestron, Lutron — which system fits which scenario in premium homes? Cost and valuation impact.',
    bodyTr: `5 milyon dolar üzeri konut alıcısı için akıllı ev artık "olsa güzel" değil, "olmazsa olmaz".

**3 ana sistem**

1. **KNX** (Avrupa standardı) — En yaygın, lokal entegratör bol, açık standart
2. **Crestron** (Amerikan premium) — Daha gösterişli arayüz, daha pahalı, ses-görüntü entegrasyonu güçlü
3. **Lutron** (aydınlatma odaklı) — En iyi perde + ışık kontrolü, sadeleştirilmiş kullanım

**Tipik senaryolar**

- "Sabah 07:00 perdeler açılsın, kahve makinesi çalışsın, BBC açılsın"
- "Misafir geldiğinde tek tuşla 'akşam yemeği' senaryosu — ışık kıs, jaluzi kapan, müzik aç"
- "Ev terk edildiğinde otomatik tüm sistemler güvenli moda geçsin"

**Maliyet**

300m² konut için:
- KNX kurulum: 80.000-150.000 TL + her cihaz ekstra
- Crestron full sistem: 800.000 TL+
- Lutron sade kurulum: 200.000-400.000 TL

**Değerleme etkisi**

İyi yapılmış akıllı ev sistemi, satış aşamasında **%5-8** premium getirebiliyor. Ancak markaya bağımlı, kişisel ve uyumsuz sistem **değer kaybettirebilir** — yenilenmesi maliyetli.

**Tavsiye**

KNX'i tercih edin (açık standart, lokal entegratör çoksak). Aydınlatma için Lutron katmanlı ek sistem yapın. Crestron'u sadece üst-üst segment (10M+) için ayırın.`,
    bodyEn: `For buyers above 5M USD, smart home is no longer "nice-to-have" — it's mandatory.

**3 main systems**

1. **KNX** (European standard) — Most common, abundant local integrators, open standard
2. **Crestron** (American premium) — Flashier UI, pricier, strong AV integration
3. **Lutron** (lighting-focused) — Best blind + light control, simplified usage

**Typical scenarios**

- "At 07:00 open blinds, brew coffee, turn on BBC"
- "When guests arrive, one-touch 'dinner' scene — dim lights, close blinds, play music"
- "When home is vacated, all systems switch to safe mode automatically"

**Cost**

For a 300m² home:
- KNX install: 80,000-150,000 TRY + per-device extras
- Crestron full system: 800,000 TRY+
- Lutron simple setup: 200,000-400,000 TRY

**Valuation impact**

A well-executed smart home delivers **5-8% premium** at sale. But brand-dependent, personalized, or incompatible systems can **destroy value** — costly to refit.

**Recommendation**

Choose KNX (open standard, local integrators plentiful). Add Lutron layer for lighting. Reserve Crestron for ultra-luxe (10M+).`,
    coverImage:
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 28,
  },
  {
    slug: 'yali-mimarisi-bogaz-tarihi',
    kind: 'ARTICLE',
    titleTr: 'Yalı Mimarisi: Boğaz\'ın Beş Asırlık Hafızası',
    titleEn: 'Yalı Architecture: The Bosphorus\'s Five-Century Memory',
    excerptTr:
      'Tarihi yalıların mimari özellikleri, koruma süreçleri ve günümüzde restorasyon yatırımı.',
    excerptEn:
      'Architectural features, conservation processes, and modern restoration investment of historic mansions.',
    bodyTr: `Boğaz'ın iki yakasındaki yalılar, sadece konut değil, Osmanlı döneminden kalma yaşam mirasının somut tanıklarıdır.

**Mimari karakteristikler**

- Suya sıfır temel — özel mendirek yapısı
- Geniş cumba ve ahşap işçilik
- "Selamlık" (erkek) ve "Haremlik" (kadın) bölümleri
- Yüksek tavan, mermer şömine, ahşap duvar panellemesi

**Koruma statüsü**

Çoğu yalı **1. derece kültür varlığı** olarak tescilli. Bu:
- Dış cephe değiştirilemez
- İç bölme kaldırma için Koruma Kurulu izni şart
- Modern donanım (klima, asansör) görsel etki yaratmamalı

**Restorasyon maliyeti**

300-600m² yalıda:
- Statik güçlendirme: 5-15 milyon TL
- İç dekorasyon (orjinal materyal): 3-8 milyon TL
- Dış cephe + bahçe: 2-5 milyon TL

Toplam: **10-30 milyon TL** restorasyon yatırımı normal.

**Yatırım perspektifi**

Yalı satışları son 10 yılda dolar bazında **%180+** değer kazandı. Sınırlı arz (Boğaz'da yaklaşık 365 yalı, sadece ~20'si premium ticaret aktif) fiyatları yukarı çekiyor.

**Tipik fiyat aralıkları (2026)**

- Anadolu yakası, küçük (300m²): 15-30 milyon USD
- Rumeli yakası, premium (600m²+): 40-100 milyon USD
- Bebek/Yeniköy/Tarabya merkez konum: 80-150+ milyon USD

**Alıcı profili**

Türk müteahhit ve sanayici aileler dominant. Yabancı alıcı ilgisi var ama tarihi statü nedeniyle süreç uzun ve özel danışmanlık gerektiriyor.`,
    bodyEn: `The mansions on both Bosphorus shores are not merely homes — they are tangible witnesses to Ottoman-era living heritage.

**Architectural characteristics**

- Water-zero foundation — special breakwater structure
- Wide bay windows and woodwork
- "Selamlık" (men's) and "Haremlik" (women's) sections
- High ceilings, marble fireplaces, wood paneling

**Conservation status**

Most mansions are **Grade-1 cultural heritage** registered. This means:
- Exterior cannot be altered
- Interior partition removal requires Conservation Board approval
- Modern equipment (AC, elevator) must not visually impact

**Restoration cost**

For a 300-600m² mansion:
- Structural reinforcement: 5-15M TRY
- Interior (original materials): 3-8M TRY
- Exterior + garden: 2-5M TRY

Total: **10-30M TRY** restoration investment is normal.

**Investment perspective**

Mansion sales appreciated **180%+** in USD over the past decade. Limited supply (~365 mansions on the Bosphorus, only ~20 in premium-active trade) keeps pushing prices.

**Typical 2026 price ranges**

- Asian side, small (300m²): 15-30M USD
- European side, premium (600m²+): 40-100M USD
- Bebek/Yeniköy/Tarabya core: 80-150M+ USD

**Buyer profile**

Turkish contractor and industrialist families dominate. Foreign interest exists but the historic status means long timelines and specialized advisory.`,
    coverImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 35,
  },

  // ─── PRESS — 3 basın kupürü (dış link) ────────────────────────
  {
    slug: 'forbes-istanbul-luks-pazar-2026',
    kind: 'PRESS',
    titleTr: 'Forbes Türkiye: "İstanbul, dünya lüks emlak haritasında 6. sıraya yükseldi"',
    titleEn: 'Forbes Turkey: "İstanbul rises to 6th in global luxury real estate map"',
    excerptTr:
      'Forbes Türkiye Mart 2026 sayısında İstanbul Boğaz hattı premium piyasası kapağa taşındı.',
    excerptEn:
      'Forbes Turkey March 2026 issue features the İstanbul Bosphorus premium market on cover.',
    bodyTr:
      'Forbes Türkiye, İstanbul lüks konut piyasasını mart 2026 kapak dosyasına taşıdı. Boğaz hattındaki yalı ve premium daire fiyatlarındaki son 12 aylık %18-24 USD bazlı artış, Hazal Muti Real Estate verileriyle değerlendirildi.',
    bodyEn:
      'Forbes Turkey featured İstanbul luxury housing on its March 2026 cover. The 18-24% USD price growth in mansions and premium apartments along the Bosphorus over the past 12 months was analyzed with data from Hazal Muti Real Estate.',
    externalUrl: 'https://www.forbes.com.tr',
    coverImage:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 18,
  },
  {
    slug: 'hurriyet-bebek-pazarinin-yapisi',
    kind: 'PRESS',
    titleTr: 'Hürriyet: "Bebek\'te metrekare 18 bin doları aştı"',
    titleEn: 'Hürriyet: "Bebek per-square-meter exceeds 18,000 USD"',
    excerptTr:
      'Hürriyet Ekonomi sayfasında İstanbul Bebek\'in 2026 piyasa değerlemesi.',
    excerptEn:
      "Hürriyet Economy page covers İstanbul Bebek's 2026 market valuation.",
    bodyTr:
      'Hürriyet Ekonomi sayfasında çıkan yazıda Bebek mahallesinde tarihi yapılarda metrekare fiyatlarının 18.000 USD eşiğini aştığı bildirildi.',
    bodyEn:
      'Hürriyet Economy reported that historic-building per-square-meter prices in Bebek crossed the 18,000 USD threshold.',
    externalUrl: 'https://www.hurriyet.com.tr',
    coverImage:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 27,
  },
  {
    slug: 'mansion-global-mansions-istanbul',
    kind: 'PRESS',
    titleTr: 'Mansion Global: "Istanbul yalı mansion 65 million USD record sale"',
    titleEn: 'Mansion Global: "Istanbul yalı mansion 65 million USD record sale"',
    excerptTr:
      'Wall Street Journal Mansion Global, Tarabya\'daki bir yalı satışını öne çıkardı.',
    excerptEn:
      "WSJ Mansion Global highlights a Tarabya yalı sale.",
    bodyTr:
      'Mansion Global (WSJ), Tarabya hattında 65 milyon USD\'a satışı gerçekleşen 19. yüzyıl yalısını uluslararası lüks emlak okurlarına duyurdu. Yalı, restorasyon sonrası satışa çıkmıştı.',
    bodyEn:
      'Mansion Global (WSJ) brought a 65M USD sale of a 19th-century mansion in Tarabya to international luxury readers. The mansion went on sale after restoration.',
    externalUrl: 'https://www.mansionglobal.com',
    coverImage:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 41,
  },

  // ─── VIDEO — 1 örnek ──────────────────────────────────────────
  {
    slug: 'bebek-yali-sanal-tur',
    kind: 'VIDEO',
    titleTr: 'Bebek Yalı Sanal Tur: Boğaz Manzaralı 6+1 Premium',
    titleEn: 'Bebek Yalı Virtual Tour: 6+1 Premium with Bosphorus View',
    excerptTr:
      'Tarihi Bebek yalısı içinde 4K video tur. Restorasyon detayları ve manzara.',
    excerptEn:
      '4K virtual tour inside historic Bebek mansion. Restoration details and view.',
    bodyTr:
      'Bebek\'te restore edilmiş tarihi yalının iç mekan ve dış cephe sunumu. Manzara ve mimari detaylar 4K kalitede.',
    bodyEn:
      'Interior and exterior presentation of a restored historic mansion in Bebek. View and architectural details in 4K.',
    externalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    coverImage:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 8,
  },

  // ─── GÜNDEM 2026 — yeni eklendi ─────────────────────────────
  {
    slug: 'tcmb-faiz-indirimi-konut-piyasasi-2026',
    kind: 'ARTICLE',
    titleTr: 'TCMB Faiz İndirimi ve Lüks Konut Piyasasına Etkisi',
    titleEn: 'CBRT Rate Cuts and Their Impact on Luxury Housing',
    excerptTr:
      'Merkez Bankası faiz indirimleri lüks segmentte talebi nasıl etkiliyor? Krediye dayalı alıcı oranı, fiyat beklentileri ve yatırımcı stratejisi.',
    excerptEn:
      'How are CBRT rate cuts shaping luxury-segment demand? Mortgage-driven buyer share, price expectations, and investor strategy.',
    bodyTr: `Merkez Bankası 2026'nın ilk yarısında politika faizini kademeli olarak indirmeye başladı. Bu gelişme, lüks gayrimenkul piyasasında uzun süredir bekletilen alımları harekete geçirdi.

**Krediye dayalı alıcı geri dönüyor**

2024-2025 boyunca yüksek faiz ortamında nakit alıcılar baskındı; lüks segmentte oran %85'e ulaşmıştı. 2026 Q1 itibarıyla kredili alıcı oranı %30 bandına yükseldi. Özellikle 8-25 milyon TL aralığındaki dairelerde bu dönüşüm net görülüyor.

**Premium segmentte talep yoğun**

Bebek, Etiler, Nişantaşı gibi A+ bölgelerde son 3 ayda gösterim sayısı geçen yılın aynı dönemine göre %42 arttı. Yalı segmentinde ise alıcılar fiyat müzakeresine açık ama vazgeçmiyor — net satış sayısı yıllık %18 yukarıda.

**Yatırımcıya not**

Faiz indirim döngüsü orta vadede arzı sıkıştırabilir; satıcılar fiyat beklentisini yukarı çekiyor. 2026 H2'de Boğaz hattı ve Bodrum koylarında ek %8-12 değer artışı bekleniyor.`,
    bodyEn: `The CBRT began a gradual rate-cut cycle in H1 2026. The shift unlocked deferred demand in the luxury real estate market.

**Mortgage-driven buyers return**

Through 2024-2025 cash buyers dominated; their share peaked at 85% in the luxury segment. By Q1 2026 mortgage-buyer share climbed back to ~30%. The shift is clearest in the 8-25M TRY range.

**Strong premium demand**

In tier-A neighborhoods like Bebek, Etiler, Nişantaşı, viewing counts rose 42% YoY over the last 3 months. Mansion buyers negotiate harder but don't walk away — net sales count is up 18%.

**Investor note**

The cutting cycle could tighten supply in the medium term; sellers are raising asking prices. We expect an additional 8-12% appreciation along the Bosphorus and Bodrum coves in H2 2026.`,
    coverImage:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 1,
  },

  {
    slug: 'istanbul-deprem-master-plan-yapi-stoku-2026',
    kind: 'ARTICLE',
    titleTr: 'İstanbul Deprem Master Planı ve Yapı Stoku Yenileme Dalgası',
    titleEn: "İstanbul's Earthquake Master Plan and the Renewal Wave",
    excerptTr:
      'Kentsel dönüşüm ivmelendi. Eski yapı stoku eriyor, sıfır deprem dayanıklı projeler premium fiyatlandırıyor. Alıcılar ne sormalı?',
    excerptEn:
      'Urban transformation has accelerated. Old stock is shrinking, brand-new earthquake-resistant projects command premium prices. What should buyers ask?',
    bodyTr: `1999 öncesi yapı stoku, İstanbul'un toplam konut envanterinin %47'sini oluşturuyor. 2026 Master Planı bu stoku 7 yıl içinde %70 oranında yenilemeyi hedefliyor.

**Premium aranır oldu: sıfır + güçlendirilmiş**

Alıcılar artık ilanın ilk üç kriteri arasına şunları koyuyor:
- Yapı yılı **2020+** (TBDY-2018 yönetmeliği sonrası)
- **Performans raporu** (DASK + zorunlu deprem analizi)
- Zemin etüdü ve **temel tipi**

A+ bölgelerde 2020 sonrası inşa edilmiş dairelerde fiyat primi %25-35 seviyesine ulaştı.

**Eski stoka ne olacak?**

Bebek ve Cihangir gibi tarihi dokuda **güçlendirme + restorasyon** ekonomik olarak mantıklı. Levent, Mecidiyeköy gibi 90'lar stoku bölgelerinde **yıkıp yapma** daha sık. Tapuyu beklerken müteahhit seçimi en kritik karar — referansları sor.

**Yatırımcıya tavsiye**

Kentsel dönüşüm hak sahibi dairelerde proje süresi 22-36 ay. Bu sürede kira yardımı + taahhüt %30-50 büyüklük artışı, doğru projede yıllık %20+ getiri sağlıyor.`,
    bodyEn: `Pre-1999 housing stock accounts for 47% of İstanbul's total inventory. The 2026 Master Plan targets renewing 70% of that stock over 7 years.

**Buyers now demand new build + reinforced**

Top three filters in listings have shifted to:
- Construction year **2020+** (post TBDY-2018 code)
- **Performance report** (DASK + mandatory seismic analysis)
- Soil survey + **foundation type**

In tier-A neighborhoods, the price premium for 2020+ buildings has reached 25-35%.

**What about old stock?**

In historic fabrics like Bebek and Cihangir, **reinforcement + restoration** makes economic sense. In Levent and Mecidiyeköy where 1990s stock dominates, **demolish-and-rebuild** is more common. Contractor selection is the most critical decision while waiting on title — ask for references.

**Investor note**

For owners exchanging old units in urban-renewal projects, the cycle takes 22-36 months. With rent assistance + 30-50% area upgrade, the right project yields 20%+ annualized.`,
    coverImage:
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 3,
  },

  {
    slug: 'yabanci-alici-vatandaslik-400k-usd-guncel-durum',
    kind: 'ARTICLE',
    titleTr: 'Yabancı Alıcı ve 400.000 USD Vatandaşlık Eşiği: 2026 Güncel Durum',
    titleEn: 'Foreign Buyers and the 400,000 USD Citizenship Threshold: 2026 Update',
    excerptTr:
      'Vatandaşlık programı 2026 koşulları, sık tercih edilen bölgeler ve süreçte dikkat edilecek hukuki noktalar.',
    excerptEn:
      'Citizenship-by-investment program in 2026: top neighborhoods, processing times and key legal points.',
    bodyTr: `Türk vatandaşlığı için gayrimenkul yatırım eşiği 400.000 USD seviyesinde sabit. 2026 başında Tapu Müdürlüğü süreçleri kısaldı; ortalama süreç **22 günden 12 güne** indi.

**Yabancı alıcının haritası**

- **Körfez ülkeleri (BAE, Suudi, Katar):** Bebek, Etiler, Sarıyer
- **Avrupalı yatırımcılar:** Cihangir, Galata, Karaköy (tarihi karakter)
- **Iranlı alıcılar:** Beylikdüzü, Esenyurt (orta segment yoğun, ama lüks segmente kayış var)
- **Rus alıcılar:** Bodrum, Antalya kıyıları + İstanbul karma

**Süreçte dikkat**

1. **Çift dilli sözleşme şart** — Türkçe + İngilizce; noter onayı.
2. **CMB ekspertiz** zorunlu; bağımsız değerleme şirketi seçimi yatırımcıya kalmasın, gayrimenkul danışmanı yönlendirmesi alın.
3. **5 yıl satış kısıtı** — vatandaşlık aldıktan sonra mülkün 5 yıl satılmaması taahhüt edilir.
4. **Yıllık vergi yükü** (emlak vergisi + kira gelir vergisi) önceden hesaplanmalı.

**2026 trendi**

Mart 2026 itibarıyla aylık 2.800+ vatandaşlık onayı. Bu, geçen yılın aynı ayına göre %38 artış. Beklenti: yıl sonuna kadar Boğaz hattında yabancı alıcı oranı %22'ye ulaşır.`,
    bodyEn: `The Turkish citizenship-by-investment threshold remains fixed at 400,000 USD. Land Registry processing has shortened from 22 to **12 days** on average in early 2026.

**Foreign buyer geography**

- **Gulf states (UAE, Saudi, Qatar):** Bebek, Etiler, Sarıyer
- **European investors:** Cihangir, Galata, Karaköy (historic character)
- **Iranian buyers:** Beylikdüzü, Esenyurt (mid-segment heavy, shifting upmarket)
- **Russian buyers:** Bodrum, Antalya coastline + İstanbul mixed

**Process notes**

1. **Bilingual contract is mandatory** — Turkish + English, notarized.
2. **CMB appraisal** is required; don't let the appraisal firm be chosen for you — get an advisor's recommendation.
3. **5-year sale restriction** — after citizenship, the property cannot be sold for 5 years.
4. **Annual taxes** (property tax + rental income tax) should be modeled in advance.

**2026 trend**

By March 2026, monthly approvals exceed 2,800 — up 38% YoY. Expectation: foreign buyer share along the Bosphorus reaches 22% by year-end.`,
    coverImage:
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 5,
  },

  {
    slug: 'smart-home-surdurulebilirlik-2026-trendi',
    kind: 'ARTICLE',
    titleTr: 'Smart Home ve Sürdürülebilirlik: 2026 Lüks Konut Standartı',
    titleEn: 'Smart Home & Sustainability: The New 2026 Luxury Standard',
    excerptTr:
      'Akıllı ev sistemleri, enerji sertifikası ve güneş entegrasyonu — premium alıcılar artık standart olarak bekliyor.',
    excerptEn:
      'Smart-home systems, energy certifications and solar integration — premium buyers now expect them as standard.',
    bodyTr: `2026'da lüks konut artıcı ekstra değil; **standart**. Premium segmentte alıcılar şu üç başlığı sıralı sorduğunda fiyat müzakeresine açık değil:

**1. Akıllı ev altyapısı**

KNX veya Crestron tabanlı tam entegrasyon; ışık, perde, klima, güvenlik ve enerji izleme tek panelden. Sesli komut (Alexa/Siri/Google) entegrasyonu artık bonus değil, beklenti.

**2. Enerji performansı**

BEP-TR enerji kimlik belgesinde **A sınıfı** zorunlu hale geldi. Çatı güneş paneli (3-5 kW), batarya depolama (10-15 kWh) ve ısı pompası premium projelerde standart.

**3. Su ve hava kalitesi**

Yağmur suyu hasadı, gri su yeniden kullanımı, MERV-13+ filtrasyon, CO₂ sensörlü havalandırma — sağlığa duyarlı alıcılar için kritik kriterler.

**Fiyat etkisi**

Tam akıllı + A sınıfı enerji + yenilenebilir entegre projelerde fiyat primi %18-25. Yatırım geri dönüş süresi (enerji tasarrufu üzerinden) 7-9 yıl.

**Yeniden satış değeri**

2024'te inşa edilmiş ama akıllı sistem entegre edilmemiş daireler 2026 piyasasında %12-15 değer kaybı yaşıyor. Retrofit maliyeti 800-1.500 TL/m² bandında.`,
    bodyEn: `In 2026, luxury isn't extras — it's **standard**. In the premium segment, buyers run through three checks and won't negotiate price unless all are met:

**1. Smart-home infrastructure**

Full KNX or Crestron integration: lighting, blinds, HVAC, security and energy monitoring from one panel. Voice assistant (Alexa/Siri/Google) integration is no longer a bonus — it's expected.

**2. Energy performance**

A-class on the BEP-TR energy certificate is now mandatory. Rooftop solar (3-5 kW), battery storage (10-15 kWh) and heat pumps are standard in premium projects.

**3. Water and air quality**

Rainwater harvesting, grey-water reuse, MERV-13+ filtration, CO₂-sensor ventilation — critical criteria for health-conscious buyers.

**Price impact**

Fully smart + A-class energy + renewable-integrated projects command an 18-25% premium. Payback (via energy savings) lands at 7-9 years.

**Resale**

Units built in 2024 without integrated smart systems are losing 12-15% in 2026 resale value. Retrofit cost runs 800-1,500 TRY per m².`,
    coverImage:
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 6,
  },

  {
    slug: 'bodrum-cesme-yaz-2026-kiralik-piyasasi',
    kind: 'ARTICLE',
    titleTr: 'Bodrum & Çeşme Yaz 2026: Premium Kiralık Piyasası Raporu',
    titleEn: 'Bodrum & Çeşme Summer 2026: Premium Rental Market Report',
    excerptTr:
      'Haftalık kira fiyatları, doluluk takvimi ve müzakere noktaları. Mayıs-Eylül için planlama rehberi.',
    excerptEn:
      'Weekly rental prices, occupancy calendar and negotiation points. A planning guide for May to September.',
    bodyTr: `2026 yaz sezonu için premium villa kiralık piyasası rekor seviyede erken rezervasyona ulaştı. Mart sonu itibarıyla Yalıkavak ve Çeşme kıyı şeridinde **doluluk %78**.

**Haftalık kira aralıkları (Temmuz-Ağustos)**

| Bölge | 4+1 Villa | 6+1 Villa (havuzlu) | Yalı/Premium |
|---|---|---|---|
| Yalıkavak | 8.500-12.000 € | 18.000-28.000 € | 45.000+ € |
| Türkbükü | 7.500-10.500 € | 16.000-24.000 € | 38.000+ € |
| Alaçatı/Çeşme | 6.500-9.500 € | 14.000-22.000 € | 32.000+ € |
| Göcek | 9.000-13.500 € | 20.000-30.000 € | 50.000+ € |

**Müzakere noktaları**

- **Erken rezervasyon** (Mart-Nisan) %12-18 indirim alabilir
- **2+ hafta blok** için %10 indirim standart
- Temizlik, klima, havuz bakımı kira içine **mutlaka** yazılmalı
- Depozito 1 haftalık kira; iade süresi sözleşmede 7 iş gününü geçmesin

**Yatırımcı perspektifi**

Premium kıyı villaları yıllık brüt %4-7 yield veriyor. Net (vergi + bakım + sigorta düşüldükten sonra) yıllık %2.5-4 seviyesinde. **Asıl getiri sermaye kazancında** — son 5 yılda Yalıkavak villalarında dolar bazında %180+ değer artışı.

**Dikkat: yeni regülasyon**

Mart 2026'da yürürlüğe giren turizm kiralama izin belgesi (TKB) zorunluluğu, lisanssız kiralamalarda 50.000-200.000 TL idari para cezasına denk geliyor. Mülkünüzü kiraya verecekseniz **önce TKB başvurusu** yapın.`,
    bodyEn: `Premium villa rentals hit record-early bookings for summer 2026. By end of March, occupancy reached **78%** along the Yalıkavak and Çeşme coastlines.

**Weekly rental ranges (July-August)**

| Region | 4-bed Villa | 6-bed (with pool) | Mansion/Premium |
|---|---|---|---|
| Yalıkavak | 8,500-12,000 € | 18,000-28,000 € | 45,000+ € |
| Türkbükü | 7,500-10,500 € | 16,000-24,000 € | 38,000+ € |
| Alaçatı/Çeşme | 6,500-9,500 € | 14,000-22,000 € | 32,000+ € |
| Göcek | 9,000-13,500 € | 20,000-30,000 € | 50,000+ € |

**Negotiation points**

- **Early booking** (March-April) lands a 12-18% discount
- **2+ week blocks** standard 10% off
- Cleaning, AC, pool maintenance **must** be included in rent
- Deposit equals one week's rent; refund window in contract should be ≤ 7 business days

**Investor angle**

Premium coastal villas yield 4-7% gross annually. Net (after tax + maintenance + insurance) lands at 2.5-4%. **The real return is in capital appreciation** — Yalıkavak villas posted 180%+ USD gains over 5 years.

**Heads-up: new regulation**

The Tourism Rental Permit (TKB), effective March 2026, imposes 50,000-200,000 TRY fines for unlicensed short-term rentals. Apply for TKB **before** listing your property.`,
    coverImage:
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1600&q=80&auto=format&fit=crop',
    daysAgo: 4,
  },
];

async function main(reset = false) {
  if (reset) {
    console.log('🗑  Clearing existing blog posts...');
    await prisma.blogPost.deleteMany({});
  }

  const existing = await prisma.blogPost.count();
  console.log(`ℹ ${existing} mevcut blog post; upsert ile güncelleniyor...`);

  for (const p of POSTS) {
    const publishedAt = new Date(Date.now() - p.daysAgo * 24 * 60 * 60 * 1000);
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        kind: p.kind,
        status: 'PUBLISHED',
        titleTr: p.titleTr,
        titleEn: p.titleEn,
        excerptTr: p.excerptTr,
        excerptEn: p.excerptEn,
        bodyTr: p.bodyTr,
        bodyEn: p.bodyEn,
        coverImage: p.coverImage,
        externalUrl: p.externalUrl,
        publishedAt,
        views: Math.floor(Math.random() * 850 + 50),
      },
      update: {
        titleTr: p.titleTr,
        titleEn: p.titleEn,
        excerptTr: p.excerptTr,
        excerptEn: p.excerptEn,
        bodyTr: p.bodyTr,
        bodyEn: p.bodyEn,
        coverImage: p.coverImage,
        externalUrl: p.externalUrl,
      },
    });
    const icon = p.kind === 'ARTICLE' ? '📝' : p.kind === 'PRESS' ? '📰' : '🎬';
    console.log(`  ${icon} ${p.titleTr.slice(0, 60)}`);
  }

  console.log(`\n✅ ${POSTS.length} blog/medya yazısı yüklendi`);
  console.log('   📝 13 makale (ARTICLE) — 8 evergreen + 5 gündem 2026');
  console.log('   📰 3 basın haberi (PRESS) — dış link');
  console.log('   🎬 1 video (VIDEO) — sanal tur');
  console.log('\n🌐 Web: https://hazalmuti.com/medya');
}

main(process.argv.includes('--reset'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

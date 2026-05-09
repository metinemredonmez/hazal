/**
 * Seed sample documents — 1 örnek per category.
 * Türkiye gayrimenkul iş akışına uygun örnekler.
 *
 * Run on server: cd /var/www/hazal/api && npx tsx prisma/seed-document-samples.ts
 */
import 'dotenv/config';
import { PrismaClient, DocumentCategory } from '@prisma/client';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

const DOCS_DIR = process.env.DOCUMENTS_DIR ?? './documents';
const SAMPLES_DIR = join(process.cwd(), DOCS_DIR, 'samples');

// Tek tipli HTML şablonu — print-ready
function htmlTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page { size: A4; margin: 30mm 25mm; }
  body { font-family: 'Inter', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #14141A; line-height: 1.7; }
  .header { text-align: center; padding-bottom: 24px; border-bottom: 2px solid #C9A96E; margin-bottom: 32px; }
  h1 { font-family: Georgia, serif; font-size: 24px; margin: 0 0 8px 0; }
  .subtitle { color: #6E6E73; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; }
  h2 { font-family: Georgia, serif; font-size: 16px; margin-top: 24px; border-bottom: 1px solid #E5E2DD; padding-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  table td { padding: 6px 10px; border-bottom: 1px solid #E5E2DD; vertical-align: top; }
  table td.label { width: 35%; color: #6E6E73; font-size: 12px; }
  .info { background: #FAF8F4; padding: 12px; border-left: 3px solid #C9A96E; margin: 16px 0; font-size: 13px; }
  .footer { margin-top: 48px; text-align: center; font-size: 10px; color: #6E6E73; letter-spacing: 0.2em; text-transform: uppercase; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <h1>${title}</h1>
  <p class="subtitle">Hazal Muti Real Estate · Örnek Belge</p>
</div>
${body}
<div class="footer">© ${new Date().getFullYear()} Hazal Muti Real Estate · ÖRNEK · Bu belge gerçek değildir</div>
</body>
</html>`;
}

interface Sample {
  category: DocumentCategory;
  title: string;
  description: string;
  filename: string;
  mimeType: string;
  customerName?: string;
  tags: string[];
  generateContent: () => string;
}

const SAMPLES: Sample[] = [
  {
    category: 'CONTRACT',
    title: 'Örnek Kira Sözleşmesi (Bebek)',
    description: 'Standart konut kira sözleşmesi şablonu — TBK uyumlu',
    filename: 'ornek-kira-sozlesmesi.html',
    mimeType: 'text/html',
    customerName: 'Ayşe Yılmaz',
    tags: ['ornek', 'kira', 'bebek', '2026'],
    generateContent: () => htmlTemplate('Konut Kira Sözleşmesi', `
<h2>Taraflar</h2>
<table>
  <tr><td class="label">Kiracı</td><td>Ayşe Yılmaz (TC: 123*****890)</td></tr>
  <tr><td class="label">Mal Sahibi</td><td>Mehmet Demir (TC: 987*****321)</td></tr>
</table>

<h2>Kiralanan Mülk</h2>
<table>
  <tr><td class="label">Adres</td><td>Bebek Mahallesi, Cevdetpaşa Cad. No:15 D:5, Beşiktaş/İstanbul</td></tr>
  <tr><td class="label">Tip</td><td>3+1 Daire, 165 m², 4. kat</td></tr>
</table>

<h2>Mali Şartlar</h2>
<table>
  <tr><td class="label">Aylık Kira</td><td><strong>75.000 TL</strong></td></tr>
  <tr><td class="label">Depozito</td><td>150.000 TL (2 aylık)</td></tr>
  <tr><td class="label">Ödeme Günü</td><td>Her ayın 5'i</td></tr>
  <tr><td class="label">Başlangıç</td><td>1 Haziran 2026</td></tr>
  <tr><td class="label">Süre</td><td>12 ay</td></tr>
</table>

<div class="info">
  <strong>Genel Şartlar:</strong> Kira her ayın 5'inde mal sahibinin IBAN'ına yatırılacaktır. Kiracı, mülkü konut olarak kullanacaktır. Aidat, doğalgaz, elektrik, su gibi kullanım giderleri kiracıya aittir. Mülkte yapısal değişiklik yapılması mal sahibinin yazılı onayına tabidir. Yıllık kira artışı TÜFE'yi geçmeyecek şekilde belirlenecektir.
</div>

<p style="margin-top:60px;"><strong>İmzalar:</strong> Kiracı ........................ &nbsp;&nbsp;&nbsp; Mal Sahibi ........................</p>
`),
  },
  {
    category: 'DEED',
    title: 'Örnek Tapu Senedi (Bebek)',
    description: 'Gayrimenkul tapu senedi örneği',
    filename: 'ornek-tapu-senedi.html',
    mimeType: 'text/html',
    customerName: 'Mehmet Demir',
    tags: ['ornek', 'tapu', 'bebek'],
    generateContent: () => htmlTemplate('Tapu Senedi', `
<div class="info" style="text-align:center; font-size:14px;">
  T.C. ÇEVRE, ŞEHİRCİLİK VE İKLİM DEĞİŞİKLİĞİ BAKANLIĞI<br>
  TAPU VE KADASTRO GENEL MÜDÜRLÜĞÜ<br>
  <strong>BEŞİKTAŞ TAPU MÜDÜRLÜĞÜ</strong>
</div>

<h2>Taşınmaz Bilgileri</h2>
<table>
  <tr><td class="label">İl / İlçe</td><td>İSTANBUL / BEŞİKTAŞ</td></tr>
  <tr><td class="label">Mahalle</td><td>Bebek Mahallesi</td></tr>
  <tr><td class="label">Mevkii</td><td>Cevdetpaşa</td></tr>
  <tr><td class="label">Pafta No</td><td>23</td></tr>
  <tr><td class="label">Ada / Parsel</td><td>156 / 7</td></tr>
  <tr><td class="label">Yüzölçümü</td><td>165 m²</td></tr>
  <tr><td class="label">Niteliği</td><td>Mesken (Daire)</td></tr>
  <tr><td class="label">Kat / Bağımsız Bölüm</td><td>4. Kat / 5</td></tr>
</table>

<h2>Malik</h2>
<table>
  <tr><td class="label">Adı Soyadı</td><td>Mehmet DEMİR</td></tr>
  <tr><td class="label">TC Kimlik No</td><td>987*****321</td></tr>
  <tr><td class="label">Hisse</td><td>1/1 (Tam)</td></tr>
  <tr><td class="label">Edinim Sebebi</td><td>Satış</td></tr>
  <tr><td class="label">Tarih / Yevmiye</td><td>15.03.2024 / 12345</td></tr>
</table>

<div class="info">
  <strong>Şerhler:</strong> Yok<br>
  <strong>Beyanlar:</strong> Yok<br>
  <strong>İrtifak Hakları:</strong> Yok
</div>

<p style="margin-top:40px; text-align:center; font-size:11px; color:#6E6E73;">
  Bu belge örnektir ve gerçek bir tapu senedinin yerine geçmez.
</p>
`),
  },
  {
    category: 'IDENTITY',
    title: 'Örnek Kimlik Bilgi Formu',
    description: 'Müşteri kimlik bilgileri formu örneği',
    filename: 'ornek-kimlik-formu.html',
    mimeType: 'text/html',
    customerName: 'Ayşe Yılmaz',
    tags: ['ornek', 'kimlik', 'musteri'],
    generateContent: () => htmlTemplate('Müşteri Kimlik Bilgi Formu', `
<h2>Müşteri Bilgileri</h2>
<table>
  <tr><td class="label">Adı Soyadı</td><td>Ayşe YILMAZ</td></tr>
  <tr><td class="label">TC Kimlik No</td><td>123*****890</td></tr>
  <tr><td class="label">Doğum Tarihi</td><td>15.06.1985</td></tr>
  <tr><td class="label">Doğum Yeri</td><td>İstanbul</td></tr>
  <tr><td class="label">Anne Adı</td><td>Fatma</td></tr>
  <tr><td class="label">Baba Adı</td><td>Ali</td></tr>
  <tr><td class="label">Cinsiyet</td><td>K</td></tr>
  <tr><td class="label">Uyruk</td><td>T.C.</td></tr>
</table>

<h2>İletişim Bilgileri</h2>
<table>
  <tr><td class="label">Telefon</td><td>+90 5** *** ** **</td></tr>
  <tr><td class="label">E-posta</td><td>ayse@example.com</td></tr>
  <tr><td class="label">Adres</td><td>Etiler Mah. Nispetiye Cad. No:15, Beşiktaş/İstanbul</td></tr>
</table>

<h2>Beyan ve İmza</h2>
<div class="info">
  Yukarıda yer alan bilgilerin doğruluğunu beyan ederim. Kişisel verilerimin Hazal Muti Real Estate tarafından KVKK kapsamında işlenmesine ve gayrimenkul danışmanlığı süreci için saklanmasına onay veriyorum.
</div>

<p style="margin-top:40px;">İmza: ________________ &nbsp;&nbsp;&nbsp; Tarih: ___ / ___ / ______</p>
`),
  },
  {
    category: 'BLUEPRINT',
    title: 'Örnek Mimari Plan Tablosu',
    description: 'Kat planı bilgi tablosu örneği',
    filename: 'ornek-mimari-plan.html',
    mimeType: 'text/html',
    tags: ['ornek', 'mimari', 'plan', 'bebek'],
    generateContent: () => htmlTemplate('Mimari Plan & Ruhsat Bilgisi', `
<h2>Yapı Bilgileri</h2>
<table>
  <tr><td class="label">Yapı Adresi</td><td>Bebek Mah. Cevdetpaşa Cad. No:15</td></tr>
  <tr><td class="label">Pafta / Ada / Parsel</td><td>23 / 156 / 7</td></tr>
  <tr><td class="label">Yapı Sınıfı</td><td>5A</td></tr>
  <tr><td class="label">Toplam Brüt Alan</td><td>2.450 m²</td></tr>
  <tr><td class="label">Toplam Net Alan</td><td>2.180 m²</td></tr>
  <tr><td class="label">Kat Sayısı</td><td>Bodrum + Zemin + 5 Normal Kat</td></tr>
  <tr><td class="label">Bağımsız Bölüm Sayısı</td><td>10 (Mesken)</td></tr>
</table>

<h2>Daire Bilgileri (Bağımsız Bölüm: 5)</h2>
<table>
  <tr><td class="label">Kat / Daire</td><td>4. Kat / 5</td></tr>
  <tr><td class="label">Brüt Alan</td><td>165 m²</td></tr>
  <tr><td class="label">Net Alan</td><td>148 m²</td></tr>
  <tr><td class="label">Oda Sayısı</td><td>3+1 (3 yatak odası, 1 salon)</td></tr>
  <tr><td class="label">Banyo</td><td>2 (Master ebeveyn + ortak)</td></tr>
  <tr><td class="label">Cephe</td><td>Boğaz (Doğu) + Avlu (Batı)</td></tr>
  <tr><td class="label">Balkon / Teras</td><td>1 balkon (12 m²) + 1 teras (8 m²)</td></tr>
</table>

<h2>Ruhsat & İskan</h2>
<table>
  <tr><td class="label">Yapı Ruhsat No</td><td>2018/4567</td></tr>
  <tr><td class="label">Ruhsat Tarihi</td><td>12.05.2018</td></tr>
  <tr><td class="label">Yapı Kullanma İzni (İskan)</td><td>Var — 22.11.2020</td></tr>
  <tr><td class="label">DASK</td><td>Geçerli — 15.04.2026</td></tr>
</table>

<div class="info">
  <strong>Ek belgeler:</strong> Mimari proje çizimleri (PDF), Yapı denetim raporu, Enerji kimlik belgesi (B sınıfı), Kat irtifakı/kat mülkiyeti tapu.
</div>
`),
  },
  {
    category: 'PHOTO',
    title: 'Örnek Mülk Fotoğraf Listesi',
    description: 'İlan fotoğraf check-listesi',
    filename: 'ornek-foto-listesi.html',
    mimeType: 'text/html',
    tags: ['ornek', 'foto', 'checklist'],
    generateContent: () => htmlTemplate('Mülk Fotoğraf Check-Listesi', `
<div class="info">
  Lüks bir gayrimenkul ilanı için minimum 12-15 profesyonel fotoğraf önerilir. Aşağıdaki açılar mutlaka çekilmelidir.
</div>

<h2>Dış Cephe (3-4 foto)</h2>
<table>
  <tr><td>☐ Bina ön cephe (gündüz)</td></tr>
  <tr><td>☐ Bina ön cephe (akşam, ışıklı)</td></tr>
  <tr><td>☐ Giriş kapısı / lobi</td></tr>
  <tr><td>☐ Açık alan (varsa: bahçe, havuz, tenis)</td></tr>
</table>

<h2>İç Mekan — Yaşam Alanları (5-6 foto)</h2>
<table>
  <tr><td>☐ Salon (geniş açı, gündüz ışığı)</td></tr>
  <tr><td>☐ Yemek alanı / oturma grubu</td></tr>
  <tr><td>☐ Mutfak (ada/banko görünümü)</td></tr>
  <tr><td>☐ Mutfak detay (cihazlar, ankastre)</td></tr>
  <tr><td>☐ Hol / koridor</td></tr>
</table>

<h2>Yatak Odaları (3-4 foto)</h2>
<table>
  <tr><td>☐ Master ebeveyn yatak odası</td></tr>
  <tr><td>☐ Master banyo</td></tr>
  <tr><td>☐ Çocuk / misafir odası</td></tr>
  <tr><td>☐ Çalışma odası (varsa)</td></tr>
</table>

<h2>Manzara & Detaylar (2-3 foto)</h2>
<table>
  <tr><td>☐ Pencere/balkondan manzara</td></tr>
  <tr><td>☐ Teras / balkon</td></tr>
  <tr><td>☐ Premium detay (şömine, akıllı ev paneli, akustik tavan)</td></tr>
</table>

<div class="info" style="margin-top:24px;">
  <strong>Çekim notları:</strong>
  <ul style="margin:8px 0; padding-left:20px;">
    <li>16-35mm geniş açı lens</li>
    <li>Düz tripod, 1.2m yükseklik</li>
    <li>HDR bracketing (3-5 kare)</li>
    <li>Gün ışığı + iç ışıklar açık (warm tone tercih)</li>
    <li>Tüm yüzeyler temiz, eşya minimal</li>
  </ul>
</div>
`),
  },
  {
    category: 'INVOICE',
    title: 'Örnek Komisyon Faturası',
    description: 'Aracılık komisyonu fatura örneği',
    filename: 'ornek-komisyon-faturasi.html',
    mimeType: 'text/html',
    customerName: 'Mehmet Demir',
    tags: ['ornek', 'fatura', 'komisyon'],
    generateContent: () => htmlTemplate('Hizmet Faturası', `
<table style="margin-bottom:24px;">
  <tr><td class="label">Fatura No</td><td>HM-2026-0042</td></tr>
  <tr><td class="label">Fatura Tarihi</td><td>15 Mayıs 2026</td></tr>
  <tr><td class="label">Vade Tarihi</td><td>30 Mayıs 2026</td></tr>
</table>

<h2>Satıcı (Hizmet Veren)</h2>
<table>
  <tr><td class="label">Ünvan</td><td>Hazal Muti Real Estate</td></tr>
  <tr><td class="label">Adres</td><td>İstanbul, Türkiye</td></tr>
  <tr><td class="label">Vergi Dairesi / No</td><td>Beşiktaş / 1234567890</td></tr>
</table>

<h2>Alıcı (Müşteri)</h2>
<table>
  <tr><td class="label">Adı Soyadı</td><td>Mehmet DEMİR</td></tr>
  <tr><td class="label">TC Kimlik No</td><td>987*****321</td></tr>
  <tr><td class="label">Adres</td><td>Bebek, İstanbul</td></tr>
</table>

<h2>Hizmet Detayı</h2>
<table>
  <tr><td>1</td><td>Gayrimenkul aracılık komisyonu — Bebek 3+1 satış işlemi (10.000.000 TL üzerinden %2)</td><td style="text-align:right;"><strong>200.000,00 TL</strong></td></tr>
  <tr><td colspan="2" style="text-align:right; color:#6E6E73;">Ara Toplam</td><td style="text-align:right;">200.000,00 TL</td></tr>
  <tr><td colspan="2" style="text-align:right; color:#6E6E73;">KDV (%20)</td><td style="text-align:right;">40.000,00 TL</td></tr>
  <tr><td colspan="2" style="text-align:right;"><strong>GENEL TOPLAM</strong></td><td style="text-align:right;"><strong>240.000,00 TL</strong></td></tr>
</table>

<div class="info">
  <strong>Ödeme:</strong> Tapu devri imzalandığı tarihte aşağıdaki IBAN'a havale.<br>
  <strong>IBAN:</strong> TR12 3456 7890 1234 5678 9012 34<br>
  <strong>Hesap Adı:</strong> Hazal Muti Real Estate
</div>
`),
  },
  {
    category: 'BROCHURE',
    title: 'Örnek İlan Brosürü (Bebek 3+1)',
    description: 'Müşteriye sunulacak ilan tanıtım broşürü',
    filename: 'ornek-brosur.html',
    mimeType: 'text/html',
    tags: ['ornek', 'brosur', 'bebek'],
    generateContent: () => htmlTemplate('Bebek Boğaz Manzaralı Lüks Daire', `
<div style="text-align:center; margin-bottom:24px;">
  <p style="font-size:11px; letter-spacing:0.4em; color:#C9A96E; text-transform:uppercase;">Satılık · 10.000.000 TL</p>
  <p style="font-family:Georgia, serif; font-size:28px; margin:8px 0;">3+1 · 165 m² · Boğaz Manzaralı</p>
  <p style="color:#6E6E73; font-size:13px;">Bebek Mah. Cevdetpaşa Cad. · Beşiktaş</p>
</div>

<h2>Öne Çıkanlar</h2>
<table>
  <tr><td>★ Tam Boğaz manzarası (3 cephe)</td></tr>
  <tr><td>★ Yenilenmiş, anahtar teslim</td></tr>
  <tr><td>★ Akıllı ev sistemi</td></tr>
  <tr><td>★ İtalyan mutfak</td></tr>
  <tr><td>★ Doğal mermer banyolar</td></tr>
  <tr><td>★ Geniş teras (8 m²) + balkon</td></tr>
  <tr><td>★ Kapalı garaj (1 araç) + asansör</td></tr>
</table>

<h2>Detaylar</h2>
<table>
  <tr><td class="label">Brüt Alan</td><td>165 m²</td></tr>
  <tr><td class="label">Net Alan</td><td>148 m²</td></tr>
  <tr><td class="label">Kat</td><td>4. (5 katlı bina)</td></tr>
  <tr><td class="label">Yatak Odası</td><td>3 (1 master)</td></tr>
  <tr><td class="label">Banyo</td><td>2</td></tr>
  <tr><td class="label">Yapım Yılı</td><td>2018 (yeni iskan)</td></tr>
  <tr><td class="label">Aidat</td><td>4.500 TL/ay</td></tr>
  <tr><td class="label">DASK</td><td>Geçerli</td></tr>
</table>

<h2>Çevrede</h2>
<div class="info">
  Cevdetpaşa Cad. üzerinde, Bebek sahiline 3 dk yürüme mesafesinde. Boğaziçi Üniversitesi Güney Kampüs 5 dk, Bebek Parkı 2 dk, Migros 3 dk. Restoranlar (Lucca, Mangerie), kafeler, butikler hemen yakında.
</div>

<h2>İletişim</h2>
<table>
  <tr><td class="label">Hazal Muti</td><td>+90 532 512 76 28</td></tr>
  <tr><td class="label">E-posta</td><td>info@hazalmuti.com</td></tr>
  <tr><td class="label">Web</td><td>hazalmuti.com</td></tr>
</table>
`),
  },
  {
    category: 'OTHER',
    title: 'Örnek İlan Görme Tutanağı',
    description: 'Müşteri ile ilan görme buluşması tutanak örneği',
    filename: 'ornek-gorme-tutanagi.html',
    mimeType: 'text/html',
    customerName: 'Selin Aydın',
    tags: ['ornek', 'tutanak', 'gorme'],
    generateContent: () => htmlTemplate('İlan Görme Tutanağı', `
<table style="margin-bottom:24px;">
  <tr><td class="label">Tarih</td><td>9 Mayıs 2026</td></tr>
  <tr><td class="label">Saat</td><td>14:30</td></tr>
  <tr><td class="label">Süre</td><td>45 dakika</td></tr>
</table>

<h2>Müşteri</h2>
<table>
  <tr><td class="label">Adı Soyadı</td><td>Selin AYDIN</td></tr>
  <tr><td class="label">Telefon</td><td>+90 5** *** ** **</td></tr>
  <tr><td class="label">Bütçe</td><td>8-12M TL</td></tr>
  <tr><td class="label">Tercih</td><td>3+1, deniz manzarası, Bebek/Etiler</td></tr>
</table>

<h2>Görülen Mülk</h2>
<table>
  <tr><td class="label">İlan</td><td>Bebek 3+1 Boğaz Manzaralı (HM-A1B2C3)</td></tr>
  <tr><td class="label">Adres</td><td>Cevdetpaşa Cad. No:15 D:5</td></tr>
  <tr><td class="label">Listeleme Fiyatı</td><td>10.000.000 TL</td></tr>
</table>

<h2>Müşteri Geri Bildirimleri</h2>
<div class="info">
  <strong>Olumlu:</strong> Manzara çok beğenildi, mutfak ve master banyo etkileyici bulundu, semt çocuk için uygun.<br><br>
  <strong>Çekinceler:</strong> 4. kat olması (asansör var ama aile büyükleri için endişe), aidat yüksek bulundu (4.500 TL/ay).<br><br>
  <strong>Soru/talep:</strong> 9.500.000 TL pazarlık marjı var mı? Kapora yüzdesi nedir? Tapu devri ne kadar sürer?
</div>

<h2>Aksiyon Planı</h2>
<table>
  <tr><td>1. Mal sahibinden 9.500.000 TL teklifi için yanıt al (yarın)</td></tr>
  <tr><td>2. Yakındaki 2-3 alternatif ilanı da müşteriye sun (Cuma)</td></tr>
  <tr><td>3. Hukuki süreç bilgi notu hazırla, müşteriye gönder</td></tr>
  <tr><td>4. 1 hafta içinde ikinci görüşme planla</td></tr>
</table>

<p style="margin-top:40px;"><strong>Hazırlayan:</strong> Hazal Muti</p>
`),
  },
];

async function main() {
  if (!existsSync(SAMPLES_DIR)) {
    mkdirSync(SAMPLES_DIR, { recursive: true });
    console.log(`✓ Created ${SAMPLES_DIR}`);
  }

  for (const s of SAMPLES) {
    const existing = await prisma.document.findFirst({
      where: { title: s.title },
    });
    if (existing) {
      console.log(`ℹ ${s.title} zaten var, atlanıyor`);
      continue;
    }

    // Write file
    const filePath = join(SAMPLES_DIR, s.filename);
    const content = s.generateContent();
    writeFileSync(filePath, content, 'utf-8');
    const fileSize = Buffer.byteLength(content, 'utf-8');

    await prisma.document.create({
      data: {
        title: s.title,
        category: s.category,
        fileUrl: `/documents/samples/${s.filename}`,
        fileName: s.filename,
        fileSize,
        mimeType: s.mimeType,
        description: s.description,
        customerName: s.customerName,
        tags: s.tags,
      },
    });
    console.log(`✓ ${s.category}: ${s.title}`);
  }

  console.log(`\nToplam: ${SAMPLES.length} örnek belge eklendi.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

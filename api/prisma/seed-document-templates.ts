/**
 * Seed default document templates for Hazal Muti.
 * Run on server: cd /var/www/hazal/api && npx tsx prisma/seed-document-templates.ts
 */
import 'dotenv/config';
import { PrismaClient, DocumentCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface TemplateVar {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'currency' | 'address';
  default?: string;
}

interface TemplateSeed {
  name: string;
  category: DocumentCategory;
  description: string;
  variables: TemplateVar[];
  htmlBody: string;
}

const baseStyle = `
<style>
  body { font-family: 'Inter', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #14141A; line-height: 1.7; }
  .header { text-align: center; padding-bottom: 24px; border-bottom: 2px solid #C9A96E; margin-bottom: 32px; }
  .header h1 { font-family: Georgia, serif; font-size: 28px; margin: 0 0 8px 0; }
  .header p { color: #6E6E73; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; margin: 0; }
  h2 { font-family: Georgia, serif; font-size: 18px; margin-top: 28px; border-bottom: 1px solid #E5E2DD; padding-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  table td { padding: 8px 12px; border-bottom: 1px solid #E5E2DD; vertical-align: top; }
  table td.label { width: 35%; color: #6E6E73; }
  .clause { margin: 16px 0; padding: 12px; background: #FAF8F4; border-left: 3px solid #C9A96E; }
  .signature-block { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
  .signature { border-top: 1px solid #14141A; padding-top: 8px; text-align: center; font-size: 12px; }
  .signature img { max-height: 60px; margin: 8px 0; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #E5E2DD; text-align: center; font-size: 10px; color: #6E6E73; letter-spacing: 0.2em; text-transform: uppercase; }
  @media print { body { padding: 20px; } }
</style>`;

const TEMPLATES: TemplateSeed[] = [
  {
    name: 'Kira Sözleşmesi',
    category: 'CONTRACT',
    description: 'Standart kira sözleşmesi şablonu — TBK uyumlu',
    variables: [
      { key: 'tenantName', label: 'Kiracı Adı Soyadı', type: 'text' },
      { key: 'tenantId', label: 'Kiracı TC Kimlik No', type: 'text' },
      { key: 'tenantAddress', label: 'Kiracı Adresi', type: 'address' },
      { key: 'ownerName', label: 'Mal Sahibi Adı Soyadı', type: 'text' },
      { key: 'ownerId', label: 'Mal Sahibi TC', type: 'text' },
      { key: 'propertyAddress', label: 'Kiralanan Mülk Adresi', type: 'address' },
      { key: 'monthlyRent', label: 'Aylık Kira', type: 'currency', default: '50000' },
      { key: 'deposit', label: 'Depozito', type: 'currency' },
      { key: 'startDate', label: 'Başlangıç Tarihi', type: 'date' },
      { key: 'duration', label: 'Süre (ay)', type: 'number', default: '12' },
      { key: 'paymentDay', label: 'Ödeme Günü', type: 'number', default: '5' },
    ],
    htmlBody: `${baseStyle}
<div class="header">
  <h1>Konut Kira Sözleşmesi</h1>
  <p>Hazal Muti Real Estate</p>
</div>

<h2>Taraflar</h2>
<table>
  <tr><td class="label">Kiracı</td><td>{{tenantName}} (TC: {{tenantId}})</td></tr>
  <tr><td class="label">Kiracı Adresi</td><td>{{tenantAddress}}</td></tr>
  <tr><td class="label">Mal Sahibi</td><td>{{ownerName}} (TC: {{ownerId}})</td></tr>
</table>

<h2>Konu</h2>
<p>İşbu sözleşme ile mal sahibi <strong>{{ownerName}}</strong>, sahibi olduğu aşağıdaki adreste belirtilen taşınmazı, kiracı <strong>{{tenantName}}</strong>'a konut olarak kullanılmak üzere kiraya vermiştir.</p>

<table>
  <tr><td class="label">Mülk Adresi</td><td>{{propertyAddress}}</td></tr>
</table>

<h2>Mali Şartlar</h2>
<table>
  <tr><td class="label">Aylık Kira Bedeli</td><td><strong>{{monthlyRent}} TL</strong></td></tr>
  <tr><td class="label">Depozito</td><td>{{deposit}} TL</td></tr>
  <tr><td class="label">Ödeme Günü</td><td>Her ayın {{paymentDay}}'i</td></tr>
  <tr><td class="label">Başlangıç Tarihi</td><td>{{startDate}}</td></tr>
  <tr><td class="label">Sözleşme Süresi</td><td>{{duration}} ay</td></tr>
</table>

<h2>Genel Şartlar</h2>
<div class="clause">
  <p>1. Kira bedeli her ayın {{paymentDay}}'inde mal sahibinin bildireceği IBAN'a yatırılacaktır.</p>
  <p>2. Kiracı, mülkü konut olarak kullanacak; ticari faaliyette bulunmayacaktır.</p>
  <p>3. Aidat, doğalgaz, elektrik, su gibi kullanım giderleri kiracıya aittir.</p>
  <p>4. Kiracı, mülkte yapısal değişiklik yapmadan önce mal sahibinden yazılı onay alacaktır.</p>
  <p>5. Sözleşme sonunda mülk teslim alındığı haliyle iade edilecektir; aksi hâlde depozitodan kesinti yapılır.</p>
  <p>6. Yıllık kira artışı TÜFE oranını geçmeyecek şekilde belirlenecektir (TBK m.344).</p>
  <p>7. İhtilaf hâlinde İstanbul mahkemeleri ve icra daireleri yetkilidir.</p>
</div>

<div class="signature-block">
  <div class="signature">
    <p><strong>Kiracı</strong></p>
    <p>{{tenantName}}</p>
    <p>İmza: ________________</p>
  </div>
  <div class="signature">
    <p><strong>Mal Sahibi</strong></p>
    <p>{{ownerName}}</p>
    {{#if hazalSignature}}<img src="{{hazalSignature}}" alt="imza" />{{/if}}
    <p>İmza: ________________</p>
  </div>
</div>

<div class="footer">© {{year}} Hazal Muti Real Estate · {{date}}</div>`,
  },
  {
    name: 'Satış Sözleşmesi (Ön Protokol)',
    category: 'CONTRACT',
    description: 'Gayrimenkul satış vaadi / ön protokol',
    variables: [
      { key: 'buyerName', label: 'Alıcı Adı Soyadı', type: 'text' },
      { key: 'buyerId', label: 'Alıcı TC', type: 'text' },
      { key: 'sellerName', label: 'Satıcı Adı Soyadı', type: 'text' },
      { key: 'sellerId', label: 'Satıcı TC', type: 'text' },
      { key: 'propertyAddress', label: 'Mülk Adresi', type: 'address' },
      { key: 'salePrice', label: 'Satış Bedeli', type: 'currency' },
      { key: 'depositAmount', label: 'Kapora', type: 'currency' },
      { key: 'paymentSchedule', label: 'Ödeme Planı', type: 'text' },
      { key: 'transferDate', label: 'Tapu Devir Tarihi', type: 'date' },
    ],
    htmlBody: `${baseStyle}
<div class="header">
  <h1>Gayrimenkul Satış Vaadi Sözleşmesi</h1>
  <p>Hazal Muti Real Estate · Ön Protokol</p>
</div>

<h2>Taraflar</h2>
<table>
  <tr><td class="label">Alıcı</td><td>{{buyerName}} (TC: {{buyerId}})</td></tr>
  <tr><td class="label">Satıcı</td><td>{{sellerName}} (TC: {{sellerId}})</td></tr>
</table>

<h2>Konu</h2>
<p>Satıcı <strong>{{sellerName}}</strong>, sahibi olduğu aşağıdaki taşınmazı, alıcı <strong>{{buyerName}}</strong>'a satmayı; alıcı da satın almayı vaat ve taahhüt eder.</p>

<table>
  <tr><td class="label">Taşınmaz</td><td>{{propertyAddress}}</td></tr>
</table>

<h2>Mali Şartlar</h2>
<table>
  <tr><td class="label">Toplam Satış Bedeli</td><td><strong>{{salePrice}} TL</strong></td></tr>
  <tr><td class="label">Kapora</td><td>{{depositAmount}} TL (sözleşme imzasında)</td></tr>
  <tr><td class="label">Ödeme Planı</td><td>{{paymentSchedule}}</td></tr>
  <tr><td class="label">Tapu Devir Tarihi</td><td>{{transferDate}}</td></tr>
</table>

<h2>Genel Hükümler</h2>
<div class="clause">
  <p>1. İşbu sözleşmenin imzasıyla beraber alıcı kapora bedelini satıcıya nakden veya banka havalesi ile öder.</p>
  <p>2. Tarafların geçerli mazereti olmaksızın sözleşmeden caymaları hâlinde:</p>
  <p style="margin-left:20px;">— Alıcı caydığı takdirde: Kapora bedeli satıcıda kalır.</p>
  <p style="margin-left:20px;">— Satıcı caydığı takdirde: Kapora bedeli alıcıya iki katı olarak ödenir.</p>
  <p>3. Tapu devri için belirlenen tarihte taraflar Tapu Sicil Müdürlüğünde hazır bulunacaklardır.</p>
  <p>4. Tapu harç, vergi ve benzeri giderler taraflar arasında yarı yarıya paylaşılacaktır.</p>
  <p>5. İhtilaflarda İstanbul mahkemeleri yetkilidir.</p>
</div>

<div class="signature-block">
  <div class="signature">
    <p><strong>Alıcı</strong></p>
    <p>{{buyerName}}</p>
    <p>İmza: ________________</p>
  </div>
  <div class="signature">
    <p><strong>Satıcı</strong></p>
    <p>{{sellerName}}</p>
    <p>İmza: ________________</p>
  </div>
</div>

<div class="footer">© {{year}} Hazal Muti Real Estate · {{date}}</div>`,
  },
  {
    name: 'Komisyon Sözleşmesi',
    category: 'CONTRACT',
    description: 'Müşteri ile komisyon anlaşması',
    variables: [
      { key: 'clientName', label: 'Müşteri Adı', type: 'text' },
      { key: 'clientId', label: 'Müşteri TC', type: 'text' },
      { key: 'clientType', label: 'Tip (Alıcı/Satıcı/Kiracı/Mal Sahibi)', type: 'text' },
      { key: 'commissionRate', label: 'Komisyon Oranı (%)', type: 'number', default: '2' },
      { key: 'paymentTerms', label: 'Ödeme Şartları', type: 'text', default: 'Anlaşma imzalandığında peşin' },
    ],
    htmlBody: `${baseStyle}
<div class="header">
  <h1>Aracılık ve Komisyon Sözleşmesi</h1>
  <p>Hazal Muti Real Estate</p>
</div>

<h2>Taraflar</h2>
<table>
  <tr><td class="label">Aracı (Komisyoncu)</td><td>Hazal Muti Real Estate</td></tr>
  <tr><td class="label">Müşteri</td><td>{{clientName}} (TC: {{clientId}}) — {{clientType}}</td></tr>
</table>

<h2>Konu ve Yetki</h2>
<p>Müşteri <strong>{{clientName}}</strong>, gayrimenkul alım/satım/kiralama sürecinde Hazal Muti Real Estate'e aracılık görevi vermiştir. Aracı, müşterinin ihtiyacına uygun gayrimenkul portföyünden teklif sunma, görüşme ve müzakereyi yürütme yetkisine sahiptir.</p>

<h2>Komisyon</h2>
<table>
  <tr><td class="label">Komisyon Oranı</td><td><strong>{{commissionRate}}%</strong> (+ KDV)</td></tr>
  <tr><td class="label">Hesaplama</td><td>İşlem değeri (satış/kira bedeli) üzerinden</td></tr>
  <tr><td class="label">Ödeme Şartları</td><td>{{paymentTerms}}</td></tr>
</table>

<h2>Şartlar</h2>
<div class="clause">
  <p>1. Müşteri, kendisine sunulan portföyü 3. kişilere aktararak aracıyı devre dışı bırakamaz; aksi takdirde komisyon eksiksiz ödenir.</p>
  <p>2. Aracı tarafından gösterilen mülk için 12 ay içinde alım/kiralama gerçekleşirse komisyon hak edilmiş sayılır.</p>
  <p>3. Komisyon, sözleşme/kira başlangıcı tarihinde ödenir.</p>
  <p>4. Tüm iletişim ve müzakere kayıt altına alınır.</p>
</div>

<div class="signature-block">
  <div class="signature">
    <p><strong>Müşteri</strong></p>
    <p>{{clientName}}</p>
    <p>İmza: ________________</p>
  </div>
  <div class="signature">
    <p><strong>Hazal Muti Real Estate</strong></p>
    <p>Hazal Muti</p>
    {{#if hazalSignature}}<img src="{{hazalSignature}}" alt="imza" />{{/if}}
    <p>İmza: ________________</p>
  </div>
</div>

<div class="footer">© {{year}} Hazal Muti Real Estate · {{date}}</div>`,
  },
  {
    name: 'Vekaletname',
    category: 'CONTRACT',
    description: 'Müşteri Hazal Muti adına işlem yapılması için vekaletname',
    variables: [
      { key: 'principalName', label: 'Vekalet Veren Adı', type: 'text' },
      { key: 'principalId', label: 'TC Kimlik No', type: 'text' },
      { key: 'principalAddress', label: 'Adres', type: 'address' },
      { key: 'authorityScope', label: 'Yetki Kapsamı', type: 'text', default: 'İlan görüntüleme, fiyat müzakeresi, ön anlaşma' },
      { key: 'validUntil', label: 'Geçerlilik Tarihi', type: 'date' },
    ],
    htmlBody: `${baseStyle}
<div class="header">
  <h1>Vekaletname</h1>
  <p>Hazal Muti Real Estate</p>
</div>

<h2>Vekalet Veren</h2>
<table>
  <tr><td class="label">Adı Soyadı</td><td>{{principalName}}</td></tr>
  <tr><td class="label">TC Kimlik No</td><td>{{principalId}}</td></tr>
  <tr><td class="label">Adres</td><td>{{principalAddress}}</td></tr>
</table>

<h2>Vekil</h2>
<table>
  <tr><td class="label">Vekil</td><td>Hazal Muti — Hazal Muti Real Estate</td></tr>
</table>

<h2>Yetki Kapsamı</h2>
<div class="clause">
  <p>Yukarıda kimlik bilgileri yazılı vekalet veren, gayrimenkul alım/satım/kiralama süreçlerinde aşağıdaki yetkileri Hazal Muti'ye devretmiştir:</p>
  <p style="margin-top:12px;">{{authorityScope}}</p>
</div>

<h2>Geçerlilik</h2>
<p>İşbu vekaletname <strong>{{validUntil}}</strong> tarihine kadar geçerlidir. Vekalet veren tarafından her zaman yazılı olarak iptal edilebilir.</p>

<div class="signature-block">
  <div class="signature">
    <p><strong>Vekalet Veren</strong></p>
    <p>{{principalName}}</p>
    <p>İmza: ________________</p>
  </div>
  <div class="signature">
    <p><strong>Vekil</strong></p>
    <p>Hazal Muti</p>
    {{#if hazalSignature}}<img src="{{hazalSignature}}" alt="imza" />{{/if}}
    <p>İmza: ________________</p>
  </div>
</div>

<div class="footer">© {{year}} Hazal Muti Real Estate · {{date}}</div>`,
  },
  {
    name: 'Teklif Mektubu',
    category: 'CONTRACT',
    description: 'Müşteriye fiyat teklifi sunum mektubu',
    variables: [
      { key: 'recipientName', label: 'Alıcı Adı', type: 'text' },
      { key: 'propertyAddress', label: 'İlan Adresi', type: 'address' },
      { key: 'listingTitle', label: 'İlan Başlığı', type: 'text' },
      { key: 'offerAmount', label: 'Teklif Edilen Bedel', type: 'currency' },
      { key: 'paymentMethod', label: 'Ödeme Şekli', type: 'text', default: 'Peşin' },
      { key: 'validityDays', label: 'Geçerlilik (gün)', type: 'number', default: '7' },
    ],
    htmlBody: `${baseStyle}
<div class="header">
  <h1>Fiyat Teklifi</h1>
  <p>Hazal Muti Real Estate</p>
</div>

<p style="margin-top:24px;">Sayın <strong>{{recipientName}}</strong>,</p>

<p>İşbu mektup ile aşağıdaki gayrimenkul için tarafınıza resmi fiyat teklifimi sunmak isterim:</p>

<h2>Mülk Bilgileri</h2>
<table>
  <tr><td class="label">İlan</td><td>{{listingTitle}}</td></tr>
  <tr><td class="label">Adres</td><td>{{propertyAddress}}</td></tr>
</table>

<h2>Teklif</h2>
<table>
  <tr><td class="label">Teklif Edilen Bedel</td><td><strong>{{offerAmount}} TL</strong></td></tr>
  <tr><td class="label">Ödeme Şekli</td><td>{{paymentMethod}}</td></tr>
  <tr><td class="label">Geçerlilik</td><td>{{validityDays}} gün</td></tr>
</table>

<div class="clause">
  <p>İşbu teklif, yukarıda belirtilen tutar üzerinden ve şartlarda geçerlidir. Mutabakat sağlanması hâlinde 7 gün içerisinde ön protokol imzalanması ve %10 oranında kapora ödenmesi öngörülmüştür.</p>
  <p>Saygılarımla,</p>
</div>

<div style="margin-top:48px;">
  <p><strong>Hazal Muti</strong></p>
  <p>Hazal Muti Real Estate</p>
  {{#if hazalSignature}}<img src="{{hazalSignature}}" alt="imza" style="max-height:60px; margin:12px 0;" />{{/if}}
</div>

<div class="footer">© {{year}} Hazal Muti Real Estate · {{date}}</div>`,
  },
];

async function main() {
  for (const t of TEMPLATES) {
    const existing = await prisma.documentTemplate.findFirst({ where: { name: t.name } });
    if (existing) {
      console.log(`ℹ ${t.name} zaten var, atlanıyor.`);
      continue;
    }
    await prisma.documentTemplate.create({
      data: {
        name: t.name,
        category: t.category,
        description: t.description,
        variables: t.variables as unknown as object,
        htmlBody: t.htmlBody,
        isDefault: true,
      },
    });
    console.log(`✓ ${t.name} oluşturuldu`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { LegalLayout } from "@/components/legal-layout";

export const metadata = {
  title: "Kullanım Koşulları",
  description: "Hazal Muti Real Estate web sitesi kullanım koşulları.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Kullanım Koşulları" lastUpdated="08.05.2026">
      <p>
        Bu Kullanım Koşulları ("Koşullar"), <strong>hazalmuti.com</strong> ("Site") web sitesinin
        kullanımına ilişkin esasları düzenler. Siteyi kullanarak bu Koşullar&apos;ı kabul etmiş
        sayılırsınız.
      </p>

      <h2>1. Hizmetin Tanımı</h2>
      <p>
        Site, <strong>Hazal Muti</strong> tarafından sunulan gayrimenkul tanıtım ve iletişim
        hizmetlerini içeren bir tek-broker emlak platformudur. Site üzerinden:
      </p>
      <ul>
        <li>Yayında olan gayrimenkul ilanlarını görüntüleyebilirsiniz</li>
        <li>İletişim formu veya canlı sohbet üzerinden bilgi talep edebilirsiniz</li>
        <li>Gayrimenkul gösterimi randevusu için iletişime geçebilirsiniz</li>
      </ul>

      <h2>2. Üyelik / Hesap</h2>
      <p>
        Site, ziyaretçi bazlı çalışır. <strong>Üyelik kaydı veya hesap oluşturma yoktur.</strong>{" "}
        Yönetim paneli yalnızca site sahibi tarafından kullanılır.
      </p>

      <h2>3. İçerik Doğruluğu</h2>
      <p>
        İlanlardaki bilgiler özenle hazırlanır ancak süreç içinde değişebilir. Kesin teklif ve
        sözleşme öncesinde bilgilerin güncel olduğunu doğrulamak için bizimle iletişime
        geçmenizi tavsiye ederiz.
      </p>
      <p>
        Site üzerinden paylaşılan görseller, metinler ve fiyatlar <strong>bilgilendirme amaçlı
        </strong> olup hukuki bir taahhüt veya sözleşme teklifi niteliği taşımaz.
      </p>

      <h2>4. Telif Hakları</h2>
      <p>
        Sitedeki tüm içerikler (metin, görsel, logo, tasarım, video, yazılım) Hazal Muti&apos;ye
        veya lisans verenlerine aittir ve telif hakkı yasalarıyla korunur. İzinsiz kopyalama,
        çoğaltma, dağıtma veya ticari amaçla kullanma yasaktır.
      </p>

      <h2>5. Yasaklı Kullanımlar</h2>
      <p>Site kullanılırken aşağıdakiler yasaktır:</p>
      <ul>
        <li>Yasalara veya genel ahlaka aykırı içerik gönderme</li>
        <li>Otomatik scraping, botlama, sahte trafik üretme</li>
        <li>Sistemin güvenliğini bozma, zafiyet sömürme girişimi</li>
        <li>Yanıltıcı/sahte iletişim formu doldurma</li>
        <li>Üçüncü kişilerin haklarını ihlal eden içerik gönderme</li>
        <li>Spam, taciz veya tehdit içeren mesajlar gönderme</li>
      </ul>
      <p>
        Bu maddeleri ihlal eden kullanıcıların erişimleri uyarı yapılmaksızın engellenebilir ve
        gerektiğinde yasal yollara başvurulabilir.
      </p>

      <h2>6. Sorumluluk Reddi</h2>
      <p>
        Site "olduğu gibi" sunulur. Hazal Muti, makul özen göstermekle birlikte:
      </p>
      <ul>
        <li>Sitenin kesintisiz veya hatasız çalışacağını taahhüt etmez</li>
        <li>Görüntülenen ilanların değişmeyeceğini garanti etmez</li>
        <li>Üçüncü taraf bağlantılarındaki içeriklerden sorumlu değildir</li>
      </ul>
      <p>
        Hazal Muti&apos;nin sözleşmeden doğan sorumluluğu, ilgili gayrimenkul sürecinde
        akdedilecek <strong>yazılı sözleşme</strong> ile sınırlıdır.
      </p>

      <h2>7. Hizmette Değişiklikler</h2>
      <p>
        Hazal Muti, Site&apos;deki içerikleri ve hizmet kapsamını önceden bildirim yapmaksızın
        değiştirme, güncelleme veya kaldırma hakkını saklı tutar.
      </p>

      <h2>8. Uygulanacak Hukuk ve Yetki</h2>
      <p>
        Bu Koşullar Türkiye Cumhuriyeti yasalarına tabidir. Doğacak uyuşmazlıklarda{" "}
        <strong>İstanbul Mahkemeleri ve İcra Daireleri</strong> yetkilidir.
      </p>

      <h2>9. Yürürlük</h2>
      <p>
        Bu Koşullar yayım tarihi itibarıyla yürürlüktedir. Hazal Muti, Koşulları zaman zaman
        güncelleyebilir. Güncellemeler bu sayfada yayımlandığı tarihte geçerli olur.
      </p>

      <h2>10. İletişim</h2>
      <p>
        Sorularınız için:{" "}
        <a href="mailto:hazalmuti@hotmail.com">hazalmuti@hotmail.com</a> &nbsp;·&nbsp; +90 532
        512 76 28
      </p>
    </LegalLayout>
  );
}

import { LegalLayout } from "@/components/legal-layout";

export const metadata = {
  title: "Gizlilik Politikası",
  description: "Hazal Muti Real Estate gizlilik politikası ve kişisel veri uygulamaları.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Gizlilik Politikası" lastUpdated="08.05.2026">
      <p>
        Hazal Muti Real Estate olarak gizliliğinize önem veriyoruz. Bu politika, web sitemizi
        (<a href="https://hazalmuti.com">hazalmuti.com</a>) ziyaret ettiğinizde veya bizimle
        iletişime geçtiğinizde kişisel verilerinizin nasıl toplandığını, kullanıldığını ve
        korunduğunu açıklar.
      </p>

      <h2>1. Topladığımız Bilgiler</h2>
      <h3>a) Sizin paylaştığınız bilgiler</h3>
      <ul>
        <li>İletişim formu üzerinden: ad, e-posta, telefon (opsiyonel), mesaj</li>
        <li>Canlı sohbet üzerinden: mesajlarınız ve istediğinizde paylaştığınız iletişim bilgileri</li>
        <li>E-posta veya telefonla: kurduğunuz iletişimde paylaştığınız bilgiler</li>
      </ul>

      <h3>b) Otomatik toplanan bilgiler</h3>
      <ul>
        <li>IP adresi, tarayıcı bilgileri, ziyaret tarih/saati</li>
        <li>Sayfa görüntülemeleri, oturum bilgileri</li>
        <li>Çerez verileri (bkz. <a href="/cerez-politikasi">Çerez Politikası</a>)</li>
      </ul>

      <h2>2. Bilgileri Nasıl Kullanırız</h2>
      <ul>
        <li>Talebinize yanıt verme ve sizinle iletişim kurma</li>
        <li>Gayrimenkul gösterimi planlama ve süreç yürütme</li>
        <li>Hizmet kalitemizi ölçme ve iyileştirme</li>
        <li>Web sitesi güvenliğini sağlama, dolandırıcılığı önleme</li>
        <li>Yasal yükümlülüklerimizi yerine getirme</li>
      </ul>
      <p>
        Verileriniz <strong>satılmaz</strong>, üçüncü taraf reklamcılık şirketleriyle
        paylaşılmaz.
      </p>

      <h2>3. Bilgileri Kimlerle Paylaşırız</h2>
      <p>Bilgileriniz yalnızca aşağıdaki sınırlı durumlarda paylaşılabilir:</p>
      <ul>
        <li>
          <strong>Teknik hizmet sağlayıcılar:</strong> hosting, e-posta gönderim, analitik altyapı
          (Google, OpenAI, Cloudflare/Letsencrypt) — yalnızca hizmetin yürütülmesi için gerekli
          asgari veri
        </li>
        <li>
          <strong>Yasal makamlar:</strong> mahkeme kararı, yasal yükümlülük veya kanuni hak
          savunması durumunda
        </li>
      </ul>

      <h2>4. Veri Güvenliği</h2>
      <ul>
        <li>HTTPS (TLS) şifreli iletişim</li>
        <li>Şifrelerin geri-döndürülemez (bcrypt) hash&apos;leri</li>
        <li>İki faktörlü doğrulama (2FA) ile yönetici hesap koruması</li>
        <li>Sınırlı erişim — yalnızca yetkili personel</li>
        <li>Düzenli güvenlik kayıtları ve denetim</li>
      </ul>

      <h2>5. Çocukların Gizliliği</h2>
      <p>
        Hizmetimiz <strong>18 yaşın altındaki</strong> kişilere yönelik değildir ve bilerek bu
        kişilerden veri toplamayız.
      </p>

      <h2>6. Haklarınız</h2>
      <p>
        Verilerinize erişme, düzeltme, silme veya işlemeye itiraz etme haklarınız vardır. Bu
        haklarınızı kullanmak için <a href="/kvkk">KVKK Aydınlatma Metni</a>&apos;nde belirtilen
        kanallarla bizimle iletişime geçebilirsiniz.
      </p>

      <h2>7. Politika Değişiklikleri</h2>
      <p>
        Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişikliklerde web sitemizde duyuru
        yapılır. Bu sayfanın en üstündeki tarih, son güncellemeyi gösterir.
      </p>

      <h2>8. İletişim</h2>
      <p>
        Sorularınız için:{" "}
        <a href="mailto:hazalmuti@hotmail.com">hazalmuti@hotmail.com</a> &nbsp;·&nbsp; +90 532
        512 76 28
      </p>
    </LegalLayout>
  );
}

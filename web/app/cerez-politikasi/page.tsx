import { LegalLayout } from "@/components/legal-layout";

export const metadata = {
  title: "Çerez Politikası",
  description: "Hazal Muti Real Estate çerez kullanımı politikası.",
};

export default function CookiePage() {
  return (
    <LegalLayout title="Çerez Politikası" lastUpdated="08.05.2026">
      <p>
        Bu politika, <strong>hazalmuti.com</strong> üzerinde çerezlerin (cookies) ve benzeri
        teknolojilerin nasıl kullanıldığını açıklar.
      </p>

      <h2>1. Çerez Nedir?</h2>
      <p>
        Çerezler, web sitelerinin tarayıcınıza yerleştirdiği küçük metin dosyalarıdır. Tercihlerinizi
        hatırlamak, oturumunuzu sürdürmek ve site kullanım istatistiklerini ölçmek için kullanılır.
      </p>

      <h2>2. Kullandığımız Çerez Türleri</h2>

      <h3>a) Zorunlu Çerezler</h3>
      <p>
        Sitenin temel işlevlerinin çalışması için gereklidir. Bu çerezler <strong>kapatılamaz
        </strong>; site güvenliği, oturum yönetimi ve form gönderimi için kullanılır.
      </p>
      <ul>
        <li>Oturum çerezleri (session)</li>
        <li>CSRF / güvenlik çerezleri</li>
      </ul>

      <h3>b) Fonksiyonel Çerezler</h3>
      <p>
        Tercihlerinizi (dil, görüntüleme seçenekleri) hatırlamak için kullanılır. Site deneyimini
        iyileştirir.
      </p>

      <h3>c) Analitik Çerezler (opsiyonel)</h3>
      <p>
        Ziyaretçi sayısı, hangi sayfaların görüntülendiği gibi <strong>anonim</strong> istatistikler
        toplar. Site sahibinin ilgilendiği şey toplu trendlerdir; kişisel kimlik bilgisi ile
        eşleştirilmez.
      </p>
      <ul>
        <li>
          <strong>Google Analytics 4</strong> (varsa) — anonim oturum verisi
        </li>
      </ul>

      <h3>d) Pazarlama / Reklam Çerezleri</h3>
      <p>
        Kullanmıyoruz. Üçüncü taraf reklam ağlarına veri aktarmıyoruz.
      </p>

      <h2>3. Üçüncü Taraf Çerezler</h2>
      <p>
        Sitemiz, sınırlı sayıda üçüncü taraf hizmeti kullanır. Bu hizmetler kendi çerezlerini
        ayarlayabilir:
      </p>
      <ul>
        <li>
          <strong>Google</strong> — analitik, oturum açma
        </li>
        <li>
          <strong>Mapbox</strong> — harita gösterimi (eklendiğinde)
        </li>
      </ul>

      <h2>4. Çerez Yönetimi</h2>
      <p>
        Tarayıcınızın ayarlarından çerezleri kontrol edebilir, silebilir veya engelleyebilirsiniz.
        Aşağıdaki bağlantılar tarayıcı bazında çerez yönetim talimatlarını içerir:
      </p>
      <ul>
        <li>
          <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer">
            Google Chrome
          </a>
        </li>
        <li>
          <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noreferrer">
            Safari
          </a>
        </li>
        <li>
          <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noreferrer">
            Firefox
          </a>
        </li>
      </ul>
      <p>
        <strong>Not:</strong> Zorunlu çerezleri devre dışı bırakırsanız sitenin bazı
        işlevlerinde sorun yaşayabilirsiniz.
      </p>

      <h2>5. Onay</h2>
      <p>
        Sitemizi kullanmaya devam etmeniz, bu politikada belirtilen çerezlerin kullanımını
        kabul ettiğiniz anlamına gelir. Onayınızı her zaman tarayıcı ayarlarından geri
        çekebilirsiniz.
      </p>

      <h2>6. Politika Değişiklikleri</h2>
      <p>
        Bu politika güncellenirse bu sayfada en son güncelleme tarihi değiştirilir. Önemli
        değişikliklerde site içinde duyuru yapılır.
      </p>

      <h2>7. İletişim</h2>
      <p>
        Çerezlerle ilgili sorularınız için:{" "}
        <a href="mailto:hazalmuti@hotmail.com">hazalmuti@hotmail.com</a>
      </p>
    </LegalLayout>
  );
}

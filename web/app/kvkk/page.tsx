import { LegalLayout } from "@/components/legal-layout";

export const metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    <LegalLayout title="KVKK Aydınlatma Metni" lastUpdated="08.05.2026">
      <p>
        İşbu aydınlatma metni, 6698 sayılı{" "}
        <strong>Kişisel Verilerin Korunması Kanunu</strong> ("KVKK")&apos;nun 10. maddesi ve
        Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında
        Tebliğ uyarınca, veri sorumlusu sıfatıyla{" "}
        <strong>Hazal Muti</strong> tarafından, kişisel verilerinizin işlenmesine ilişkin
        bilgilendirme amacıyla hazırlanmıştır.
      </p>

      <h2>1. Veri Sorumlusu</h2>
      <p>
        <strong>Hazal Muti — Real Estate</strong>
        <br />
        E-posta: hazalmuti@hotmail.com
        <br />
        Telefon: +90 532 512 76 28
        <br />
        Web: hazalmuti.com
      </p>

      <h2>2. İşlenen Kişisel Veriler</h2>
      <p>İşbu metin kapsamında işlenen kişisel veri kategorileri aşağıdaki gibidir:</p>
      <ul>
        <li>
          <strong>Kimlik bilgileri:</strong> ad, soyad
        </li>
        <li>
          <strong>İletişim bilgileri:</strong> e-posta adresi, telefon numarası
        </li>
        <li>
          <strong>İşlem güvenliği bilgileri:</strong> IP adresi, tarayıcı bilgileri (user-agent),
          ziyaret tarih/saati, oturum kayıtları
        </li>
        <li>
          <strong>Müşteri işlem bilgileri:</strong> ilgilendiğiniz gayrimenkul, talep mesajınız,
          tarafımızca tutulan görüşme notları
        </li>
        <li>
          <strong>Pazarlama analitiği:</strong> site içi anonim kullanım istatistikleri (varsa
          Google Analytics çerezleri aracılığıyla)
        </li>
      </ul>

      <h2>3. Kişisel Verilerin Toplanma Yöntemi</h2>
      <p>
        Kişisel verileriniz; web sitemiz üzerindeki <strong>iletişim formu</strong>, canlı{" "}
        <strong>sohbet (chat)</strong> aracı, <strong>e-posta</strong>, <strong>telefon</strong>{" "}
        ve <strong>WhatsApp</strong> kanalları üzerinden, otomatik veya kısmen otomatik yollarla,
        sözlü veya yazılı olarak elde edilmektedir.
      </p>

      <h2>4. Kişisel Verilerin İşlenme Amaçları</h2>
      <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
      <ul>
        <li>Talebinize yanıt verilmesi ve sizinle iletişim kurulması</li>
        <li>Gayrimenkul gösterimi, fiyat ve satış/kiralama süreçlerinin yürütülmesi</li>
        <li>Hizmet kalitesinin ölçülmesi ve geliştirilmesi</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
        <li>Bilgi güvenliği süreçlerinin işletilmesi (saldırı tespiti, erişim kayıtları)</li>
      </ul>

      <h2>5. Kişisel Verilerin İşlenmesinin Hukuki Sebepleri</h2>
      <p>
        Kişisel verileriniz KVKK&apos;nın 5/2. maddesinde belirtilen aşağıdaki hukuki sebeplere
        dayanılarak işlenmektedir:
      </p>
      <ul>
        <li>
          Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (gayrimenkul süreci)
        </li>
        <li>Hukuki yükümlülüğün yerine getirilmesi</li>
        <li>Veri sorumlusunun meşru menfaatleri (hizmet sunumu, güvenlik)</li>
        <li>İlgili kişinin açık rızası (pazarlama amaçlı iletişim için)</li>
      </ul>

      <h2>6. Kişisel Verilerin Aktarımı</h2>
      <p>
        Kişisel verileriniz, yalnızca yasal zorunluluk halinde resmi makamlara veya sözleşmeli
        teknik hizmet sağlayıcılara (e-posta gönderim, hosting, analitik) ölçülü biçimde
        aktarılabilir. Verileriniz <strong>satılmaz</strong>, üçüncü taraf pazarlama amaçlı
        kullanılmaz.
      </p>
      <p>
        Hizmet sağlayıcılarımız arasında bulunan ve sunucu/işleme faaliyetleri yurt dışında
        gerçekleşebilen aktörler şu şekildedir: <strong>OpenAI</strong> (yapay zekâ destekli
        içerik önerileri), <strong>Google</strong> (kimlik doğrulama, analitik), <strong>
        Cloudflare/Letsencrypt</strong> (alan adı/SSL altyapısı). Bu aktarımlar KVKK m. 9
        kapsamında ve veri minimizasyonu prensibiyle gerçekleştirilir.
      </p>

      <h2>7. Saklama Süresi</h2>
      <ul>
        <li>İletişim formu kayıtları: <strong>2 yıl</strong></li>
        <li>Sohbet kayıtları: <strong>1 yıl</strong></li>
        <li>Sunucu erişim/güvenlik kayıtları: <strong>6 ay</strong></li>
        <li>
          Sözleşme süreçleriyle bağlantılı veriler: yasal saklama süreleri boyunca (10 yıla kadar)
        </li>
      </ul>
      <p>
        Saklama süresinin dolması halinde kişisel verileriniz silinir, yok edilir veya
        anonimleştirilir.
      </p>

      <h2>8. Veri Sahibinin Hakları</h2>
      <p>KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
      <ol>
        <li>Kişisel verinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>Yurt içinde / yurt dışında aktarıldığı üçüncü kişileri bilme</li>
        <li>Eksik veya yanlış işlenmiş ise düzeltilmesini isteme</li>
        <li>KVKK m. 7&apos;de öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
        <li>Düzeltme/silme/yok etme işlemlerinin aktarıldığı 3. kişilere bildirilmesini isteme</li>
        <li>Münhasıran otomatik sistemlerle analiz edilmesi nedeniyle aleyhe sonuç doğmasına itiraz etme</li>
        <li>Hukuka aykırı işlenmesi sebebiyle zarara uğranmışsa zararın giderilmesini talep etme</li>
      </ol>

      <h2>9. Başvuru Yöntemi</h2>
      <p>
        Yukarıdaki haklarınızı kullanmak için kimliğinizi tevsik edici belgelerle birlikte
        taleplerinizi aşağıdaki yollarla iletebilirsiniz:
      </p>
      <ul>
        <li>
          E-posta:{" "}
          <a href="mailto:hazalmuti@hotmail.com">hazalmuti@hotmail.com</a>
        </li>
        <li>Telefon: +90 532 512 76 28</li>
      </ul>
      <p>
        Başvurunuz, talebin niteliğine göre <strong>en geç 30 gün</strong> içinde, kural olarak
        ücretsiz şekilde sonuçlandırılır. Talep ayrıca bir maliyet gerektiriyorsa Kişisel Verileri
        Koruma Kurulu&apos;nca belirlenen tarifedeki ücret talep edilebilir.
      </p>
    </LegalLayout>
  );
}

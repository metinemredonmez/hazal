# Hazal Muti Real Estate — Roadmap & Feature Backlog

Bu dokuman admin panelinin mevcut durumunu, yapılacak özellikleri ve önceliklerini tutar.
Son güncelleme: **2026-05-08**

---

## ✅ Şu an canlıda olan özellikler

| Modül | Durum | Eksiklikler / Geliştirilebilir |
|---|---|---|
| 📋 **Panel (Dashboard)** | Aktif/Öne çıkan/Görüntülenme/Yeni talep stat kartları + En çok görüntülenen ilk 5 ilan + Taslak/Satıldı/Kiralandı sayaçları | Grafik yok, trend görünümü yok, conversion funnel yok |
| 🏠 **İlanlar** | TR/EN CRUD, foto upload, ilanı öne çıkarma, durum yönetimi (taslak/yayında/satıldı/kiralandı/pasif), AI ile açıklama üretme | Toplu işlem (bulk), draft kuyruk, klon (duplicate), karşılaştırma |
| 📥 **Talepler (Inquiry inbox)** | Müşteri formları, status (NEW/CONTACTED/HOT/CLOSED), notlar, AI cevap önerisi | E-posta bildirimi yok, kanban görünümü yok |
| 💬 **Sohbet (Live chat)** | Socket.io tabanlı canlı, typing indicator, read receipt, oturum kapatma | Auto-reply, hazır cevap şablonları, dosya/foto paylaşım yok |
| ✨ **AI Yardımcı** | Çeviri (TR↔EN), ilan açıklaması üretme, müşteri mesajına cevap önerisi | Toplu çeviri, lead skorlama yok |
| ⚙️ **Site Ayarları** | Brand, sosyal medya, hero, hakkımda, SEO (TR/EN), Mapbox token alanı, default para/dil | Bildirim tercihleri yok |
| 🛡️ **Güvenlik (Audit)** | Tüm kritik işlemlerin kayıtları (login, 2FA, profil, vs.) | Harita üzerinde IP, oturum yönetimi (revoke session) yok |
| 🔐 **Auth** | Email + şifre + TOTP 2FA + Google OAuth, JWT 1 yıl, account lockout (5 fail → 15dk lock), token versioning, rol (SUPER_ADMIN/ADMIN) | Şifre sıfırlama (forgot pw) UI yok (backend de yok), oturum cihazları görüntüleme yok |
| 🌐 **Public site** | Anasayfa (hero + footer + 4 hukuki sayfa) | Hakkımda, iletişim, ilan listesi, ilan detay henüz yok |
| 📜 **Hukuki sayfalar** | KVKK, Gizlilik, Kullanım Koşulları, Çerez Politikası — TR, detaylı | EN versiyonları yok |

---

## 🚀 Roadmap — Önem Sırası

### 🔥 Faz 1 — Bu hafta (kritik, 4-6 saat)

| # | Özellik | Tahmini süre | Açıklama |
|---|---|---|---|
| 1 | **📧 E-posta bildirimi** (yeni inquiry → Hazal'a otomatik mail) | 1 saat | Resend / SendGrid SMTP entegrasyonu, template'li mail. **Resend API key gerekli.** |
| 2 | **🔔 In-app bildirim merkezi** | 2 saat | Topbar'a zil ikonu + okunmamış sayacı + dropdown listesi. Yeni inquiry, yeni chat msg, audit önemli olaylar. |
| 3 | **📊 Dashboard grafikleri** (Son 30 gün lead trend, view trend, lead funnel) | 2 saat | Recharts veya Tremor kullanarak. Backend basit time-series endpoint. |
| 4 | **📅 Randevu / gezi takvimi** | 3 saat | İnquiry'den "randevu oluştur", calendar view, hatırlatma. Google Calendar sync sonra. |

### 🎯 Faz 2 — Bu ay (10-12 saat)

| # | Özellik | Tahmini süre |
|---|---|---|
| 5 | **📞 CRM — Kişi kartı** (aynı email'in tüm inquiry/chat geçmişi tek yerde) | 4 saat |
| 6 | **📤 Toplu işlem** (ilanlarda checkbox + toplu durum değiştir / öne çıkar / sil) | 2 saat |
| 7 | **📑 PDF broşür üretici** (her ilan için tek tıkla premium PDF — paylaşılabilir link) | 4 saat |
| 8 | **🏷️ Hazır cevap şablonları** (chat + inquiry için) | 2 saat |
| 9 | **📈 Aylık rapor** (her ayın 1'inde otomatik PDF + e-posta: stats, en çok görüntülenen, lead conversion) | 3 saat |
| 10 | **🌍 Mapbox harita** (ilan detayda harita, lokasyon araması, pin) | 3 saat |
| 11 | **🔁 İlan duplicate / klonla** | 30 dk |
| 12 | **📊 SEO skoru göstergesi** (her ilan: meta title/desc dolu mu, image alt, slug uzunluğu) | 2 saat |

### ⭐ Faz 3 — Sonraki ay (power features)

| # | Özellik | Tahmini süre |
|---|---|---|
| 13 | **📲 WhatsApp Bot entegrasyonu** (gelen mesaj admin'e bildirim, oradan cevap) | 6 saat |
| 14 | **🤖 AI toplu işlemler** (tüm ilanları otomatik çevir, AI ile rerank, lead scoring) | 4 saat |
| 15 | **🎯 Lead skorlama** (AI: "%85 satışa giden, sıcak lead") | 3 saat |
| 16 | **📰 Blog / Makale** (SEO için "Bodrum'da emlak nasıl alınır" tarzı yazılar) | 6 saat |
| 17 | **📧 Newsletter** (yeni ilan gelince abonelere otomatik mail) | 4 saat |
| 18 | **🌐 Tema editörü** (renkleri, fontu admin'den değiştirebilme) | 3 saat |
| 19 | **📱 PWA + Mobile Push** (Hazal telefondan bildirim alır, offline destek) | 4 saat |
| 20 | **💼 Çoklu admin / asistan hesabı** (SUPER_ADMIN yardımcı atayabilir) | 3 saat |
| 21 | **📊 Conversion funnel** (görüntülenme → tıklama → talep → satış zinciri) | 3 saat |

### 🎨 Faz 4 — Lüks dokunuşlar

| # | Özellik | Tahmini süre |
|---|---|---|
| 22 | **🎬 Video tour embedded** (ilan detayında video player) | 1 saat |
| 23 | **🏛️ 3D Tour Matterport** | 1 saat |
| 24 | **🌗 Dark / Light mode toggle** (admin için) | 30 dk |
| 25 | **🌐 Admin UI çoklu dil** (TR/EN switch) | 3 saat |
| 26 | **📊 Karşılaştırma modu** (2-3 ilan yan yana özellik karşılaştırma) | 2 saat |
| 27 | **❤️ Favoriler** (ziyaretçiler için, cookie tabanlı, login'siz) | 2 saat |
| 28 | **📸 Toplu foto optimizasyonu** (sharp ile resize + webp dönüş, build-time) | 2 saat |
| 29 | **🌐 EN versiyonu hukuki sayfalar** | 2 saat |
| 30 | **🔐 Şifre sıfırlama UI + backend** (forgot password mail flow) | 3 saat |

---

## 📋 Public Site (web/) — Faz 1

Şu an web tarafında sadece anasayfa + hukuki sayfalar var. Public site için yapılacak:

| Sayfa | Süre | İçerik |
|---|---|---|
| **Hakkımda** | 2 saat | Hazal hakkında uzun yazı, foto, başarılar, iletişim CTA |
| **İlanlar listesi** | 4 saat | Filtre (tip, kategori, fiyat, oda, m², şehir), grid view, pagination |
| **İlan detay** | 4 saat | Galeri, harita, açıklama, iletişim formu, paylaş, ilgili ilanlar |
| **İletişim** | 2 saat | İletişim bilgileri, harita, form, sosyal medya |
| **404 / Loading** | 30 dk | Premium tarzda |
| **EN dil desteği** | 4 saat | next-intl, tüm sayfalar TR + EN |

---

## 🛠️ Teknik altyapı önerileri

### Production'da eksikler

- [ ] **SSL gerçek sertifika** — admin.hazalmuti.com hâlâ self-signed, Let's Encrypt issue gerekli (DNS yayıldı, tekrar dene)
- [ ] **Cloudflare R2 / S3** — production'da foto storage (lokal disk yerine)
- [ ] **Sentry** — error monitoring
- [ ] **Cloudflare CDN** — public site önünde, daha hızlı + DDoS koruması
- [ ] **Backup script** — Postgres'in günlük yedekleme cron job'u
- [ ] **Health check endpoint** — `/health` (uptime monitor için, örn. UptimeRobot)
- [ ] **Rate limiting** — `@nestjs/throttler` ile login + API endpoint'lerine

### DevOps

- [ ] **CI/CD** — GitHub Actions: push → build → deploy auto
- [ ] **Staging environment** — `staging.hazalmuti.com` test ortamı
- [ ] **Database backup → S3/R2 günlük**

---

## 🔑 Üçüncü taraf credential durumu

| Servis | Durum | Öncelik |
|---|---|---|
| Google OAuth | ✅ Çalışıyor (Hazal'ın Gmail'ini admin email'ine eklemek gerek) | Sonraki adım |
| OpenAI | ✅ Çalışıyor (gpt-4o-mini, ~$5-20/ay) | OK |
| Mapbox public token | ✅ DB'de, frontend kullanmaya hazır | Faz 2'de aktif |
| Mapbox secret token | ❌ Yok (geocoding için) | İsteğe bağlı |
| **Resend API key** | ❌ Yok | **Faz 1 için ZORUNLU** (e-posta bildirimi) |
| Cloudflare R2 | ❌ Yok | İsteğe bağlı, sonra |
| Google Analytics 4 | ❌ Yok | Faz 2'de SEO için |
| Google Search Console | 🟡 Token alındı, DNS TXT eklenecek | Faz 2 |
| WhatsApp Business API | ❌ Yok | Faz 3 |

---

## 🎯 Önerilen başlangıç planı

**Hafta 1 (Faz 1):**
1. ✅ Resend API key al → e-posta bildirimi entegrasyonu
2. ✅ Admin SSL'i issue et (Let's Encrypt — DNS hazır)
3. 🔥 In-app bildirim merkezi (zil ikonu)
4. 📊 Dashboard grafikleri (Recharts ile son 30 gün)
5. 📅 Randevu takvimi (basit, Google Calendar sync sonra)

**Hafta 2-3 (Faz 2):**
6. CRM kişi kartı
7. Toplu ilan işlemleri
8. PDF broşür üretici
9. Mapbox harita

**Sonra (Faz 3+):**
- Public site geliştirme (ilanlar listesi, detay, hakkımda, iletişim)
- WhatsApp entegrasyonu
- AI toplu işlemler
- PWA push

---

## 📝 Notlar

- Hazal max ayda 20 ilan girecek (yüksek scale gerek yok)
- Tek kullanıcı (Hazal) — multi-user ihtiyacı düşük öncelik
- Premium görsel hissi öncelikli (Compass/Sotheby's tarzı)
- Türkiye odaklı — KVKK, TR/EN dil, TL/USD/EUR para
- Backend zaten hazır, çoğu özellik frontend ekleme + minimal API

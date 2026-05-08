"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Save, Globe, ArrowRight, Upload, ImageIcon, X as XIcon } from "lucide-react";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<SiteSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingMedia, setUploadingMedia] = React.useState<"hero" | "logo" | null>(null);
  const heroFileInputRef = React.useRef<HTMLInputElement>(null);
  const logoFileInputRef = React.useRef<HTMLInputElement>(null);

  async function uploadAndSet(file: File, target: "hero" | "logo") {
    setUploadingMedia(target);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await api<Array<{ url: string }>>("/api/admin/uploads", {
        method: "POST",
        body: fd,
      });
      const url = res[0]?.url;
      if (!url) throw new Error("Upload başarısız");
      if (target === "hero") update("heroMediaUrl", url);
      else update("logoUrl", url);
      toast.success(target === "hero" ? "Hero medya yüklendi" : "Logo yüklendi");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload başarısız";
      toast.error(message);
    } finally {
      setUploadingMedia(null);
    }
  }

  React.useEffect(() => {
    api<SiteSettings>("/api/admin/settings")
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    const { id, updatedAt, ...payload } = settings;
    try {
      const res = await api<SiteSettings>("/api/admin/settings", {
        method: "PATCH",
        body: payload,
      });
      setSettings(res);
      toast.success("Ayarlar kaydedildi");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Kaydedilemedi";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return (
      <>
        <Topbar title="Ayarlar" />
        <main className="flex-1 px-4 py-5 space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar title="Site Ayarları" description="Marka, iletişim, içerik" />
      <main className="flex-1 px-4 py-5 space-y-4 animate-fade-up max-w-4xl">
        <Link
          href="/settings/web"
          className="flex items-center justify-between px-4 py-3 border border-[#C9A96E]/40 bg-[#C9A96E]/5 hover:bg-[#C9A96E]/10 rounded-md group transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="h-4 w-4 text-[#C9A96E]" />
            <div>
              <p className="text-sm font-medium">Web Sayfaları</p>
              <p className="text-xs text-muted-foreground">
                Anasayfa, Hakkımda, İletişim sayfalarının metinlerini düzenle
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[#C9A96E] transition-transform group-hover:translate-x-1" />
        </Link>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-xs">Marka</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-3 md:grid-cols-2">
            <Field label="Marka adı" hint="Tüm sayfalarda görünür. Örn: Hazal Muti">
              <Input
                value={settings.brandName}
                onChange={(e) => update("brandName", e.target.value)}
                placeholder="Hazal Muti"
              />
            </Field>
            <Field label="Slogan" hint="Hero altında görünür. Kısa, akılda kalıcı.">
              <Input
                value={settings.tagline ?? ""}
                onChange={(e) => update("tagline", e.target.value)}
                placeholder="İstanbul lüks gayrimenkul · Kişisel danışmanlık"
              />
            </Field>
            <Field label="Logo URL" hint="Yüklediğin logonun URL'i. Boş bırakılırsa metin logo kullanılır.">
              <div className="flex gap-2">
                <Input
                  value={settings.logoUrl ?? ""}
                  onChange={(e) => update("logoUrl", e.target.value)}
                  placeholder="https://hazalmuti.com/uploads/logo.png"
                />
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadAndSet(f, "logo");
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoFileInputRef.current?.click()}
                  disabled={uploadingMedia === "logo"}
                  className="shrink-0 gap-1.5"
                >
                  {uploadingMedia === "logo" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  Yükle
                </Button>
              </div>
              {settings.logoUrl && (
                <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 bg-muted rounded text-[11px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.logoUrl} alt="logo" className="h-6 w-auto object-contain" />
                  <button
                    onClick={() => update("logoUrl", "")}
                    className="text-muted-foreground hover:text-destructive"
                    type="button"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              )}
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Birincil renk" hint="HEX kodu">
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  placeholder="#14141A"
                />
              </Field>
              <Field label="Aksent" hint="Vurgu rengi">
                <Input
                  value={settings.accentColor}
                  onChange={(e) => update("accentColor", e.target.value)}
                  placeholder="#C9A96E"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-xs">İletişim & Sosyal</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-3 md:grid-cols-2">
            <Field label="Telefon" hint="Web ve admin'de görünür. +90 ile başlat.">
              <Input
                value={settings.phone ?? ""}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+90 532 512 76 28"
              />
            </Field>
            <Field label="E-posta" hint="Talepler buraya bildirim olarak düşer.">
              <Input
                value={settings.email ?? ""}
                onChange={(e) => update("email", e.target.value)}
                placeholder="info@hazalmuti.com"
              />
            </Field>
            <Field label="WhatsApp" hint="Web'deki WhatsApp butonu bu numaraya açılır.">
              <Input
                value={settings.whatsapp ?? ""}
                onChange={(e) => update("whatsapp", e.target.value)}
                placeholder="+90 532 512 76 28"
              />
            </Field>
            <Field label="Adres" hint="İletişim sayfasında görünür.">
              <Input
                value={settings.address ?? ""}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Bebek, İstanbul"
              />
            </Field>
            <Field label="Instagram" hint="Tam URL.">
              <Input
                value={settings.instagram ?? ""}
                onChange={(e) => update("instagram", e.target.value)}
                placeholder="https://instagram.com/hazalmuti"
              />
            </Field>
            <Field label="LinkedIn" hint="Tam URL.">
              <Input
                value={settings.linkedin ?? ""}
                onChange={(e) => update("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/hazalmuti"
              />
            </Field>
            <Field label="YouTube" hint="Kanal URL'i. Boş bırakılırsa footer'da gösterilmez.">
              <Input
                value={settings.youtube ?? ""}
                onChange={(e) => update("youtube", e.target.value)}
                placeholder="https://youtube.com/@hazalmuti"
              />
            </Field>
            <Field label="Facebook" hint="Sayfa URL'i. Boş bırakılırsa gösterilmez.">
              <Input
                value={settings.facebook ?? ""}
                onChange={(e) => update("facebook", e.target.value)}
                placeholder="https://facebook.com/hazalmuti"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-xs">Yerelleştirme</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-3 md:grid-cols-3">
            <Field label="Varsayılan dil">
              <Select value={settings.defaultLocale} onValueChange={(v) => update("defaultLocale", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Varsayılan para">
              <Select
                value={settings.defaultCurrency}
                onValueChange={(v) => update("defaultCurrency", v as SiteSettings["defaultCurrency"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">₺ TRY</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                  <SelectItem value="EUR">€ EUR</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Mapbox Token (public)" hint="İlan detayında harita için. mapbox.com → Account → pk.eyJ... ile başlar.">
              <Input
                value={settings.mapboxToken ?? ""}
                onChange={(e) => update("mapboxToken", e.target.value)}
                placeholder="pk.eyJ1Ijoi..."
              />
            </Field>
            <Field label="Google Analytics (G-...)" hint="GA4 Measurement ID. Boş bırakılırsa GA yüklenmez.">
              <Input
                value={settings.gaId ?? ""}
                onChange={(e) => update("gaId", e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-xs">Anasayfa Hero</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-3 md:grid-cols-2">
            <Field label="Başlık (TR)" hint="Anasayfa hero. Kısa, etkili — 4-7 kelime.">
              <Input
                value={settings.heroTitleTr ?? ""}
                onChange={(e) => update("heroTitleTr", e.target.value)}
                placeholder="İstanbul'da seçkin gayrimenkul"
              />
            </Field>
            <Field label="Başlık (EN)" hint="Same idea in English.">
              <Input
                value={settings.heroTitleEn ?? ""}
                onChange={(e) => update("heroTitleEn", e.target.value)}
                placeholder="Curated real estate in Istanbul"
              />
            </Field>
            <Field label="Alt yazı (TR)" hint="Bir cümle. Hizmet vaadini özetle.">
              <Textarea
                rows={2}
                value={settings.heroSubtitleTr ?? ""}
                onChange={(e) => update("heroSubtitleTr", e.target.value)}
                placeholder="Bebek'ten Bodrum'a — şahsen seçilmiş portföy."
              />
            </Field>
            <Field label="Alt yazı (EN)">
              <Textarea
                rows={2}
                value={settings.heroSubtitleEn ?? ""}
                onChange={(e) => update("heroSubtitleEn", e.target.value)}
                placeholder="From Bebek to Bodrum — a personally curated portfolio."
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Hero medya (foto/video)" hint="Anasayfada arka plan. JPG/PNG/MP4. Yatay 16:9 önerilir (1920×1080+). Maks 10 MB.">
                <div className="flex gap-2">
                  <Input
                    value={settings.heroMediaUrl ?? ""}
                    onChange={(e) => update("heroMediaUrl", e.target.value)}
                    placeholder="https://hazalmuti.com/uploads/hero-bosphorus.jpg"
                  />
                  <input
                    ref={heroFileInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadAndSet(f, "hero");
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => heroFileInputRef.current?.click()}
                    disabled={uploadingMedia === "hero"}
                    className="shrink-0 gap-1.5"
                  >
                    {uploadingMedia === "hero" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    Yükle
                  </Button>
                </div>
                {settings.heroMediaUrl && (
                  <div className="mt-2 relative inline-block">
                    {settings.heroMediaUrl.match(/\.(mp4|webm|mov)$/i) ? (
                      <video
                        src={settings.heroMediaUrl}
                        className="h-32 w-auto rounded border border-border object-cover"
                        muted
                        loop
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={settings.heroMediaUrl}
                          alt="hero preview"
                          className="h-32 w-auto rounded border border-border object-cover"
                        />
                      </>
                    )}
                    <button
                      onClick={() => update("heroMediaUrl", "")}
                      className="absolute -top-2 -right-2 bg-white border border-border rounded-full p-1 shadow hover:bg-destructive hover:text-white"
                      type="button"
                      aria-label="Hero medyayı kaldır"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground mt-1.5 inline-flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  Yükle butonu ile foto/video seç → otomatik kaydedilir, "Tüm
                  Değişiklikleri Kaydet"e basmayı unutma.
                </p>
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-xs">Hakkımda</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-3 md:grid-cols-2">
            <Field label="Hakkımda (TR)" hint="2-4 paragraf. Deneyim, uzmanlık, yaklaşım. /hakkimizda sayfasında görünür.">
              <Textarea
                rows={5}
                value={settings.aboutTr ?? ""}
                onChange={(e) => update("aboutTr", e.target.value)}
                placeholder="Hazal Muti, İstanbul'un en prestijli semtlerinde lüks gayrimenkul danışmanlığı yapmaktadır. 10+ yıllık deneyimi ile müşterilerine birebir özen göstererek doğru ev, doğru zaman ve doğru fiyat üçgeninde rehberlik eder. Bebek, Etiler, Cihangir ve Bodrum bölgelerinde uzmanlaşmış bir portföye sahiptir."
              />
            </Field>
            <Field label="Hakkımda (EN)" hint="Same content in English.">
              <Textarea
                rows={5}
                value={settings.aboutEn ?? ""}
                onChange={(e) => update("aboutEn", e.target.value)}
                placeholder="Hazal Muti is a luxury real estate advisor focused on Istanbul's most prestigious neighborhoods. With over a decade of experience, she works one-on-one with each client to find the right home at the right moment and the right price. Her portfolio specializes in Bebek, Etiler, Cihangir and Bodrum."
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-xs">SEO</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-3 md:grid-cols-2">
            <Field label="SEO Başlık (TR)" hint="Google sonuçlarında üst satır. 50-60 karakter ideal.">
              <Input
                value={settings.seoTitleTr ?? ""}
                onChange={(e) => update("seoTitleTr", e.target.value)}
                placeholder="Hazal Muti · İstanbul lüks gayrimenkul"
                maxLength={70}
              />
            </Field>
            <Field label="SEO Başlık (EN)" hint="Google'da EN ziyaretçilere gösterilir.">
              <Input
                value={settings.seoTitleEn ?? ""}
                onChange={(e) => update("seoTitleEn", e.target.value)}
                placeholder="Hazal Muti · Istanbul luxury real estate"
                maxLength={70}
              />
            </Field>
            <Field label="SEO Açıklama (TR)" hint="Google'daki snippet metni. 150-160 karakter ideal.">
              <Textarea
                rows={2}
                value={settings.seoDescTr ?? ""}
                onChange={(e) => update("seoDescTr", e.target.value)}
                placeholder="Bebek, Etiler, Cihangir, Bodrum — özenle seçilmiş satılık ve kiralık lüks daireler, villalar. Kişisel danışmanlık ve diskresyon."
                maxLength={170}
              />
            </Field>
            <Field label="SEO Açıklama (EN)">
              <Textarea
                rows={2}
                value={settings.seoDescEn ?? ""}
                onChange={(e) => update("seoDescEn", e.target.value)}
                placeholder="Bebek, Etiler, Cihangir, Bodrum — hand-picked luxury homes and villas for sale and rent. Personal advisory with full discretion."
                maxLength={170}
              />
            </Field>
          </CardContent>
        </Card>

        <div className="flex justify-end sticky bottom-3 z-10">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#14141A] hover:bg-black text-white shadow-lg gap-2"
            size="lg"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet"}
          </Button>
        </div>
      </main>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/80 leading-snug">{hint}</p>}
    </div>
  );
}

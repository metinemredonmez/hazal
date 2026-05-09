"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Home,
  User,
  Phone,
  ArrowLeft,
  Languages,
  Sparkles,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

// Mirror of api/src/settings/page-content.types.ts
interface BilingualText {
  tr: string;
  en: string;
}
interface PageContent {
  home?: {
    heroEyebrow?: BilingualText;
    heroCtaLabel?: BilingualText;
    featuredTitle?: BilingualText;
    featuredSubtitle?: BilingualText;
    aboutHeading?: BilingualText;
    aboutCtaLabel?: BilingualText;
    contactHeading?: BilingualText;
    contactSubtitle?: BilingualText;
    contactCtaLabel?: BilingualText;
  };
  about?: {
    heroEyebrow?: BilingualText;
    heroTitle?: BilingualText;
    intro?: BilingualText;
    bio1?: BilingualText;
    bio2?: BilingualText;
    specialties?: BilingualText;
    portraitUrl?: string;
    quote?: BilingualText;
    quoteAuthor?: string;
  };
  contact?: {
    heroEyebrow?: BilingualText;
    heroTitle?: BilingualText;
    intro?: BilingualText;
    workingHours?: BilingualText;
    addressLine?: BilingualText;
  };
}

type Section = "home" | "about" | "contact";

const SECTIONS: Array<{ id: Section; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "home", label: "Anasayfa", icon: Home },
  { id: "about", label: "Hakkımda Sayfası", icon: User },
  { id: "contact", label: "İletişim Sayfası", icon: Phone },
];

export default function WebSettingsPage() {
  const [settings, setSettings] = React.useState<SiteSettings | null>(null);
  const [content, setContent] = React.useState<PageContent>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [section, setSection] = React.useState<Section>("home");

  React.useEffect(() => {
    api<SiteSettings & { pageContent?: PageContent | null }>("/api/admin/settings")
      .then((s) => {
        setSettings(s);
        setContent((s.pageContent as PageContent | null) ?? {});
      })
      .finally(() => setLoading(false));
  }, []);

  function setBi(path: string[], lang: "tr" | "en", value: string) {
    setContent((prev) => {
      const next = JSON.parse(JSON.stringify(prev ?? {})) as PageContent;
      let cur: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (typeof cur[key] !== "object" || cur[key] === null) cur[key] = {};
        cur = cur[key] as Record<string, unknown>;
      }
      const leaf = path[path.length - 1];
      const existing = (cur[leaf] as BilingualText | undefined) ?? { tr: "", en: "" };
      cur[leaf] = { ...existing, [lang]: value };
      return next;
    });
  }

  function setStr(path: string[], value: string) {
    setContent((prev) => {
      const next = JSON.parse(JSON.stringify(prev ?? {})) as PageContent;
      let cur: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (typeof cur[key] !== "object" || cur[key] === null) cur[key] = {};
        cur = cur[key] as Record<string, unknown>;
      }
      cur[path[path.length - 1]] = value;
      return next;
    });
  }

  function getBi(path: string[]): BilingualText {
    let cur: unknown = content;
    for (const k of path) {
      if (typeof cur !== "object" || cur === null) return { tr: "", en: "" };
      cur = (cur as Record<string, unknown>)[k];
    }
    if (cur && typeof cur === "object") {
      const c = cur as Partial<BilingualText>;
      return { tr: c.tr ?? "", en: c.en ?? "" };
    }
    return { tr: "", en: "" };
  }

  function getStr(path: string[]): string {
    let cur: unknown = content;
    for (const k of path) {
      if (typeof cur !== "object" || cur === null) return "";
      cur = (cur as Record<string, unknown>)[k];
    }
    return typeof cur === "string" ? cur : "";
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api<SiteSettings>("/api/admin/settings", {
        method: "PATCH",
        body: { pageContent: content },
      });
      setSettings(res);
      toast.success("Web sayfa içerikleri kaydedildi");
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
        <Topbar title="Web Sayfaları" />
        <main className="flex-1 px-4 py-5 space-y-3">
          <Skeleton className="h-32 w-full" />
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Web Sayfaları"
        description="Anasayfa, Hakkımda, İletişim — TR ve EN içerikleri"
      />
      <main className="flex-1 px-4 py-5 space-y-4 animate-fade-up max-w-5xl">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Genel ayarlar
        </Link>

        {/* Section tabs */}
        <div className="flex gap-1 border-b border-border">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={
                  "flex items-center gap-2 px-3 py-2 text-xs border-b-2 -mb-px transition-colors " +
                  (active
                    ? "border-[#C9A96E] text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground")
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>

        {section === "home" && (
          <HomeSection getBi={getBi} setBi={setBi} getStr={getStr} setStr={setStr} />
        )}
        {section === "about" && (
          <AboutSection getBi={getBi} setBi={setBi} getStr={getStr} setStr={setStr} />
        )}
        {section === "contact" && (
          <ContactSection getBi={getBi} setBi={setBi} getStr={getStr} setStr={setStr} />
        )}

        <div className="flex justify-end sticky bottom-3 z-10 lg:pr-52">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#14141A] hover:bg-black text-white shadow-lg gap-2"
            size="lg"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </main>
    </>
  );
}

interface SectionProps {
  getBi: (path: string[]) => BilingualText;
  setBi: (path: string[], lang: "tr" | "en", value: string) => void;
}
interface AboutSectionProps extends SectionProps {
  getStr: (path: string[]) => string;
  setStr: (path: string[], value: string) => void;
}

function HomeSection({ getBi, setBi, getStr, setStr }: SectionProps & { getStr: AboutSectionProps["getStr"]; setStr: AboutSectionProps["setStr"] }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-xs">Hero (üst bölüm)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <HeroMediaUploadField
            value={getStr(["home", "heroMediaUrl"])}
            onChange={(v) => setStr(["home", "heroMediaUrl"], v)}
          />
          <BiInput
            label="Eyebrow (başlık üstündeki küçük yazı)"
            hint="Örn: 'Curated portfolio · Istanbul'"
            tr={getBi(["home", "heroEyebrow"]).tr}
            en={getBi(["home", "heroEyebrow"]).en}
            onTr={(v) => setBi(["home", "heroEyebrow"], "tr", v)}
            onEn={(v) => setBi(["home", "heroEyebrow"], "en", v)}
            placeholder={{ tr: "Seçkin portföy · İstanbul", en: "Curated portfolio · Istanbul" }}
          />
          <BiInput
            label="CTA Buton metni"
            hint="Hero'daki 'İlanları gör' butonu"
            tr={getBi(["home", "heroCtaLabel"]).tr}
            en={getBi(["home", "heroCtaLabel"]).en}
            onTr={(v) => setBi(["home", "heroCtaLabel"], "tr", v)}
            onEn={(v) => setBi(["home", "heroCtaLabel"], "en", v)}
            placeholder={{ tr: "İlanları keşfet", en: "Explore listings" }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-xs">Öne Çıkan İlanlar bölümü</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <SectionImageField
            label="Bölüm üstü görseli (opsiyonel)"
            hint="Öne çıkan ilanlar başlığının arkasında banner olarak görünür. Yatay 16:9."
            value={getStr(["home", "featuredImageUrl"])}
            onChange={(v) => setStr(["home", "featuredImageUrl"], v)}
          />
          <BiInput
            label="Bölüm Başlığı"
            tr={getBi(["home", "featuredTitle"]).tr}
            en={getBi(["home", "featuredTitle"]).en}
            onTr={(v) => setBi(["home", "featuredTitle"], "tr", v)}
            onEn={(v) => setBi(["home", "featuredTitle"], "en", v)}
            placeholder={{ tr: "Öne çıkan ilanlar", en: "Featured listings" }}
          />
          <BiInput
            label="Alt yazı"
            tr={getBi(["home", "featuredSubtitle"]).tr}
            en={getBi(["home", "featuredSubtitle"]).en}
            onTr={(v) => setBi(["home", "featuredSubtitle"], "tr", v)}
            onEn={(v) => setBi(["home", "featuredSubtitle"], "en", v)}
            placeholder={{
              tr: "Bu ay özenle seçilmiş portföy.",
              en: "Hand-picked portfolio this month.",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-xs">Hakkımda Teaser bölümü</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <SectionImageField
            label="Teaser görseli (opsiyonel)"
            hint="Boş bırakılırsa /hakkimizda portresini kullanır. Dik 3:4 fotoğraf önerilir."
            value={getStr(["home", "aboutImageUrl"])}
            onChange={(v) => setStr(["home", "aboutImageUrl"], v)}
            aspectClass="w-24 h-32"
          />
          <BiInput
            label="Başlık"
            hint="Şu an: 'Her müşteri, tek bir hikâye.' / 'Every client, a single story.'"
            tr={getBi(["home", "aboutHeading"]).tr}
            en={getBi(["home", "aboutHeading"]).en}
            onTr={(v) => setBi(["home", "aboutHeading"], "tr", v)}
            onEn={(v) => setBi(["home", "aboutHeading"], "en", v)}
            placeholder={{
              tr: "Her müşteri, tek bir hikâye.",
              en: "Every client, a single story.",
            }}
          />
          <BiInput
            label="CTA Buton metni"
            tr={getBi(["home", "aboutCtaLabel"]).tr}
            en={getBi(["home", "aboutCtaLabel"]).en}
            onTr={(v) => setBi(["home", "aboutCtaLabel"], "tr", v)}
            onEn={(v) => setBi(["home", "aboutCtaLabel"], "en", v)}
            placeholder={{ tr: "Hakkımda", en: "About me" }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-xs">İletişim CTA bölümü</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <SectionImageField
            label="CTA arka plan görseli (opsiyonel)"
            hint="İletişim çağrısı kartı arkaplanı. Yatay 16:9, koyu / blur uygulanacak."
            value={getStr(["home", "contactImageUrl"])}
            onChange={(v) => setStr(["home", "contactImageUrl"], v)}
          />
          <BiInput
            label="Başlık"
            tr={getBi(["home", "contactHeading"]).tr}
            en={getBi(["home", "contactHeading"]).en}
            onTr={(v) => setBi(["home", "contactHeading"], "tr", v)}
            onEn={(v) => setBi(["home", "contactHeading"], "en", v)}
            placeholder={{
              tr: "Sıradaki ev, birlikte bulunur.",
              en: "Your next home, found together.",
            }}
          />
          <BiInput
            label="Alt yazı"
            tr={getBi(["home", "contactSubtitle"]).tr}
            en={getBi(["home", "contactSubtitle"]).en}
            onTr={(v) => setBi(["home", "contactSubtitle"], "tr", v)}
            onEn={(v) => setBi(["home", "contactSubtitle"], "en", v)}
            multiline
          />
          <BiInput
            label="Buton metni"
            tr={getBi(["home", "contactCtaLabel"]).tr}
            en={getBi(["home", "contactCtaLabel"]).en}
            onTr={(v) => setBi(["home", "contactCtaLabel"], "tr", v)}
            onEn={(v) => setBi(["home", "contactCtaLabel"], "en", v)}
            placeholder={{ tr: "İletişime geç", en: "Get in touch" }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-xs">Video Showcase (anasayfa video bölümü)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <p className="text-[11px] text-muted-foreground">
            Anasayfada 3'lü grid olarak gösterilen videolar (tıkla → lightbox).
            Her birine başlık + tarih ve MP4 URL gir. Boş bırakılan slot gösterilmez.
          </p>
          {[1, 2, 3].map((n) => (
            <div key={n} className="border border-border rounded-md p-3 space-y-2.5">
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                Video {n}
              </p>
              <SectionImageField
                label="Video dosyası (MP4)"
                hint="MP4 yükleyebilir veya URL yapıştırabilirsin (max 30 MB öneri)"
                value={getStr(["home", `showcaseVideo${n}Url`])}
                onChange={(v) => setStr(["home", `showcaseVideo${n}Url`], v)}
                aspectClass="w-32 h-20"
                acceptVideo
              />
              <BiInput
                label="Başlık"
                tr={getBi(["home", `showcaseVideo${n}Title`]).tr}
                en={getBi(["home", `showcaseVideo${n}Title`]).en}
                onTr={(v) => setBi(["home", `showcaseVideo${n}Title`], "tr", v)}
                onEn={(v) => setBi(["home", `showcaseVideo${n}Title`], "en", v)}
                placeholder={{ tr: "Atılgan Royal", en: "Atılgan Royal" }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                    Tarih (opsiyonel)
                  </label>
                  <input
                    value={getStr(["home", `showcaseVideo${n}Date`])}
                    onChange={(e) => setStr(["home", `showcaseVideo${n}Date`], e.target.value)}
                    placeholder="24.12.2025"
                    className="w-full h-9 px-2 text-sm border border-input rounded-md bg-background"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AboutSection({ getBi, setBi, getStr, setStr }: AboutSectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-xs">/hakkimizda Hero</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <BiInput
            label="Eyebrow"
            tr={getBi(["about", "heroEyebrow"]).tr}
            en={getBi(["about", "heroEyebrow"]).en}
            onTr={(v) => setBi(["about", "heroEyebrow"], "tr", v)}
            onEn={(v) => setBi(["about", "heroEyebrow"], "en", v)}
            placeholder={{ tr: "Hakkımda", en: "About" }}
          />
          <BiInput
            label="Hero başlığı"
            tr={getBi(["about", "heroTitle"]).tr}
            en={getBi(["about", "heroTitle"]).en}
            onTr={(v) => setBi(["about", "heroTitle"], "tr", v)}
            onEn={(v) => setBi(["about", "heroTitle"], "en", v)}
            placeholder={{ tr: "Hazal Muti", en: "Hazal Muti" }}
          />
          <SectionImageField
            label="Hero arkaplan görseli (opsiyonel)"
            hint="/hakkimizda hero bölümünde arkaplan olarak kullanılır. Yatay 16:9 (1920×1080+)."
            value={getStr(["about", "heroImageUrl"])}
            onChange={(v) => setStr(["about", "heroImageUrl"], v)}
          />
          <PortraitUploadField
            value={getStr(["about", "portraitUrl"])}
            onChange={(v) => setStr(["about", "portraitUrl"], v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-xs">İçerik</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <BiInput
            label="Giriş paragrafı"
            hint="2-3 cümle, ilk dikkat çekecek metin"
            tr={getBi(["about", "intro"]).tr}
            en={getBi(["about", "intro"]).en}
            onTr={(v) => setBi(["about", "intro"], "tr", v)}
            onEn={(v) => setBi(["about", "intro"], "en", v)}
            multiline
            placeholder={{
              tr: "10+ yıllık deneyimi ile İstanbul'un en prestijli semtlerinde lüks gayrimenkul danışmanlığı yapıyorum.",
              en: "With over a decade of experience, I provide luxury real estate advisory in Istanbul's most prestigious neighborhoods.",
            }}
          />
          <BiInput
            label="Bio paragraf 1"
            tr={getBi(["about", "bio1"]).tr}
            en={getBi(["about", "bio1"]).en}
            onTr={(v) => setBi(["about", "bio1"], "tr", v)}
            onEn={(v) => setBi(["about", "bio1"], "en", v)}
            multiline
          />
          <BiInput
            label="Bio paragraf 2"
            hint="Opsiyonel — boş bırakılabilir"
            tr={getBi(["about", "bio2"]).tr}
            en={getBi(["about", "bio2"]).en}
            onTr={(v) => setBi(["about", "bio2"], "tr", v)}
            onEn={(v) => setBi(["about", "bio2"], "en", v)}
            multiline
          />
          <BiInput
            label="Uzmanlık alanları"
            hint="Her satıra bir madde — örn: Bebek Boğaz konutları, Etiler villalar"
            tr={getBi(["about", "specialties"]).tr}
            en={getBi(["about", "specialties"]).en}
            onTr={(v) => setBi(["about", "specialties"], "tr", v)}
            onEn={(v) => setBi(["about", "specialties"], "en", v)}
            multiline
            placeholder={{
              tr: "Bebek Boğaz konutları\nEtiler & Ulus villaları\nCihangir tarihi yapılar\nBodrum yazlık portföyü",
              en: "Bebek Bosphorus residences\nEtiler & Ulus villas\nCihangir historic buildings\nBodrum summer portfolio",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-xs">Pull-quote (opsiyonel)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <BiInput
            label="Alıntı"
            hint="Sayfada büyük tırnak içinde gösterilir"
            tr={getBi(["about", "quote"]).tr}
            en={getBi(["about", "quote"]).en}
            onTr={(v) => setBi(["about", "quote"], "tr", v)}
            onEn={(v) => setBi(["about", "quote"], "en", v)}
            multiline
            placeholder={{
              tr: "Doğru ev, ilk bakışta hissedilir.",
              en: "The right home is felt at first sight.",
            }}
          />
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Kim söylüyor (opsiyonel)
            </Label>
            <Input
              value={getStr(["about", "quoteAuthor"])}
              onChange={(e) => setStr(["about", "quoteAuthor"], e.target.value)}
              placeholder="Hazal Muti"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ContactSection({
  getBi,
  setBi,
  getStr,
  setStr,
}: SectionProps & {
  getStr: AboutSectionProps["getStr"];
  setStr: AboutSectionProps["setStr"];
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-xs">/iletisim sayfa içeriği</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <BiInput
            label="Eyebrow"
            tr={getBi(["contact", "heroEyebrow"]).tr}
            en={getBi(["contact", "heroEyebrow"]).en}
            onTr={(v) => setBi(["contact", "heroEyebrow"], "tr", v)}
            onEn={(v) => setBi(["contact", "heroEyebrow"], "en", v)}
            placeholder={{ tr: "İletişim", en: "Contact" }}
          />
          <BiInput
            label="Hero başlığı"
            tr={getBi(["contact", "heroTitle"]).tr}
            en={getBi(["contact", "heroTitle"]).en}
            onTr={(v) => setBi(["contact", "heroTitle"], "tr", v)}
            onEn={(v) => setBi(["contact", "heroTitle"], "en", v)}
            placeholder={{ tr: "Konuşalım", en: "Let's talk" }}
          />
          <SectionImageField
            label="Hero arkaplan görseli (opsiyonel)"
            hint="/iletisim sayfasının üst banner alanı."
            value={getStr(["contact", "heroImageUrl"])}
            onChange={(v) => setStr(["contact", "heroImageUrl"], v)}
          />
          <BiInput
            label="Tanıtım metni"
            hint="2-3 cümle, sayfanın üstünde"
            tr={getBi(["contact", "intro"]).tr}
            en={getBi(["contact", "intro"]).en}
            onTr={(v) => setBi(["contact", "intro"], "tr", v)}
            onEn={(v) => setBi(["contact", "intro"], "en", v)}
            multiline
            placeholder={{
              tr: "Sorularınız için doğrudan ulaşabilirsiniz. 24 saat içinde yanıtlıyorum.",
              en: "Reach out directly with your questions. I respond within 24 hours.",
            }}
          />
          <BiInput
            label="Çalışma saatleri"
            hint="Her satıra bir gün/aralık"
            tr={getBi(["contact", "workingHours"]).tr}
            en={getBi(["contact", "workingHours"]).en}
            onTr={(v) => setBi(["contact", "workingHours"], "tr", v)}
            onEn={(v) => setBi(["contact", "workingHours"], "en", v)}
            multiline
            placeholder={{
              tr: "Pazartesi – Cumartesi · 09:00 – 19:00\nPazar · randevu ile",
              en: "Monday – Saturday · 09:00 – 19:00\nSunday · by appointment",
            }}
          />
          <BiInput
            label="Adres satırı (opsiyonel)"
            hint="Boş bırakılırsa Genel Ayarlar'daki adres kullanılır"
            tr={getBi(["contact", "addressLine"]).tr}
            en={getBi(["contact", "addressLine"]).en}
            onTr={(v) => setBi(["contact", "addressLine"], "tr", v)}
            onEn={(v) => setBi(["contact", "addressLine"], "en", v)}
            multiline
          />
        </CardContent>
      </Card>
    </div>
  );
}

function BiInput({
  label,
  hint,
  tr,
  en,
  onTr,
  onEn,
  multiline,
  placeholder,
}: {
  label: string;
  hint?: string;
  tr: string;
  en: string;
  onTr: (v: string) => void;
  onEn: (v: string) => void;
  multiline?: boolean;
  placeholder?: { tr?: string; en?: string };
}) {
  const Field = multiline ? Textarea : Input;
  const [translating, setTranslating] = React.useState<"toEn" | "toTr" | null>(null);

  async function translate(direction: "toEn" | "toTr") {
    const source = direction === "toEn" ? "tr" : "en";
    const target = direction === "toEn" ? "en" : "tr";
    const text = (direction === "toEn" ? tr : en).trim();
    if (!text) {
      toast.error(`${source.toUpperCase()} alanı boş — önce yaz`);
      return;
    }
    setTranslating(direction);
    try {
      const { text: translated } = await api<{ text: string }>("/api/admin/ai/translate", {
        method: "POST",
        body: { text, source, target },
      });
      if (direction === "toEn") onEn(translated);
      else onTr(translated);
      toast.success(`AI çevirdi → ${target.toUpperCase()}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Çeviri başarısız";
      toast.error(message);
    } finally {
      setTranslating(null);
    }
  }

  return (
    <div className="space-y-2">
      <div>
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Languages className="h-3 w-3" />
          {label}
        </Label>
        {hint && <p className="text-[11px] text-muted-foreground/80 mt-0.5">{hint}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground/60">TR</span>
            <button
              type="button"
              onClick={() => translate("toEn")}
              disabled={translating !== null || !tr.trim()}
              className="inline-flex items-center gap-1 text-[10px] text-[#C9A96E] hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
              title="TR'den EN'e AI ile çevir"
            >
              {translating === "toEn" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              EN'e çevir
            </button>
          </div>
          <Field
            value={tr}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onTr(e.target.value)
            }
            rows={multiline ? 4 : undefined}
            placeholder={placeholder?.tr}
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground/60">EN</span>
            <button
              type="button"
              onClick={() => translate("toTr")}
              disabled={translating !== null || !en.trim()}
              className="inline-flex items-center gap-1 text-[10px] text-[#C9A96E] hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
              title="EN'den TR'ye AI ile çevir"
            >
              {translating === "toTr" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              TR'ye çevir
            </button>
          </div>
          <Field
            value={en}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onEn(e.target.value)
            }
            rows={multiline ? 4 : undefined}
            placeholder={placeholder?.en}
          />
        </div>
      </div>
    </div>
  );
}

function HeroMediaUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const isVideo = /\.(mp4|mov|webm)$/i.test(value);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok =
      file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!ok) {
      toast.error("Sadece görsel veya video yükle");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      toast.error("Dosya 30 MB'dan büyük olamaz");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await api<Array<{ url: string }>>("/api/admin/uploads", {
        method: "POST",
        body: fd,
      });
      const url = res[0]?.url;
      if (!url) throw new Error("Upload başarısız");
      onChange(url);
      toast.success("Anasayfa medya yüklendi");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload başarısız");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Anasayfa Hero Medya (1920×1080+ önerilir)
      </Label>

      <div className="flex gap-3 items-start">
        <div className="w-32 h-20 rounded-md bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
          {value ? (
            isVideo ? (
              <video
                src={value}
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="Hero"
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFile}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="gap-1.5"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {value ? "Değiştir" : "Yükle"}
            </Button>
            {value && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange("")}
                className="gap-1.5"
              >
                <X className="h-3.5 w-3.5" /> Kaldır
              </Button>
            )}
          </div>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Veya URL yapıştır"
            className="text-xs font-mono"
          />
          <p className="text-[11px] text-muted-foreground">
            Anasayfa hero arka plan. Yatay 16:9 (1920×1080+) JPG/PNG/WebP/MP4. Maks 30 MB.
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionImageField({
  label,
  hint,
  value,
  onChange,
  aspectClass = "w-32 h-20",
  acceptVideo = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  aspectClass?: string;
  acceptVideo?: boolean;
}) {
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const isVideo = /\.(mp4|mov|webm)$/i.test(value);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok =
      file.type.startsWith("image/") ||
      (acceptVideo && file.type.startsWith("video/"));
    if (!ok) {
      toast.error(
        acceptVideo ? "Sadece görsel veya video" : "Sadece görsel yükle",
      );
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      toast.error("Dosya 30 MB'dan büyük olamaz");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await api<Array<{ url: string }>>("/api/admin/uploads", {
        method: "POST",
        body: fd,
      });
      const url = res[0]?.url;
      if (!url) throw new Error("Upload başarısız");
      onChange(url);
      toast.success(`${label} yüklendi`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload başarısız");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="flex gap-3 items-start">
        <div
          className={`${aspectClass} rounded-md bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center`}
        >
          {value ? (
            isVideo ? (
              <video
                src={value}
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept={acceptVideo ? "image/*,video/*" : "image/*"}
            className="hidden"
            onChange={handleFile}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="gap-1.5"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {value ? "Değiştir" : "Yükle"}
            </Button>
            {value && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange("")}
                className="gap-1.5"
              >
                <X className="h-3.5 w-3.5" /> Kaldır
              </Button>
            )}
          </div>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Veya URL yapıştır"
            className="text-xs font-mono"
          />
          {hint && (
            <p className="text-[11px] text-muted-foreground">{hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PortraitUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Sadece görsel dosya yükle");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya 10 MB'dan büyük olamaz");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await api<Array<{ url: string }>>("/api/admin/uploads", {
        method: "POST",
        body: fd,
      });
      const url = res[0]?.url;
      if (!url) throw new Error("Upload başarısız");
      onChange(url);
      toast.success("Portre yüklendi");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload başarısız");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Hakkımda Portresi (1080×1440 önerilir)
      </Label>

      <div className="flex gap-3 items-start">
        {/* Önizleme */}
        <div className="w-24 h-32 rounded-md bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Portre"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="gap-1.5"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {value ? "Değiştir" : "Yükle"}
            </Button>
            {value && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange("")}
                className="gap-1.5"
              >
                <X className="h-3.5 w-3.5" /> Kaldır
              </Button>
            )}
          </div>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Veya URL yapıştır"
            className="text-xs font-mono"
          />
          <p className="text-[11px] text-muted-foreground">
            Hakkımda sayfasında ve anasayfa portre alanında bu fotoğraf görünür.
            JPG/PNG/WebP, dik (3:4) oran tercih edilir.
          </p>
        </div>
      </div>
    </div>
  );
}

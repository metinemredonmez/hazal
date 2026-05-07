"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
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
        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-xs">Marka</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-3 md:grid-cols-2">
            <Field label="Marka adı">
              <Input value={settings.brandName} onChange={(e) => update("brandName", e.target.value)} />
            </Field>
            <Field label="Slogan">
              <Input value={settings.tagline ?? ""} onChange={(e) => update("tagline", e.target.value)} />
            </Field>
            <Field label="Logo URL">
              <Input value={settings.logoUrl ?? ""} onChange={(e) => update("logoUrl", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Birincil renk">
                <Input value={settings.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} />
              </Field>
              <Field label="Aksent">
                <Input value={settings.accentColor} onChange={(e) => update("accentColor", e.target.value)} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-xs">İletişim & Sosyal</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-3 md:grid-cols-2">
            <Field label="Telefon"><Input value={settings.phone ?? ""} onChange={(e) => update("phone", e.target.value)} /></Field>
            <Field label="E-posta"><Input value={settings.email ?? ""} onChange={(e) => update("email", e.target.value)} /></Field>
            <Field label="WhatsApp"><Input value={settings.whatsapp ?? ""} onChange={(e) => update("whatsapp", e.target.value)} /></Field>
            <Field label="Adres"><Input value={settings.address ?? ""} onChange={(e) => update("address", e.target.value)} /></Field>
            <Field label="Instagram"><Input value={settings.instagram ?? ""} onChange={(e) => update("instagram", e.target.value)} /></Field>
            <Field label="LinkedIn"><Input value={settings.linkedin ?? ""} onChange={(e) => update("linkedin", e.target.value)} /></Field>
            <Field label="YouTube"><Input value={settings.youtube ?? ""} onChange={(e) => update("youtube", e.target.value)} /></Field>
            <Field label="Facebook"><Input value={settings.facebook ?? ""} onChange={(e) => update("facebook", e.target.value)} /></Field>
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
            <Field label="Mapbox Token (public)">
              <Input value={settings.mapboxToken ?? ""} onChange={(e) => update("mapboxToken", e.target.value)} />
            </Field>
            <Field label="Google Analytics (G-...)">
              <Input value={settings.gaId ?? ""} onChange={(e) => update("gaId", e.target.value)} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-xs">Anasayfa Hero</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-3 md:grid-cols-2">
            <Field label="Başlık (TR)"><Input value={settings.heroTitleTr ?? ""} onChange={(e) => update("heroTitleTr", e.target.value)} /></Field>
            <Field label="Başlık (EN)"><Input value={settings.heroTitleEn ?? ""} onChange={(e) => update("heroTitleEn", e.target.value)} /></Field>
            <Field label="Alt yazı (TR)"><Textarea rows={2} value={settings.heroSubtitleTr ?? ""} onChange={(e) => update("heroSubtitleTr", e.target.value)} /></Field>
            <Field label="Alt yazı (EN)"><Textarea rows={2} value={settings.heroSubtitleEn ?? ""} onChange={(e) => update("heroSubtitleEn", e.target.value)} /></Field>
            <div className="md:col-span-2">
              <Field label="Hero medya URL (foto/video)"><Input value={settings.heroMediaUrl ?? ""} onChange={(e) => update("heroMediaUrl", e.target.value)} /></Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-xs">Hakkımda</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-3 md:grid-cols-2">
            <Field label="Hakkımda (TR)"><Textarea rows={5} value={settings.aboutTr ?? ""} onChange={(e) => update("aboutTr", e.target.value)} /></Field>
            <Field label="Hakkımda (EN)"><Textarea rows={5} value={settings.aboutEn ?? ""} onChange={(e) => update("aboutEn", e.target.value)} /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-xs">SEO</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-3 md:grid-cols-2">
            <Field label="SEO Başlık (TR)"><Input value={settings.seoTitleTr ?? ""} onChange={(e) => update("seoTitleTr", e.target.value)} /></Field>
            <Field label="SEO Başlık (EN)"><Input value={settings.seoTitleEn ?? ""} onChange={(e) => update("seoTitleEn", e.target.value)} /></Field>
            <Field label="SEO Açıklama (TR)"><Textarea rows={2} value={settings.seoDescTr ?? ""} onChange={(e) => update("seoDescTr", e.target.value)} /></Field>
            <Field label="SEO Açıklama (EN)"><Textarea rows={2} value={settings.seoDescEn ?? ""} onChange={(e) => update("seoDescEn", e.target.value)} /></Field>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

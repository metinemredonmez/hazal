"use client";

import * as React from "react";
import { toast } from "sonner";
import { Send, BellRing, AlertCircle, Sparkles, Home, TrendingDown, Calendar, Newspaper, Settings as SettingsIcon, Save, Loader2, Users, Search, Check, Heart, Phone, Gift, Building2, Clock } from "lucide-react";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface PushStatus {
  configured: boolean;
}

interface SendResult {
  id: string | null;
  recipients: number;
  emailsSent?: number;
  emailsFailed?: number;
}

interface Template {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  titleTr: string;
  titleEn: string;
  bodyTr: string;
  bodyEn: string;
}

const TEMPLATES: Template[] = [
  {
    id: "new-listing",
    label: "Yeni İlan",
    icon: Home,
    titleTr: "Yeni ilan: Bebek'te deniz manzaralı 3+1",
    titleEn: "New listing: 3+1 sea-view in Bebek",
    bodyTr: "Tarihi yapıda yenilenmiş, geniş teras, panoramik Boğaz manzarası. Detaylar için tıklayın.",
    bodyEn: "Renovated historic building, large terrace, panoramic Bosphorus view. Click for details.",
  },
  {
    id: "price-drop",
    label: "Fiyat İndirimi",
    icon: TrendingDown,
    titleTr: "Fiyat güncellendi · Cihangir 2+1",
    titleEn: "Price update · 2+1 in Cihangir",
    bodyTr: "Beğendiğiniz daire için fiyat güncellendi. Hızlı değerlendirin.",
    bodyEn: "The price has been updated for this listing. Move fast.",
  },
  {
    id: "open-house",
    label: "Açık Ev / Randevu",
    icon: Calendar,
    titleTr: "Açık ev: Cumartesi Etiler portföyü",
    titleEn: "Open house: Saturday in Etiler",
    bodyTr: "Bu hafta sonu seçili ilanlar için randevu açık. Gelmek için kayıt olun.",
    bodyEn: "Selected listings open for visits this weekend. Register to attend.",
  },
  {
    id: "market-report",
    label: "Aylık Rapor",
    icon: Newspaper,
    titleTr: "Mayıs market raporu yayında",
    titleEn: "May market report is live",
    bodyTr: "İstanbul lüks gayrimenkul piyasası — bu ayın özet analizi.",
    bodyEn: "Istanbul luxury real estate — this month's summary analysis.",
  },
  // ─── Sade / Minimal şablonlar ──────────────────────────────────
  {
    id: "minimal-hello",
    label: "Selam",
    icon: Heart,
    titleTr: "Hazal Muti",
    titleEn: "Hazal Muti",
    bodyTr: "Merhaba 👋",
    bodyEn: "Hello 👋",
  },
  {
    id: "minimal-call-back",
    label: "Geri Dönüş",
    icon: Phone,
    titleTr: "Sizi aradık",
    titleEn: "We tried to reach you",
    bodyTr: "Müsait olduğunuzda dönerseniz sevinirim.",
    bodyEn: "Please call back when you're available.",
  },
  {
    id: "minimal-thank-you",
    label: "Teşekkür",
    icon: Gift,
    titleTr: "Teşekkürler",
    titleEn: "Thank you",
    bodyTr: "Güveniniz için teşekkür ederim. İyi günlerde kullanın.",
    bodyEn: "Thank you for your trust. Wishing you the best.",
  },
  {
    id: "minimal-new-portfolio",
    label: "Portföy",
    icon: Building2,
    titleTr: "Yeni portföy",
    titleEn: "New portfolio",
    bodyTr: "İlgilenebileceğinizi düşündüğüm yeni ilanlar var.",
    bodyEn: "I have new listings you might like.",
  },
  {
    id: "minimal-followup",
    label: "Takip",
    icon: Clock,
    titleTr: "Hatırlatma",
    titleEn: "Reminder",
    bodyTr: "Geçen hafta görüştüğümüz konuda durum nedir?",
    bodyEn: "Any update on what we discussed last week?",
  },
];

export default function PushPage() {
  const [titleTr, setTitleTr] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [bodyTr, setBodyTr] = React.useState("");
  const [bodyEn, setBodyEn] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [emailRecipients, setEmailRecipients] = React.useState("");
  const [recipientPickerOpen, setRecipientPickerOpen] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [status, setStatus] = React.useState<PushStatus | null>(null);
  const [lastResult, setLastResult] = React.useState<SendResult | null>(null);

  function applyTemplate(t: Template) {
    setTitleTr(t.titleTr);
    setTitleEn(t.titleEn);
    setBodyTr(t.bodyTr);
    setBodyEn(t.bodyEn);
    toast.success(`Şablon yüklendi: ${t.label}`);
  }

  const [configOpen, setConfigOpen] = React.useState(false);
  const [appConfig, setAppConfig] = React.useState<{
    name?: string;
    site_name?: string;
    chrome_web_origin?: string;
    chrome_web_default_notification_icon?: string;
    chrome_web_sub_domain?: string;
  }>({});
  const [savingConfig, setSavingConfig] = React.useState(false);
  const [loadingConfig, setLoadingConfig] = React.useState(false);

  React.useEffect(() => {
    api<PushStatus>("/api/admin/push/status")
      .then(setStatus)
      .catch(() => setStatus({ configured: false }));
  }, []);

  async function loadConfig() {
    setLoadingConfig(true);
    try {
      const cfg = await api<typeof appConfig>("/api/admin/push/config");
      setAppConfig(cfg);
      setConfigOpen(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Config yüklenemedi");
    } finally {
      setLoadingConfig(false);
    }
  }

  async function saveConfig() {
    setSavingConfig(true);
    try {
      await api("/api/admin/push/config", { method: "PATCH", body: appConfig });
      toast.success("OneSignal yapılandırması güncellendi");
      setConfigOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSavingConfig(false);
    }
  }

  async function handleSend() {
    if (!titleTr || !titleEn || !bodyTr || !bodyEn) {
      toast.error("TR ve EN başlık + içerik zorunlu");
      return;
    }

    const recipients = emailRecipients
      .split(/[\s,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const invalid = recipients.find((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (invalid) {
      toast.error(`Geçersiz e-posta: ${invalid}`);
      return;
    }

    setSending(true);
    try {
      const res = await api<SendResult>("/api/admin/push/send", {
        method: "POST",
        body: {
          titleTr,
          titleEn,
          bodyTr,
          bodyEn,
          url: url || undefined,
          imageUrl: imageUrl || undefined,
          emailRecipients: recipients.length > 0 ? recipients : undefined,
        },
      });
      setLastResult(res);
      const emailMsg =
        res.emailsSent && res.emailsSent > 0
          ? ` + ${res.emailsSent} e-posta`
          : "";
      toast.success(`Gönderildi · ${res.recipients} push${emailMsg}`);
      if (res.emailsFailed && res.emailsFailed > 0) {
        toast.warning(`${res.emailsFailed} e-posta gönderilemedi`);
      }
      setTitleTr("");
      setTitleEn("");
      setBodyTr("");
      setBodyEn("");
      setUrl("");
      setImageUrl("");
      setEmailRecipients("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gönderilemedi";
      toast.error(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Topbar
        title="Push Bildirimler"
        description="Web sitesi abonelerine toplu bildirim gönder"
        actions={
          status?.configured ? (
            <Button
              variant="outline"
              size="sm"
              onClick={loadConfig}
              disabled={loadingConfig}
              className="gap-1.5"
            >
              {loadingConfig ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <SettingsIcon className="h-3.5 w-3.5" />
              )}
              OneSignal Ayarları
            </Button>
          ) : null
        }
      />
      <main className="flex-1 px-6 py-8 space-y-6 animate-fade-up">
        {status && !status.configured && (
          <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
            <div>
              <p className="font-medium text-amber-900">Push bildirimi servisi aktif değil</p>
              <p className="text-amber-800 text-xs mt-1">
                Web sitesi abonelerine bildirim gönderebilmek için push servisinin yapılandırılması gerekiyor. Sistem yöneticisi tarafından kurulduktan sonra kullanılabilir olacak.
              </p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-[#C9A96E]" /> Hazır şablonlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {TEMPLATES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="flex items-start gap-2 p-3 text-left border border-border rounded-md hover:border-[#C9A96E] hover:bg-amber-50/40 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-[#C9A96E] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {t.titleTr}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="h-4 w-4 text-[#C9A96E]" /> Yeni bildirim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="titleTr">Başlık (TR)</Label>
                <Input
                  id="titleTr"
                  value={titleTr}
                  onChange={(e) => setTitleTr(e.target.value)}
                  placeholder="Örn: Yeni ilan: Bebek'te deniz manzaralı 3+1"
                  maxLength={120}
                />
                <p className="text-[11px] text-muted-foreground">
                  Kısa, dikkat çekici bir başlık. {titleTr.length}/120
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="titleEn">Title (EN)</Label>
                <Input
                  id="titleEn"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="E.g.: New listing: 3+1 sea-view in Bebek"
                  maxLength={120}
                />
                <p className="text-[11px] text-muted-foreground">
                  Yabancı abonelere gider. {titleEn.length}/120
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bodyTr">İçerik (TR)</Label>
                <Textarea
                  id="bodyTr"
                  value={bodyTr}
                  onChange={(e) => setBodyTr(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Örn: Tarihi yapıda yenilenmiş, geniş teras, panoramik Boğaz manzarası. Detaylar için tıklayın."
                />
                <p className="text-[11px] text-muted-foreground">
                  1-2 cümle, ilanın en çekici özelliği. {bodyTr.length}/500
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bodyEn">Body (EN)</Label>
                <Textarea
                  id="bodyEn"
                  value={bodyEn}
                  onChange={(e) => setBodyEn(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="E.g.: Renovated historic building, large terrace, panoramic Bosphorus view. Click for details."
                />
                <p className="text-[11px] text-muted-foreground">
                  Yabancı abonelere gider. {bodyEn.length}/500
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="url">Hedef URL (opsiyonel)</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://hazalmuti.com/ilanlar/bebek-3-1-deniz-manzarali"
                />
                <p className="text-[11px] text-muted-foreground">
                  Bildirime tıklayan kullanıcı buraya yönlendirilir.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="imageUrl">Görsel URL (opsiyonel)</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://hazalmuti.com/uploads/.../kapak.jpg"
                />
                <p className="text-[11px] text-muted-foreground">
                  Bildirimde görünür (en iyi 1024×512). Boş bırakılabilir.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="emailRecipients" className="flex items-center gap-2">
                  📧 E-posta ile de gönder (opsiyonel)
                </Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRecipientPickerOpen(true)}
                  className="gap-1.5 text-xs h-7"
                >
                  <Users className="h-3 w-3" />
                  Kayıtlılardan Seç
                </Button>
              </div>
              <Textarea
                id="emailRecipients"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                placeholder="ahmet@example.com, ayse@example.com&#10;veya 'Kayıtlılardan Seç' ile müşteri/rehber/bülten abonelerinden seç"
                rows={3}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Push aboneliği olmayan kişilere de aynı bildirimi e-posta olarak yollar.
                Manuel yaz (virgülle/satır ile) veya yukarıdan kayıtlı kişilerden seç.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <p className="text-xs text-muted-foreground flex-1">
                📢 Push, sitede bildirim aboneliği olan ziyaretçilere; e-posta ise yukarıda listelediğin adreslere gönderilir.
              </p>
              <Button
                onClick={handleSend}
                disabled={sending || (status !== null && !status.configured)}
                className="bg-[#14141A] hover:bg-black text-white gap-2"
              >
                <Send className="h-4 w-4" />
                {sending ? "Gönderiliyor..." : "Gönder"}
              </Button>
            </div>

            {lastResult && (
              <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
                <div>
                  Son gönderim · ID:{" "}
                  <code className="text-foreground">{lastResult.id ?? "—"}</code> · Push:{" "}
                  <strong className="text-foreground">{lastResult.recipients}</strong>
                  {typeof lastResult.emailsSent === "number" && lastResult.emailsSent > 0 && (
                    <>
                      {" · E-posta: "}
                      <strong className="text-foreground">{lastResult.emailsSent}</strong>
                    </>
                  )}
                  {typeof lastResult.emailsFailed === "number" && lastResult.emailsFailed > 0 && (
                    <>
                      {" · "}
                      <span className="text-red-600">Başarısız: {lastResult.emailsFailed}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* OneSignal Web Config Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>OneSignal Web Yapılandırması</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="text-xs text-muted-foreground p-2 bg-amber-50 border border-amber-200 rounded">
              💡 Bu ayarlar OneSignal hesabında güncellenir — sayfayı kaydet,
              ziyaretçilerin gördüğü push abonelik prompt'u bu değerlerle çıkar.
            </div>
            <div className="space-y-1">
              <Label className="text-xs">App Adı (dashboard'da görünür)</Label>
              <Input
                value={appConfig.name ?? ""}
                onChange={(e) =>
                  setAppConfig((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Hazal Muti Real Estate"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Site Adı (push'ta görünür)</Label>
              <Input
                value={appConfig.site_name ?? ""}
                onChange={(e) =>
                  setAppConfig((p) => ({ ...p, site_name: e.target.value }))
                }
                placeholder="Hazal Muti"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Site URL'i</Label>
              <Input
                value={appConfig.chrome_web_origin ?? ""}
                onChange={(e) =>
                  setAppConfig((p) => ({
                    ...p,
                    chrome_web_origin: e.target.value,
                  }))
                }
                placeholder="https://hazalmuti.com"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bildirim İkonu URL'i (192×192 px)</Label>
              <Input
                value={appConfig.chrome_web_default_notification_icon ?? ""}
                onChange={(e) =>
                  setAppConfig((p) => ({
                    ...p,
                    chrome_web_default_notification_icon: e.target.value,
                  }))
                }
                placeholder="https://hazalmuti.com/icon.png"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={saveConfig}
              disabled={savingConfig}
              className="bg-[#14141A] text-white gap-2"
            >
              {savingConfig ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {recipientPickerOpen && (
        <RecipientPickerDialog
          existing={emailRecipients}
          onClose={() => setRecipientPickerOpen(false)}
          onApply={(emails) => {
            setEmailRecipients(emails);
            setRecipientPickerOpen(false);
            toast.success(`${emails.split(/[,\n]/).filter(Boolean).length} alıcı eklendi`);
          }}
        />
      )}
    </>
  );
}

interface PickerPerson {
  email: string;
  name: string;
  source: "customer" | "contact" | "newsletter" | "inquiry";
  meta?: string;
}

function RecipientPickerDialog({
  existing,
  onClose,
  onApply,
}: {
  existing: string;
  onClose: () => void;
  onApply: (emails: string) => void;
}) {
  const [people, setPeople] = React.useState<PickerPerson[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [filter, setFilter] = React.useState<"all" | PickerPerson["source"]>("all");

  // Pre-select emails already in textarea
  React.useEffect(() => {
    const existingEmails = existing
      .split(/[\s,;\n]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (existingEmails.length > 0) {
      setSelected(new Set(existingEmails));
    }
  }, [existing]);

  // Load all sources in parallel
  React.useEffect(() => {
    Promise.all([
      api<{ items: Array<{ email: string | null; name: string; status?: string }> }>(
        "/api/admin/customers?pageSize=500",
      ).catch(() => ({ items: [] })),
      api<{ items: Array<{ email: string | null; name: string; company?: string | null }> }>(
        "/api/admin/contacts?pageSize=500",
      ).catch(() => ({ items: [] })),
      api<{ items: Array<{ email: string; name: string | null }> }>(
        "/api/admin/newsletter?pageSize=500",
      ).catch(() => ({ items: [] })),
      api<{ items: Array<{ email: string; name: string }> }>(
        "/api/admin/inquiries?pageSize=200",
      ).catch(() => ({ items: [] })),
    ])
      .then(([customers, contacts, newsletter, inquiries]) => {
        const combined: PickerPerson[] = [];
        const seen = new Set<string>();

        const add = (p: PickerPerson) => {
          const k = p.email.toLowerCase();
          if (!k || !/@/.test(k) || seen.has(k)) return;
          seen.add(k);
          combined.push(p);
        };

        customers.items?.forEach((c) =>
          c.email && add({
            email: c.email,
            name: c.name,
            source: "customer",
            meta: c.status,
          }),
        );
        contacts.items?.forEach((c) =>
          c.email && add({
            email: c.email,
            name: c.name,
            source: "contact",
            meta: c.company ?? undefined,
          }),
        );
        newsletter.items?.forEach((n) =>
          add({
            email: n.email,
            name: n.name ?? n.email.split("@")[0],
            source: "newsletter",
          }),
        );
        inquiries.items?.forEach((i) =>
          add({
            email: i.email,
            name: i.name,
            source: "inquiry",
          }),
        );

        setPeople(combined);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = React.useMemo(() => {
    let list = people;
    if (filter !== "all") list = list.filter((p) => p.source === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) => p.email.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
      );
    }
    return list;
  }, [people, filter, search]);

  const counts = React.useMemo(
    () => ({
      all: people.length,
      customer: people.filter((p) => p.source === "customer").length,
      contact: people.filter((p) => p.source === "contact").length,
      newsletter: people.filter((p) => p.source === "newsletter").length,
      inquiry: people.filter((p) => p.source === "inquiry").length,
    }),
    [people],
  );

  const SOURCE_META: Record<PickerPerson["source"], { label: string; color: string }> = {
    customer: { label: "Müşteri", color: "bg-emerald-100 text-emerald-700" },
    contact: { label: "Rehber", color: "bg-blue-100 text-blue-700" },
    newsletter: { label: "Bülten", color: "bg-violet-100 text-violet-700" },
    inquiry: { label: "Talep", color: "bg-amber-100 text-amber-700" },
  };

  function toggle(email: string) {
    const k = email.toLowerCase();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((p) => next.add(p.email.toLowerCase()));
      return next;
    });
  }

  function clearAll() {
    setSelected(new Set());
  }

  function apply() {
    const emails = Array.from(selected).join(", ");
    onApply(emails);
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-5 py-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-[#C9A96E]" />
            Kayıtlı Kişilerden Seç
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {selected.size} seçili
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pt-3 pb-2 space-y-2 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ad veya e-posta ara..."
              className="pl-9 h-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "customer", "contact", "newsletter", "inquiry"] as const).map((k) => {
              const label = k === "all" ? "Tümü" : SOURCE_META[k as PickerPerson["source"]]?.label;
              const count = counts[k];
              const active = filter === k;
              return (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border transition-colors " +
                    (active
                      ? "bg-[#14141A] text-white border-[#14141A]"
                      : "bg-white text-foreground/70 border-border hover:bg-muted/50")
                  }
                >
                  {label}
                  {count > 0 && (
                    <span
                      className={
                        "ml-0.5 rounded-full px-1.5 text-[9px] " +
                        (active ? "bg-white/20" : "bg-muted")
                      }
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Yükleniyor...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Users className="h-8 w-8 mx-auto opacity-30 mb-2" />
              {search ? "Sonuç bulunamadı" : "Kayıtlı kişi yok"}
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((p) => {
                const k = p.email.toLowerCase();
                const isSelected = selected.has(k);
                const meta = SOURCE_META[p.source];
                return (
                  <button
                    key={k}
                    onClick={() => toggle(p.email)}
                    className={
                      "w-full text-left px-3 py-2 rounded border transition-colors " +
                      (isSelected
                        ? "border-[#C9A96E] bg-[#C9A96E]/10"
                        : "border-border hover:bg-muted/40")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={
                          "shrink-0 w-4 h-4 rounded border flex items-center justify-center " +
                          (isSelected
                            ? "bg-[#14141A] border-[#14141A]"
                            : "border-border")
                        }
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium truncate">{p.name}</p>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                          {p.meta && (
                            <span className="text-[10px] text-muted-foreground truncate">
                              · {p.meta}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {p.email}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="px-5 py-3 border-t flex-row !justify-between gap-2">
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={selectAllVisible}>
              Görüneni Seç
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Temizle
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button
              onClick={apply}
              disabled={selected.size === 0}
              className="bg-[#14141A] text-white"
            >
              Uygula ({selected.size})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft, Mail, Inbox, Calendar as CalIcon, Newspaper, Info } from "lucide-react";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

interface BilingualText {
  tr: string;
  en: string;
}
interface Template {
  subject?: BilingualText;
  body?: BilingualText;
}
interface EmailTemplates {
  newInquiryAdmin?: Template;        // Hazal'a yeni talep bildirimi
  inquiryAutoReply?: Template;        // Ziyaretçiye otomatik teşekkür
  appointmentConfirm?: Template;      // Randevu onay maili (ziyaretçiye)
  monthlyReport?: Template;           // Aylık market raporu (Hazal'a)
}

type TemplateKey = keyof EmailTemplates;

const TEMPLATE_META: Array<{
  key: TemplateKey;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  defaults: { subjectTr: string; bodyTr: string; subjectEn: string; bodyEn: string };
  variables: string[];
}> = [
  {
    key: "newInquiryAdmin",
    label: "Yeni Talep · Hazal'a Bildirim",
    desc: "Web sitesinden yeni inquiry geldiğinde Hazal'ın e-postasına gönderilir.",
    icon: Inbox,
    defaults: {
      subjectTr: "Yeni müşteri talebi — {{name}}",
      bodyTr:
        "Yeni bir talep geldi.\n\nİsim: {{name}}\nE-posta: {{email}}\nTelefon: {{phone}}\nİlan: {{listingTitle}}\n\nMesaj:\n{{message}}\n\nPanelden yanıtla: {{adminUrl}}/inquiries",
      subjectEn: "New inquiry — {{name}}",
      bodyEn:
        "A new inquiry has arrived.\n\nName: {{name}}\nEmail: {{email}}\nPhone: {{phone}}\nListing: {{listingTitle}}\n\nMessage:\n{{message}}\n\nReply via admin panel: {{adminUrl}}/inquiries",
    },
    variables: ["{{name}}", "{{email}}", "{{phone}}", "{{listingTitle}}", "{{message}}", "{{adminUrl}}"],
  },
  {
    key: "inquiryAutoReply",
    label: "Otomatik Teşekkür · Ziyaretçiye",
    desc: "Form gönderen ziyaretçiye otomatik 'Teşekkürler, kısa süre içinde dönüş yapacağız' maili.",
    icon: Mail,
    defaults: {
      subjectTr: "Talebiniz alındı — Hazal Muti Real Estate",
      bodyTr:
        "Merhaba {{name}},\n\nTalebinizi aldık. En kısa sürede size dönüş yapacağız.\n\nİlgilendiğiniz ilan: {{listingTitle}}\n\nAcil bir konu için: {{phone}} / {{email}}\n\nSaygılarımla,\nHazal Muti",
      subjectEn: "We received your inquiry — Hazal Muti Real Estate",
      bodyEn:
        "Hello {{name}},\n\nWe received your inquiry. We will get back to you shortly.\n\nListing: {{listingTitle}}\n\nFor urgent matters: {{phone}} / {{email}}\n\nBest regards,\nHazal Muti",
    },
    variables: ["{{name}}", "{{listingTitle}}", "{{phone}}", "{{email}}"],
  },
  {
    key: "appointmentConfirm",
    label: "Randevu Onayı · Ziyaretçiye",
    desc: "Yeni randevu oluşturulduğunda ziyaretçiye onay maili.",
    icon: CalIcon,
    defaults: {
      subjectTr: "Randevunuz onaylandı — {{appointmentDate}}",
      bodyTr:
        "Merhaba {{name}},\n\nRandevunuz onaylandı.\n\nTarih: {{appointmentDate}}\nSaat: {{appointmentTime}}\nİlan: {{listingTitle}}\nKonum: {{location}}\n\nDeğişiklik için: {{phone}}\n\nGörüşmek üzere,\nHazal Muti",
      subjectEn: "Your appointment is confirmed — {{appointmentDate}}",
      bodyEn:
        "Hello {{name}},\n\nYour appointment is confirmed.\n\nDate: {{appointmentDate}}\nTime: {{appointmentTime}}\nListing: {{listingTitle}}\nLocation: {{location}}\n\nFor changes: {{phone}}\n\nLooking forward,\nHazal Muti",
    },
    variables: [
      "{{name}}",
      "{{appointmentDate}}",
      "{{appointmentTime}}",
      "{{listingTitle}}",
      "{{location}}",
      "{{phone}}",
    ],
  },
  {
    key: "monthlyReport",
    label: "Aylık Market Raporu · Hazal'a",
    desc: "Her ayın 1'inde otomatik üretilen istatistik + AI yorum maili.",
    icon: Newspaper,
    defaults: {
      subjectTr: "{{month}} {{year}} — Hazal Muti Aylık Market Raporu",
      bodyTr:
        "Merhaba Hazal,\n\nGeçen ayın özet raporu hazır.\n\n{{summary}}\n\nDetaylı veriler ve AI yorumu için panele gir: {{adminUrl}}\n\nİyi çalışmalar.",
      subjectEn: "{{month}} {{year}} — Hazal Muti Monthly Market Report",
      bodyEn:
        "Hello Hazal,\n\nLast month's summary report is ready.\n\n{{summary}}\n\nFor full data + AI commentary: {{adminUrl}}\n\nBest.",
    },
    variables: ["{{month}}", "{{year}}", "{{summary}}", "{{adminUrl}}"],
  },
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = React.useState<EmailTemplates>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeKey, setActiveKey] = React.useState<TemplateKey>("newInquiryAdmin");

  React.useEffect(() => {
    api<SiteSettings & { emailTemplates?: EmailTemplates | null }>("/api/admin/settings")
      .then((s) => {
        setTemplates((s.emailTemplates as EmailTemplates | null) ?? {});
      })
      .finally(() => setLoading(false));
  }, []);

  function setField(key: TemplateKey, sub: "subject" | "body", lang: "tr" | "en", value: string) {
    setTemplates((prev) => {
      const next = { ...prev };
      const t = (next[key] ?? {}) as Template;
      const existing = (t[sub] as BilingualText | undefined) ?? { tr: "", en: "" };
      next[key] = { ...t, [sub]: { ...existing, [lang]: value } };
      return next;
    });
  }

  function getField(key: TemplateKey, sub: "subject" | "body", lang: "tr" | "en"): string {
    const t = templates[key];
    if (!t) return "";
    const v = t[sub] as BilingualText | undefined;
    return v?.[lang] ?? "";
  }

  function loadDefaults(key: TemplateKey) {
    const meta = TEMPLATE_META.find((m) => m.key === key);
    if (!meta) return;
    setTemplates((prev) => ({
      ...prev,
      [key]: {
        subject: { tr: meta.defaults.subjectTr, en: meta.defaults.subjectEn },
        body: { tr: meta.defaults.bodyTr, en: meta.defaults.bodyEn },
      },
    }));
    toast.success("Default değerler yüklendi (henüz kaydedilmedi)");
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api("/api/admin/settings", {
        method: "PATCH",
        body: { emailTemplates: templates },
      });
      toast.success("E-posta şablonları kaydedildi");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  const meta = TEMPLATE_META.find((m) => m.key === activeKey)!;

  if (loading) {
    return (
      <>
        <Topbar title="E-posta Şablonları" />
        <main className="flex-1 px-4 py-5 space-y-3">
          <Skeleton className="h-32 w-full" />
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="E-posta Şablonları"
        description="Hazal'a ve müşterilere giden mailleri özelleştir"
      />
      <main className="flex-1 px-4 py-5 space-y-4 animate-fade-up max-w-4xl">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Genel ayarlar
        </Link>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {TEMPLATE_META.map((m) => {
            const Icon = m.icon;
            const active = activeKey === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setActiveKey(m.key)}
                className={
                  "flex items-center gap-2 px-3 py-2 text-xs border-b-2 -mb-px transition-colors whitespace-nowrap " +
                  (active
                    ? "border-[#C9A96E] text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground")
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xs">{meta.label}</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-1">{meta.desc}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => loadDefaults(activeKey)}>
                Defaultları yükle
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs">
              <Info className="h-3.5 w-3.5 mt-0.5 text-amber-600 shrink-0" />
              <div>
                <p className="font-medium text-amber-900">Kullanılabilir değişkenler</p>
                <p className="text-amber-800 mt-1 flex flex-wrap gap-1">
                  {meta.variables.map((v) => (
                    <code
                      key={v}
                      className="bg-white px-1.5 py-0.5 rounded text-[11px] border border-amber-200"
                    >
                      {v}
                    </code>
                  ))}
                </p>
                <p className="text-amber-800 mt-1.5 text-[11px]">
                  Mail gönderilirken bu yer tutucular gerçek değerlerle değişir.
                </p>
              </div>
            </div>

            {/* Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Konu (TR)
                </Label>
                <Input
                  value={getField(activeKey, "subject", "tr")}
                  onChange={(e) => setField(activeKey, "subject", "tr", e.target.value)}
                  placeholder={meta.defaults.subjectTr}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Subject (EN)
                </Label>
                <Input
                  value={getField(activeKey, "subject", "en")}
                  onChange={(e) => setField(activeKey, "subject", "en", e.target.value)}
                  placeholder={meta.defaults.subjectEn}
                />
              </div>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Mesaj (TR)
                </Label>
                <Textarea
                  rows={10}
                  value={getField(activeKey, "body", "tr")}
                  onChange={(e) => setField(activeKey, "body", "tr", e.target.value)}
                  placeholder={meta.defaults.bodyTr}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Body (EN)
                </Label>
                <Textarea
                  rows={10}
                  value={getField(activeKey, "body", "en")}
                  onChange={(e) => setField(activeKey, "body", "en", e.target.value)}
                  placeholder={meta.defaults.bodyEn}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end sticky bottom-3 z-10 lg:pr-52">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#14141A] hover:bg-black text-white shadow-lg gap-2"
            size="lg"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? "Kaydediliyor..." : "Tüm Şablonları Kaydet"}
          </Button>
        </div>
      </main>
    </>
  );
}

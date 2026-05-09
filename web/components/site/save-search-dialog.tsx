"use client";

import * as React from "react";
import { Bell, X, Loader2, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

export interface SearchCriteria {
  type?: string;
  category?: string;
  district?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  minBedrooms?: number;
}

export function SaveSearchButton({
  criteria,
  className = "",
}: {
  criteria: SearchCriteria;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [locale] = useLocale();

  // Don't show button if no filters are active (avoid empty save)
  const hasFilters = Object.values(criteria).some(
    (v) => v !== undefined && v !== "" && v !== null,
  );

  if (!hasFilters) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          "inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase border border-[#C9A96E] text-[#C9A96E] px-4 h-11 hover:bg-[#C9A96E] hover:text-[#14141A] transition-colors " +
          className
        }
      >
        <Bell className="h-3.5 w-3.5" />
        {locale === "tr" ? "Aramayı Kaydet" : "Save Search"}
      </button>

      {open && (
        <SaveSearchDialog
          criteria={criteria}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function SaveSearchDialog({
  criteria,
  onClose,
}: {
  criteria: SearchCriteria;
  onClose: () => void;
}) {
  const [locale] = useLocale();
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [label, setLabel] = React.useState(buildDefaultLabel(criteria, locale));
  const [frequency, setFrequency] = React.useState<"daily" | "weekly">("daily");
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(locale === "tr" ? "Geçersiz e-posta" : "Invalid email");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api("/api/saved-searches", {
        method: "POST",
        auth: false,
        body: {
          email,
          name: name || undefined,
          label: label || undefined,
          criteria,
          frequency,
        },
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-md w-full rounded-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0E0E0E] text-[#F5F2EC] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#C9A96E]" />
            <h2 className="text-sm font-medium tracking-wider uppercase">
              {locale === "tr" ? "Aramayı Kaydet" : "Save Search"}
            </h2>
          </div>
          <button onClick={onClose} className="opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-emerald-700" />
            </div>
            <h3 className="font-display text-xl">
              {locale === "tr" ? "Aramanız Kaydedildi" : "Search Saved"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {locale === "tr"
                ? "Bu kriterlere uyan yeni ilanlar çıktığında size e-posta göndereceğiz."
                : "We'll email you when new listings match your criteria."}
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#14141A] text-white text-xs tracking-wider uppercase hover:bg-[#C9A96E] hover:text-[#14141A]"
            >
              {locale === "tr" ? "Kapat" : "Close"}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            <p className="text-xs text-muted-foreground">
              {locale === "tr"
                ? "Aşağıdaki kriterlere uyan yeni ilanlar çıktığında size e-posta atalım."
                : "We'll email you when new listings match these criteria."}
            </p>

            {/* Criteria summary */}
            <div className="bg-muted/40 rounded p-3 space-y-1 text-xs">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                {locale === "tr" ? "Kriterler" : "Criteria"}
              </p>
              {summarize(criteria, locale).map((line, i) => (
                <p key={i} className="text-foreground">
                  · {line}
                </p>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                  {locale === "tr" ? "Aramaya isim ver (opsiyonel)" : "Search name (optional)"}
                </label>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={
                    locale === "tr"
                      ? "Bebek 3+1 deniz manzaralı"
                      : "Bebek 3+1 sea-view"
                  }
                  className="w-full h-10 px-3 bg-white border border-[#E5E2DD] text-sm focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                    {locale === "tr" ? "Adınız" : "Your name"}
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={locale === "tr" ? "Ahmet Yılmaz" : "John Doe"}
                    className="w-full h-10 px-3 bg-white border border-[#E5E2DD] text-sm focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                    {locale === "tr" ? "E-posta *" : "Email *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full h-10 px-3 bg-white border border-[#E5E2DD] text-sm focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                  {locale === "tr" ? "Sıklık" : "Frequency"}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFrequency("daily")}
                    className={
                      "flex-1 h-10 text-xs uppercase tracking-wider border " +
                      (frequency === "daily"
                        ? "bg-[#14141A] text-white border-[#14141A]"
                        : "bg-white border-[#E5E2DD] hover:border-[#C9A96E]")
                    }
                  >
                    {locale === "tr" ? "Günlük" : "Daily"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency("weekly")}
                    className={
                      "flex-1 h-10 text-xs uppercase tracking-wider border " +
                      (frequency === "weekly"
                        ? "bg-[#14141A] text-white border-[#14141A]"
                        : "bg-white border-[#E5E2DD] hover:border-[#C9A96E]")
                    }
                  >
                    {locale === "tr" ? "Haftalık" : "Weekly"}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {error}
              </p>
            )}

            <div className="flex gap-2 justify-end pt-2 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 h-10 text-xs uppercase tracking-wider border border-[#E5E2DD] hover:border-[#C9A96E]"
              >
                {locale === "tr" ? "İptal" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 h-10 text-xs uppercase tracking-wider bg-[#14141A] text-white hover:bg-[#C9A96E] hover:text-[#14141A] disabled:opacity-60 inline-flex items-center gap-2"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {locale === "tr" ? "Aboneliği Oluştur" : "Subscribe"}
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              {locale === "tr"
                ? "İstediğiniz zaman aboneliği iptal edebilirsiniz."
                : "You can unsubscribe at any time."}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function summarize(c: SearchCriteria, locale: "tr" | "en"): string[] {
  const out: string[] = [];
  if (c.type) {
    out.push(c.type === "SALE" ? (locale === "tr" ? "Satılık" : "For Sale") : (locale === "tr" ? "Kiralık" : "For Rent"));
  }
  if (c.category) out.push(c.category);
  if (c.district) out.push(`📍 ${c.district}`);
  if (c.city && !c.district) out.push(`📍 ${c.city}`);
  if (c.minPrice || c.maxPrice) {
    const min = c.minPrice ? Number(c.minPrice).toLocaleString("tr-TR") : "—";
    const max = c.maxPrice ? Number(c.maxPrice).toLocaleString("tr-TR") : "—";
    out.push(`💰 ${min} – ${max} ${c.currency ?? ""}`);
  }
  if (c.minBedrooms) {
    out.push(`🛏 ${c.minBedrooms}+ ${locale === "tr" ? "oda" : "bedrooms"}`);
  }
  if (out.length === 0) {
    out.push(locale === "tr" ? "Tüm yeni ilanlar" : "All new listings");
  }
  return out;
}

function buildDefaultLabel(c: SearchCriteria, locale: "tr" | "en"): string {
  const parts: string[] = [];
  if (c.district) parts.push(c.district);
  else if (c.city) parts.push(c.city);
  if (c.minBedrooms) parts.push(`${c.minBedrooms}+1`);
  if (c.type === "SALE") parts.push(locale === "tr" ? "Satılık" : "Sale");
  else if (c.type === "RENT") parts.push(locale === "tr" ? "Kiralık" : "Rent");
  return parts.join(" · ");
}

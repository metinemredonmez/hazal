"use client";

import * as React from "react";
import { Send, Check, Loader2, Mail as MailIcon } from "lucide-react";
import { api } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

interface NewsletterSignupProps {
  source?: string;
  variant?: "footer" | "page";
}

export function NewsletterSignup({ source = "footer", variant = "footer" }: NewsletterSignupProps) {
  const [locale] = useLocale();
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    if (!email.trim() || !email.includes("@")) {
      setError(locale === "tr" ? "Geçerli bir e-posta gir" : "Enter a valid email");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      await api("/api/newsletter/subscribe", {
        method: "POST",
        body: { email: email.trim(), name: name.trim() || undefined, locale, source },
        auth: false,
      });
      setStatus("success");
      setEmail("");
      setName("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bir sorun oluştu";
      // Already-subscribed (409) — show as success with custom message
      if (message.toLowerCase().includes("already subscribed") || message.includes("409")) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setError(message);
      }
    }
  }

  if (status === "success") {
    return (
      <div
        className={
          variant === "footer"
            ? "flex items-center gap-2 text-sm text-[#D4B36A]"
            : "flex items-center gap-2 text-sm text-[#14141A]"
        }
      >
        <Check className="h-4 w-4" />
        <span>
          {locale === "tr"
            ? "Aboneliğiniz alındı. Yeni ilanlar e-posta ile gelecek."
            : "Subscribed. You'll receive new listings by email."}
        </span>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <form onSubmit={submit} className="space-y-2">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4B36A]">
          {locale === "tr" ? "Bültene Abone Ol" : "Newsletter"}
        </p>
        <p className="text-xs text-[#F5F2EC]/60">
          {locale === "tr"
            ? "Yeni ilanlardan ve aylık market raporundan haberdar ol."
            : "Get notified about new listings and the monthly market report."}
        </p>
        <div className="relative">
          <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#F5F2EC]/40" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={locale === "tr" ? "e-posta@adresiniz.com" : "your@email.com"}
            className="w-full pl-9 pr-12 py-2.5 bg-[#1A1A1F] border border-[#2A2A2F] text-[#F5F2EC] placeholder-[#F5F2EC]/30 text-sm focus:outline-none focus:border-[#D4B36A]"
            disabled={status === "loading"}
          />
          <button
            type="submit"
            disabled={status === "loading" || !email.trim()}
            className="absolute right-1 top-1 bottom-1 px-3 bg-[#D4B36A] text-[#14141A] hover:bg-[#F5F2EC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label={locale === "tr" ? "Abone ol" : "Subscribe"}
          >
            {status === "loading" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>
    );
  }

  // Page variant — bigger, with optional name field
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={locale === "tr" ? "Adınız (opsiyonel)" : "Your name (optional)"}
          className="px-3 py-3 bg-white border border-[#E5E2DD] text-sm focus:outline-none focus:border-[#D4B36A]"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={locale === "tr" ? "e-posta@adresiniz.com" : "your@email.com"}
          className="px-3 py-3 bg-white border border-[#E5E2DD] text-sm focus:outline-none focus:border-[#D4B36A]"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading" || !email.trim()}
        className="inline-flex items-center gap-2 bg-[#14141A] text-white hover:bg-[#D4B36A] px-6 py-3 text-xs tracking-[0.3em] uppercase disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {status === "loading" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
        {locale === "tr" ? "Abone Ol" : "Subscribe"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}

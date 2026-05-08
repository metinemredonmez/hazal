"use client";

import * as React from "react";
import { useLocale, t } from "@/lib/i18n";
import { api } from "@/lib/api";

interface Props {
  listingId?: string;
  variant?: "card" | "page";
}

export function InquiryForm({ listingId, variant = "card" }: Props) {
  const [locale] = useLocale();
  const tx = t[locale];
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError(locale === "tr" ? "Lütfen tüm alanları doldurun (Ad, e-posta, telefon, mesaj zorunlu)" : "Please fill all fields (name, email, phone, message are required)");
      return;
    }
    setSending(true);
    try {
      await api(`/api/inquiries`, {
        method: "POST",
        auth: false,
        body: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          listingId: listingId,
        },
      });
      setDone(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : tx.inquiry.error);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div
        className={`${
          variant === "card" ? "bg-[#FAF8F4] p-8" : "bg-white p-10 border border-[#E5E2DD]"
        } text-center`}
      >
        <div className="text-[#C9A96E] text-3xl mb-3">✓</div>
        <p className="font-display text-xl text-[#14141A] mb-2">
          {locale === "tr" ? "Teşekkürler" : "Thank you"}
        </p>
        <p className="text-sm text-[#6E6E73]">{tx.inquiry.success}</p>
      </div>
    );
  }

  const isPage = variant === "page";

  return (
    <form
      onSubmit={handleSubmit}
      className={isPage ? "bg-white p-10 border border-[#E5E2DD] space-y-5" : "space-y-4"}
    >
      {!isPage && (
        <div className="mb-2">
          <p className="font-display text-xl text-[#14141A]">{tx.inquiry.title}</p>
        </div>
      )}

      <div className={isPage ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] mb-1.5 block">
            {tx.inquiry.name} *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 px-3 bg-white border border-[#E5E2DD] text-sm focus:outline-none focus:border-[#C9A96E]"
            required
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] mb-1.5 block">
            {tx.inquiry.email} *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-3 bg-white border border-[#E5E2DD] text-sm focus:outline-none focus:border-[#C9A96E]"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] mb-1.5 block">
          {tx.inquiry.phone} *
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+90 5XX XXX XX XX"
          className="w-full h-11 px-3 bg-white border border-[#E5E2DD] text-sm focus:outline-none focus:border-[#C9A96E]"
          required
        />
      </div>

      <div>
        <label className="text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] mb-1.5 block">
          {tx.inquiry.message} *
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder={tx.inquiry.messagePlaceholder}
          className="w-full p-3 bg-white border border-[#E5E2DD] text-sm focus:outline-none focus:border-[#C9A96E] resize-none"
          required
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="w-full h-12 bg-[#14141A] text-white text-xs tracking-[0.4em] uppercase hover:bg-[#C9A96E] hover:text-[#14141A] disabled:opacity-50 transition-colors"
      >
        {sending ? tx.inquiry.sending : tx.inquiry.send}
      </button>
    </form>
  );
}

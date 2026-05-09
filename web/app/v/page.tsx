"use client";

import * as React from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  Camera as Instagram,
  Globe,
  Download,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { useSettings } from "@/lib/use-settings";
import { pageContent, pick } from "@/lib/page-content";
import { useLocale } from "@/lib/i18n";

export default function DigitalCardPage() {
  const settings = useSettings();
  const [locale] = useLocale();
  const content = pageContent(settings);
  const about = content.about;

  const portrait =
    about?.portraitUrl ?? settings?.heroMediaUrl ?? "/login-bg.jpg";
  const brandName = settings?.brandName ?? "Hazal Muti";
  const phone = settings?.phone ?? "";
  const whatsapp = settings?.whatsapp ?? settings?.phone ?? "";
  const email = settings?.email ?? "info@hazalmuti.com";
  const instagramRaw = settings?.instagram ?? "";
  // URL veya username olabilir → sadece username çıkar
  const instagramHandle = instagramRaw
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/$/, "")
    .split("/")[0]
    .trim();
  const instagram = instagramHandle;
  const instagramUrl = instagramHandle
    ? `https://instagram.com/${instagramHandle}`
    : "";
  const tagline = pick(
    about?.heroEyebrow,
    locale,
    locale === "tr" ? "Premium Gayrimenkul Danışmanı" : "Premium Real Estate Advisor",
  );

  // WhatsApp için temizlenmiş numara
  const waNumber = whatsapp.replace(/[^0-9+]/g, "").replace(/^\+/, "");

  // vCard download
  function downloadVCard() {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${brandName}`,
      `N:Muti;Hazal;;;`,
      `TITLE:${tagline}`,
      `ORG:${brandName}`,
      phone && `TEL;TYPE=CELL:${phone}`,
      email && `EMAIL:${email}`,
      `URL:https://hazalmuti.com`,
      instagramUrl && `URL;TYPE=Instagram:${instagramUrl}`,
      "ADR;TYPE=WORK:;;Bebek;İstanbul;;;Türkiye",
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brandName.replace(/\s/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function shareCard() {
    const url = "https://hazalmuti.com/v";
    if (navigator.share) {
      navigator
        .share({
          title: brandName,
          text: tagline,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert("Link kopyalandı: " + url);
    }
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#F5F2EC]">
      <div className="max-w-md mx-auto px-5 py-10 sm:py-14">
        {/* Hero — Foto + isim */}
        <div className="text-center">
          <div className="mx-auto w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-[#C9A96E]/30 shadow-2xl mb-6 ring-2 ring-[#C9A96E]/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={portrait}
              alt={brandName}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 20%" }}
            />
          </div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-2">
            {tagline}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl tracking-[0.05em] uppercase font-light">
            HAZAL <span className="italic font-light text-[#C9A96E]">MUTİ</span>
          </h1>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-[#F5F2EC]/60">
            <MapPin className="h-3 w-3" />
            <span>İstanbul · Bodrum</span>
          </div>
        </div>

        {/* Aksiyon butonları */}
        <div className="mt-10 space-y-3">
          {whatsapp && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 w-full bg-[#25D366] hover:bg-[#1eba56] text-white px-5 py-4 rounded-xl transition-colors group"
            >
              <MessageCircle className="h-5 w-5 shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-xs uppercase tracking-wider opacity-80">WhatsApp</p>
                <p className="text-sm font-medium">{whatsapp}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
            </a>
          )}

          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 w-full bg-[#1a1a23] hover:bg-[#252530] border border-[#2a2a35] px-5 py-4 rounded-xl transition-colors group"
            >
              <Phone className="h-5 w-5 shrink-0 text-[#C9A96E]" />
              <div className="flex-1 text-left">
                <p className="text-xs uppercase tracking-wider text-[#F5F2EC]/50">
                  Telefon
                </p>
                <p className="text-sm font-medium">{phone}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
            </a>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 w-full bg-[#1a1a23] hover:bg-[#252530] border border-[#2a2a35] px-5 py-4 rounded-xl transition-colors group"
            >
              <Mail className="h-5 w-5 shrink-0 text-[#C9A96E]" />
              <div className="flex-1 text-left">
                <p className="text-xs uppercase tracking-wider text-[#F5F2EC]/50">
                  E-posta
                </p>
                <p className="text-sm font-medium">{email}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
            </a>
          )}

          {instagram && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 px-5 py-4 rounded-xl transition-opacity group"
            >
              <Instagram className="h-5 w-5 shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-xs uppercase tracking-wider opacity-80">Instagram</p>
                <p className="text-sm font-medium">@{instagram}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
            </a>
          )}

          <a
            href="/ilanlar"
            className="flex items-center gap-3 w-full bg-[#1a1a23] hover:bg-[#252530] border border-[#2a2a35] px-5 py-4 rounded-xl transition-colors group"
          >
            <Globe className="h-5 w-5 shrink-0 text-[#C9A96E]" />
            <div className="flex-1 text-left">
              <p className="text-xs uppercase tracking-wider text-[#F5F2EC]/50">
                Aktif Portföy
              </p>
              <p className="text-sm font-medium">İlanları Gör</p>
            </div>
            <ArrowUpRight className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
          </a>
        </div>

        {/* Save to contacts + share */}
        <div className="mt-8 grid grid-cols-2 gap-2.5">
          <button
            onClick={downloadVCard}
            className="flex items-center justify-center gap-2 w-full bg-[#C9A96E] hover:bg-[#b8965e] text-[#14141A] px-4 py-3 rounded-xl text-xs font-medium tracking-wider uppercase transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Rehbere Kaydet
          </button>
          <button
            onClick={shareCard}
            className="flex items-center justify-center gap-2 w-full bg-transparent hover:bg-white/5 border border-[#C9A96E]/30 text-[#F5F2EC] px-4 py-3 rounded-xl text-xs font-medium tracking-wider uppercase transition-colors"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Paylaş
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#2a2a35] text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#F5F2EC]/40 mb-1">
            {brandName}
          </p>
          <a
            href="https://hazalmuti.com"
            className="text-[10px] text-[#C9A96E]/70 hover:text-[#C9A96E] tracking-wider"
          >
            hazalmuti.com
          </a>
        </div>
      </div>
    </div>
  );
}

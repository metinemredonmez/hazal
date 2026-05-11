"use client";

import * as React from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  Camera as Instagram,
  Briefcase as Linkedin,
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
  const linkedinUrl = settings?.linkedin ?? "";
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
      linkedinUrl && `URL;TYPE=LinkedIn:${linkedinUrl}`,
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
      <div className="max-w-sm mx-auto px-6 py-12 sm:py-16">
        {/* Hero — Foto + isim */}
        <div className="text-center">
          <div className="mx-auto w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden mb-7 ring-1 ring-[#D4B36A]/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={portrait}
              alt={brandName}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 30%" }}
            />
          </div>
          <p className="text-[9px] tracking-[0.4em] uppercase text-[#D4B36A] mb-3">
            {tagline}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl tracking-[0.06em] font-light">
            HAZAL <span className="italic text-[#D4B36A]">Muti</span>
          </h1>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] tracking-[0.2em] uppercase text-[#F5F2EC]/50">
            <MapPin className="h-3 w-3" />
            <span>İstanbul · Bodrum</span>
          </div>
        </div>

        {/* Aksiyon butonları — hepsi aynı minimal dark stil */}
        <div className="mt-12 space-y-2">
          {whatsapp && (
            <CardLink
              href={`https://wa.me/${waNumber}`}
              external
              icon={<MessageCircle className="h-4 w-4 text-[#D4B36A]" />}
              label="WhatsApp"
              value={whatsapp}
            />
          )}
          {phone && (
            <CardLink
              href={`tel:${phone}`}
              icon={<Phone className="h-4 w-4 text-[#D4B36A]" />}
              label="Telefon"
              value={phone}
            />
          )}
          {email && (
            <CardLink
              href={`mailto:${email}`}
              icon={<Mail className="h-4 w-4 text-[#D4B36A]" />}
              label="E-posta"
              value={email}
            />
          )}
          {instagram && (
            <CardLink
              href={instagramUrl}
              external
              icon={<Instagram className="h-4 w-4 text-[#D4B36A]" />}
              label="Instagram"
              value={`@${instagram}`}
            />
          )}
          {linkedinUrl && (
            <CardLink
              href={linkedinUrl}
              external
              icon={<Linkedin className="h-4 w-4 text-[#D4B36A]" />}
              label="LinkedIn"
              value="Hazal Muti"
            />
          )}
          <CardLink
            href="/koleksiyon"
            icon={<Globe className="h-4 w-4 text-[#D4B36A]" />}
            label="Projeler"
            value="Tanıtım koleksiyonu"
          />
        </div>

        {/* Save to contacts + share */}
        <div className="mt-10 grid grid-cols-2 gap-2">
          <button
            onClick={downloadVCard}
            className="flex items-center justify-center gap-2 w-full bg-[#D4B36A] hover:bg-[#b8965e] text-[#14141A] px-4 py-3 rounded-md text-[10px] font-medium tracking-[0.2em] uppercase transition-colors"
          >
            <Download className="h-3 w-3" />
            Rehbere Kaydet
          </button>
          <button
            onClick={shareCard}
            className="flex items-center justify-center gap-2 w-full hover:bg-white/5 border border-white/15 text-[#F5F2EC] px-4 py-3 rounded-md text-[10px] font-medium tracking-[0.2em] uppercase transition-colors"
          >
            <ArrowUpRight className="h-3 w-3" />
            Paylaş
          </button>
        </div>

        {/* Footer */}
        <div className="mt-14 pt-6 border-t border-white/10 text-center">
          <a
            href="https://hazalmuti.com"
            className="text-[9px] tracking-[0.3em] uppercase text-[#D4B36A]/60 hover:text-[#D4B36A] transition-colors"
          >
            hazalmuti.com
          </a>
        </div>
      </div>
    </div>
  );
}

function CardLink({
  href,
  external,
  icon,
  label,
  value,
}: {
  href: string;
  external?: boolean;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="flex items-center gap-3 w-full hover:bg-white/[0.03] border border-white/10 hover:border-[#D4B36A]/30 px-5 py-3.5 rounded-md transition-colors group"
    >
      <span className="shrink-0">{icon}</span>
      <div className="flex-1 text-left">
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#F5F2EC]/45">{label}</p>
        <p className="text-[13px] font-medium text-[#F5F2EC]/95 mt-0.5">{value}</p>
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 text-[#F5F2EC]/30 group-hover:text-[#D4B36A] group-hover:translate-x-0.5 transition-all" />
    </a>
  );
}

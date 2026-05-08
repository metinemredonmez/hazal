"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale, t } from "@/lib/i18n";
import { useSettings } from "@/lib/use-settings";

export function Hero() {
  const [locale] = useLocale();
  const tx = t[locale];
  const settings = useSettings();

  const heroTitle =
    locale === "tr"
      ? settings?.heroTitleTr ?? "Lüksün\nyeni adresi."
      : settings?.heroTitleEn ?? "Luxury\nredefined.";
  const heroSub =
    locale === "tr"
      ? settings?.heroSubtitleTr ?? "İstanbul'un seçkin lokasyonlarında premium portföy."
      : settings?.heroSubtitleEn ?? "Premium portfolio in İstanbul's distinguished neighborhoods.";

  const mediaUrl = settings?.heroMediaUrl ?? "/login-bg.jpg";
  const isVideo = mediaUrl.match(/\.(mp4|webm|mov)$/i);

  return (
    <section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-[#0E0E0E] text-[#F5F2EC]">
      {isVideo ? (
        <video
          src={mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/85" />

      {/* Eyebrow line top-left */}
      <div className="absolute top-32 left-6 lg:left-10 z-10">
        <div className="flex items-center gap-3">
          <div className="h-px w-16 bg-[#C9A96E]" />
          <span className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E]">
            {tx.hero.eyebrow}
          </span>
        </div>
      </div>

      {/* Title bottom-left */}
      <div className="absolute bottom-24 lg:bottom-32 left-6 lg:left-10 right-6 lg:right-10 z-10 max-w-5xl">
        <h1 className="font-display font-light text-5xl sm:text-7xl lg:text-[8rem] leading-[0.95] tracking-tight whitespace-pre-line">
          {heroTitle}
        </h1>
        <p className="mt-6 text-base lg:text-lg text-[#F5F2EC]/80 max-w-xl">
          {heroSub}
        </p>
      </div>

      {/* Explore link bottom-right */}
      <Link
        href="/ilanlar"
        className="hidden lg:flex absolute bottom-24 right-10 z-10 items-center gap-3 group"
      >
        <span className="text-[10px] tracking-[0.4em] uppercase text-[#F5F2EC] group-hover:text-[#C9A96E] transition-colors">
          {tx.nav.explore}
        </span>
        <ArrowRight className="h-4 w-4 text-[#C9A96E] transition-transform group-hover:translate-x-1" />
      </Link>

      {/* Mobile CTA bottom */}
      <div className="lg:hidden absolute bottom-10 left-6 right-6 z-10">
        <Link
          href="/ilanlar"
          className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase border-b border-[#C9A96E] text-[#C9A96E] pb-1"
        >
          {tx.nav.explore} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}

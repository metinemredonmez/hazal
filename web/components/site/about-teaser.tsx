"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale, t } from "@/lib/i18n";
import { useSettings } from "@/lib/use-settings";
import { pageContent, pick } from "@/lib/page-content";

export function AboutTeaser() {
  const [locale] = useLocale();
  const tx = t[locale];
  const settings = useSettings();
  const home = pageContent(settings).home;

  const aboutText =
    locale === "tr"
      ? settings?.aboutTr ??
        "İstanbul'un seçkin lokasyonlarında premium gayrimenkul danışmanlığı sunuyorum. Her müşteriye özel, sessiz ve sonuç odaklı bir hizmet anlayışı."
      : settings?.aboutEn ??
        "Providing premium real estate advisory in İstanbul's distinguished neighborhoods. Discreet, personalized, results-driven service for every client.";

  const heading = pick(
    home?.aboutHeading,
    locale,
    locale === "tr" ? "Her müşteri,\ntek bir hikâye." : "Every client,\na single story.",
  );
  const ctaLabel = pick(home?.aboutCtaLabel, locale, tx.sections.aboutCta);

  return (
    <section className="bg-[#0E0E0E] text-[#F5F2EC] py-24 lg:py-32 px-6 lg:px-10">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div className="aspect-[3/4] bg-[#1A1A1F] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings?.heroMediaUrl ?? "/login-bg.jpg"}
              alt="Hazal Muti"
              className="w-full h-full object-cover grayscale"
            />
          </div>
        </div>

        <div className="lg:col-span-7 order-1 lg:order-2">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">
            {tx.about.heading}
          </p>
          <h2 className="font-display font-light text-4xl lg:text-6xl leading-[1.05] mb-8">
            {(() => {
              // Render heading: split on \n. Second line wrapped in italic accent.
              const lines = heading.split("\n");
              const first = lines[0];
              const rest = lines.slice(1).join(" ");
              return (
                <>
                  {first}
                  {rest && (
                    <>
                      <br />
                      <span className="italic text-[#C9A96E]">{rest}</span>
                    </>
                  )}
                </>
              );
            })()}
          </h2>

          <p className="text-base lg:text-lg text-[#F5F2EC]/75 leading-relaxed max-w-2xl mb-10">
            {aboutText}
          </p>

          <Link
            href="/hakkimizda"
            className="inline-flex items-center gap-3 text-[10px] tracking-[0.4em] uppercase text-[#F5F2EC] hover:text-[#C9A96E] group"
          >
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5 text-[#C9A96E] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

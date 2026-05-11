"use client";

import Link from "next/link";
import { ArrowRight, Phone, Mail } from "lucide-react";
import { useLocale, t } from "@/lib/i18n";
import { useSettings } from "@/lib/use-settings";
import { pageContent, pick } from "@/lib/page-content";

export default function AboutPage() {
  const [locale] = useLocale();
  const tx = t[locale];
  const settings = useSettings();
  const about = pageContent(settings).about;

  // Fall back chain: pageContent.about.bio1/bio2/intro → settings.aboutTr/En → hardcoded TR/EN
  const aboutFallback =
    locale === "tr"
      ? settings?.aboutTr ??
        "İstanbul'un seçkin lokasyonlarında premium gayrimenkul danışmanlığı sunuyorum. Boğaz hattı, Bebek, Etiler, Zekeriyaköy ve Bodrum'da seçkin portföy. Her müşteri için sessiz, kişisel ve sonuç odaklı bir hizmet anlayışıyla çalışıyorum."
      : settings?.aboutEn ??
        "I provide premium real estate advisory across İstanbul's most distinguished neighborhoods — the Bosphorus line, Bebek, Etiler, Zekeriyaköy and Bodrum. Discreet, personalized, results-driven service tailored to every client.";

  const intro = pick(about?.intro, locale, "");
  const bio1 = pick(about?.bio1, locale, "");
  const bio2 = pick(about?.bio2, locale, "");
  const specialties = pick(about?.specialties, locale, "");
  const quote = pick(about?.quote, locale, "");
  const heroEyebrow = pick(about?.heroEyebrow, locale, tx.about.heading);
  const heroTitle = pick(
    about?.heroTitle,
    locale,
    locale === "tr"
      ? "Premium gayrimenkul,\nkişisel hizmet."
      : "Premium properties,\npersonal service.",
  );

  // Content paragraphs in priority order: structured pageContent → fallback aboutText
  const paragraphs = [intro, bio1, bio2].filter((p) => p && p.trim().length > 0);
  const fallbackParagraphs =
    paragraphs.length === 0 ? aboutFallback.split(/\n\n+/) : paragraphs;
  const portrait = about?.portraitUrl ?? settings?.heroMediaUrl ?? "/login-bg.jpg";

  return (
    <>
      {/* Hero */}
      <section className="bg-[#0E0E0E] text-[#F5F2EC] pt-32 lg:pt-40 pb-20 lg:pb-28 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-4">
            {heroEyebrow}
          </p>
          <h1 className="font-display font-light text-3xl lg:text-5xl leading-[1.05] max-w-4xl">
            {(() => {
              const lines = heroTitle.split("\n");
              const first = lines[0];
              const rest = lines.slice(1).join(" ");
              return (
                <>
                  {first}
                  {rest && (
                    <>
                      <br />
                      <span className="italic text-[#D4B36A]">{rest}</span>
                    </>
                  )}
                </>
              );
            })()}
          </h1>
        </div>
      </section>

      {/* Bio */}
      <section className="bg-[#FAF8F4] py-20 lg:py-28 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-5">
            <div className="aspect-[3/4] bg-[#1A1A1F] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portrait} alt="Hazal Muti" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-3">
              {tx.about.role}
            </p>
            <h2 className="font-display font-light text-4xl lg:text-5xl text-[#14141A] mb-8">
              {tx.about.title}
            </h2>

            <div className="prose prose-lg text-[#14141A]/85 leading-relaxed space-y-5 max-w-2xl">
              {fallbackParagraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>

            {specialties && (
              <div className="mt-10">
                <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-3">
                  {locale === "tr" ? "Uzmanlık alanları" : "Specialties"}
                </p>
                <ul className="space-y-1.5 text-[#14141A]/85">
                  {specialties
                    .split("\n")
                    .filter((s) => s.trim())
                    .map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#D4B36A] mt-1">·</span>
                        <span>{s.trim()}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {quote && (
              <blockquote className="mt-12 pl-6 border-l-2 border-[#D4B36A]">
                <p className="font-display text-xl lg:text-2xl text-[#14141A] italic leading-relaxed">
                  &ldquo;{quote}&rdquo;
                </p>
                {about?.quoteAuthor && (
                  <cite className="block mt-3 text-[10px] tracking-[0.4em] uppercase text-[#6E6E73] not-italic">
                    — {about.quoteAuthor}
                  </cite>
                )}
              </blockquote>
            )}

            {/* Contact lines */}
            <div className="mt-12 space-y-3">
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-[#14141A] hover:text-[#D4B36A] transition-colors"
                >
                  <Phone className="h-4 w-4 text-[#D4B36A]" />
                  <span className="text-sm tracking-[0.15em]">{settings.phone}</span>
                </a>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 text-[#14141A] hover:text-[#D4B36A] transition-colors"
                >
                  <Mail className="h-4 w-4 text-[#D4B36A]" />
                  <span className="text-sm tracking-[0.15em]">{settings.email}</span>
                </a>
              )}
              <div className="flex items-center gap-5 pt-4 text-[10px] tracking-[0.3em] uppercase">
                {settings?.instagram && (
                  <a href={settings.instagram} target="_blank" rel="noreferrer" className="text-[#14141A] hover:text-[#D4B36A]">
                    Instagram
                  </a>
                )}
                {settings?.linkedin && (
                  <a href={settings.linkedin} target="_blank" rel="noreferrer" className="text-[#14141A] hover:text-[#D4B36A]">
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            <Link
              href="/iletisim"
              className="inline-flex items-center gap-3 mt-12 text-xs tracking-[0.4em] uppercase border border-[#14141A] text-[#14141A] hover:bg-[#14141A] hover:text-white px-8 py-4 transition-colors group"
            >
              {tx.sections.contactCta}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Press placeholder anchor */}
      <section id="press" className="bg-[#FAF8F4] pb-24 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto" />
      </section>
    </>
  );
}

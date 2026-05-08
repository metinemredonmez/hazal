"use client";

import Link from "next/link";
import { ArrowRight, Phone, Mail } from "lucide-react";
import { useLocale, t } from "@/lib/i18n";
import { useSettings } from "@/lib/use-settings";

export default function AboutPage() {
  const [locale] = useLocale();
  const tx = t[locale];
  const settings = useSettings();

  const aboutText =
    locale === "tr"
      ? settings?.aboutTr ??
        "İstanbul'un seçkin lokasyonlarında premium gayrimenkul danışmanlığı sunuyorum. Boğaz hattı, Bebek, Etiler, Zekeriyaköy ve Bodrum'da seçkin portföy. Her müşteri için sessiz, kişisel ve sonuç odaklı bir hizmet anlayışıyla çalışıyorum."
      : settings?.aboutEn ??
        "I provide premium real estate advisory across İstanbul's most distinguished neighborhoods — the Bosphorus line, Bebek, Etiler, Zekeriyaköy and Bodrum. Discreet, personalized, results-driven service tailored to every client.";

  return (
    <>
      {/* Hero */}
      <section className="bg-[#0E0E0E] text-[#F5F2EC] pt-32 lg:pt-40 pb-20 lg:pb-28 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-4">
            {tx.about.heading}
          </p>
          <h1 className="font-display font-light text-5xl lg:text-8xl leading-[0.95] max-w-5xl">
            {locale === "tr" ? (
              <>
                Premium gayrimenkul,
                <br />
                <span className="italic text-[#C9A96E]">kişisel hizmet.</span>
              </>
            ) : (
              <>
                Premium properties,
                <br />
                <span className="italic text-[#C9A96E]">personal service.</span>
              </>
            )}
          </h1>
        </div>
      </section>

      {/* Bio */}
      <section className="bg-[#FAF8F4] py-20 lg:py-28 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-5">
            <div className="aspect-[3/4] bg-[#1A1A1F] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings?.heroMediaUrl ?? "/login-bg.jpg"}
                alt="Hazal Muti"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3">
              {tx.about.role}
            </p>
            <h2 className="font-display font-light text-4xl lg:text-5xl text-[#14141A] mb-8">
              {tx.about.title}
            </h2>

            <div className="prose prose-lg text-[#14141A]/85 leading-relaxed space-y-5 max-w-2xl">
              {aboutText.split(/\n\n+/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Contact lines */}
            <div className="mt-12 space-y-3">
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-[#14141A] hover:text-[#C9A96E] transition-colors"
                >
                  <Phone className="h-4 w-4 text-[#C9A96E]" />
                  <span className="text-sm tracking-[0.15em]">{settings.phone}</span>
                </a>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 text-[#14141A] hover:text-[#C9A96E] transition-colors"
                >
                  <Mail className="h-4 w-4 text-[#C9A96E]" />
                  <span className="text-sm tracking-[0.15em]">{settings.email}</span>
                </a>
              )}
              <div className="flex items-center gap-5 pt-4 text-[10px] tracking-[0.3em] uppercase">
                {settings?.instagram && (
                  <a href={settings.instagram} target="_blank" rel="noreferrer" className="text-[#14141A] hover:text-[#C9A96E]">
                    Instagram
                  </a>
                )}
                {settings?.linkedin && (
                  <a href={settings.linkedin} target="_blank" rel="noreferrer" className="text-[#14141A] hover:text-[#C9A96E]">
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

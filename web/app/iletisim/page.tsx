"use client";

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useLocale, t } from "@/lib/i18n";
import { useSettings } from "@/lib/use-settings";
import { pageContent, pick } from "@/lib/page-content";
import { InquiryForm } from "@/components/site/inquiry-form";

export default function ContactPage() {
  const [locale] = useLocale();
  const tx = t[locale];
  const settings = useSettings();
  const contact = pageContent(settings).contact;

  const heroEyebrow = pick(contact?.heroEyebrow, locale, tx.contact.heading);
  const heroTitle = pick(
    contact?.heroTitle,
    locale,
    locale === "tr" ? "Birlikte\nçalışalım." : "Let's\nwork together.",
  );
  const intro = pick(contact?.intro, locale, tx.contact.sub);
  const workingHours = pick(contact?.workingHours, locale, "");
  const customAddress = pick(contact?.addressLine, locale, "");
  const addressDisplay = customAddress || settings?.address || "";

  const heroImage =
    (contact as { heroImageUrl?: string } | undefined)?.heroImageUrl ??
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=2400&q=85&auto=format&fit=crop";

  return (
    <div className="bg-[#FAF8F4]">
      {/* Hero */}
      <section
        className="relative bg-[#0E0E0E] text-[#F5F2EC] pt-32 lg:pt-40 pb-20 lg:pb-28 px-6 lg:px-10 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(14,14,14,0.94) 0%, rgba(14,14,14,0.78) 45%, rgba(14,14,14,0.48) 100%), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-[1600px] mx-auto relative">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-4">
            {heroEyebrow}
          </p>
          <h1 className="font-display font-light text-5xl lg:text-8xl leading-[0.95] max-w-4xl">
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
          <p className="mt-8 text-base lg:text-lg text-[#F5F2EC]/70 max-w-2xl">{intro}</p>
        </div>
      </section>

      {/* Form + direct contact */}
      <section className="py-20 lg:py-28 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Direct contact */}
          <div className="lg:col-span-4">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-4">
              {tx.contact.directContact}
            </p>
            <div className="space-y-6">
              {settings?.phone && (
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="block group">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] mb-1">Telefon</p>
                  <p className="font-display text-2xl text-[#14141A] group-hover:text-[#D4B36A] flex items-center gap-2">
                    <Phone className="h-5 w-5 text-[#D4B36A]" /> {settings.phone}
                  </p>
                </a>
              )}
              {settings?.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block group"
                >
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] mb-1">WhatsApp</p>
                  <p className="font-display text-2xl text-[#14141A] group-hover:text-[#D4B36A]">
                    {settings.whatsapp}
                  </p>
                </a>
              )}
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="block group">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] mb-1">E-posta</p>
                  <p className="font-display text-2xl text-[#14141A] group-hover:text-[#D4B36A] flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#D4B36A]" /> {settings.email}
                  </p>
                </a>
              )}
              {addressDisplay && (
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] mb-1">
                    {locale === "tr" ? "Adres" : "Address"}
                  </p>
                  <p className="text-[#14141A] flex items-start gap-2 whitespace-pre-line">
                    <MapPin className="h-5 w-5 text-[#D4B36A] mt-0.5 shrink-0" />
                    <span>{addressDisplay}</span>
                  </p>
                </div>
              )}

              {workingHours && (
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] mb-1">
                    {locale === "tr" ? "Çalışma Saatleri" : "Working Hours"}
                  </p>
                  <p className="text-[#14141A] flex items-start gap-2 whitespace-pre-line">
                    <Clock className="h-5 w-5 text-[#D4B36A] mt-0.5 shrink-0" />
                    <span>{workingHours}</span>
                  </p>
                </div>
              )}

              <div className="pt-6 flex gap-5 text-[10px] tracking-[0.3em] uppercase border-t border-[#E5E2DD] mt-2">
                {settings?.instagram && (
                  <a href={settings.instagram} target="_blank" rel="noreferrer" className="text-[#14141A] hover:text-[#D4B36A] mt-4">
                    Instagram
                  </a>
                )}
                {settings?.linkedin && (
                  <a href={settings.linkedin} target="_blank" rel="noreferrer" className="text-[#14141A] hover:text-[#D4B36A] mt-4">
                    LinkedIn
                  </a>
                )}
                {settings?.youtube && (
                  <a href={settings.youtube} target="_blank" rel="noreferrer" className="text-[#14141A] hover:text-[#D4B36A] mt-4">
                    YouTube
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-8">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-4">
              {tx.contact.form}
            </p>
            <InquiryForm variant="page" />
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { useLocale } from "@/lib/i18n";

type Card = {
  slug: string;
  brand: string;
  name: { tr: string; en: string };
  location: { tr: string; en: string };
  spec: { tr: string; en: string };
  tagline: { tr: string; en: string };
  image: string;
  video?: string;
  status: { tr: string; en: string };
  statusTone: "live" | "exclusive";
};

const CARDS: Card[] = [
  {
    slug: "atilgan-oasis",
    brand: "Atılgan İnşaat",
    name: { tr: "Atılgan Oasis", en: "Atılgan Oasis" },
    location: { tr: "Mavişehir · Karşıyaka · İzmir", en: "Mavişehir · Karşıyaka · İzmir" },
    spec: { tr: "78 villa · 4+1 / 5+1 / 8+1 · 426–869 m²", en: "78 villas · 4+1 / 5+1 / 8+1 · 426–869 m²" },
    tagline: {
      tr: "Mavişehir'de deniz, doğa ve müstakil yaşam — zamansız bir villa konsepti.",
      en: "Sea, nature and detached living in Mavişehir — a timeless villa concept.",
    },
    image: "/sample-apartments/DSC_0276.jpg",
    video: "/showcase/oasis-2026-02-24.mp4",
    status: { tr: "Satışı devam eden", en: "On sale" },
    statusTone: "live",
  },
  {
    slug: "atilgan-royal",
    brand: "Atılgan İnşaat",
    name: { tr: "Atılgan Royal", en: "Atılgan Royal" },
    location: { tr: "Private sok. · Mavişehir", en: "Private street · Mavişehir" },
    spec: { tr: "5+1 / 8+1 premium · davet ile", en: "5+1 / 8+1 premium · by invitation" },
    tagline: {
      tr: "Atılgan koleksiyonunun premium tier'ı — sınırlı sayıda özel villa, mahremiyet ve zarafet.",
      en: "The premium tier — a limited series of private villas with discretion and refinement.",
    },
    image: "/sample-apartments/DSC_0287.jpg",
    video: "/showcase/oasis-2025-11-25.mp4",
    status: { tr: "Davet ile", en: "By invitation" },
    statusTone: "exclusive",
  },
];

export function FeaturedCollection() {
  const [locale] = useLocale();

  return (
    <section className="bg-[#FAF8F4] py-20 lg:py-28 px-6 lg:px-10">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between gap-6 mb-10 lg:mb-14 flex-wrap">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-3">
              {locale === "tr" ? "PROJELERİMİZ" : "OUR PROJECTS"}
            </p>
            <h2 className="font-display font-light text-3xl lg:text-5xl leading-[1.05] max-w-3xl">
              {locale === "tr" ? (
                <>
                  Atılgan Royal &amp; Oasis,
                  <br />
                  <span className="italic text-[#D4B36A]">İzmir'in yükselen değeri.</span>
                </>
              ) : (
                <>
                  Atılgan Royal &amp; Oasis,
                  <br />
                  <span className="italic text-[#D4B36A]">İzmir's rising value.</span>
                </>
              )}
            </h2>
          </div>
          <Link
            href="/koleksiyon"
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#0E0E0E] hover:text-[#D4B36A] transition-colors"
          >
            {locale === "tr" ? "Tümünü Gör" : "View All"}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {CARDS.map((c) => (
            <Link
              key={c.slug}
              href="/koleksiyon"
              className="group relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-[#0E0E0E]"
            >
              {c.video ? (
                <video
                  src={`${c.video}#t=2`}
                  muted
                  loop
                  playsInline
                  autoPlay
                  poster={c.image}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt={c.name[locale]}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

              <span
                className={`absolute top-5 left-5 text-[9px] tracking-[0.3em] uppercase px-3 py-1.5 ${
                  c.statusTone === "live"
                    ? "bg-[#D4B36A] text-[#0E0E0E]"
                    : "border border-[#D4B36A] text-[#D4B36A] bg-black/30 backdrop-blur"
                }`}
              >
                {c.status[locale]}
              </span>

              <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8 text-white">
                <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-2">{c.brand}</p>
                <h3 className="font-display text-2xl lg:text-3xl leading-tight">{c.name[locale]}</h3>
                <p className="mt-2 text-[13px] text-white/85 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#D4B36A]" />
                  {c.location[locale]}
                </p>
                <p className="mt-1 text-[12px] text-white/75">{c.spec[locale]}</p>
                <p className="mt-4 text-sm text-white/85 max-w-lg line-clamp-2 lg:line-clamp-3">
                  {c.tagline[locale]}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[10px] tracking-[0.3em] uppercase text-[#D4B36A] group-hover:gap-3 transition-all">
                  {locale === "tr" ? "Detayı İncele" : "View Details"}
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Building2, MapPin, Ruler, Layers, ShieldCheck } from "lucide-react";
import { useLocale } from "@/lib/i18n";

type Spec = { label: { tr: string; en: string }; value: { tr: string; en: string } };

type Project = {
  slug: string;
  brand: string;
  name: { tr: string; en: string };
  tagline: { tr: string; en: string };
  heroImage: string;
  heroVideo?: string;
  location: { tr: string; en: string };
  description: { tr: string; en: string };
  specs: Spec[];
  features: { tr: string[]; en: string[] };
  gallery: string[];
  brochureUrl?: string;
  status: { tr: string; en: string };
  statusTone: "live" | "exclusive";
};

const PROJECTS: Project[] = [
  {
    slug: "atilgan-oasis",
    brand: "Atılgan İnşaat",
    name: { tr: "Atılgan Oasis", en: "Atılgan Oasis" },
    tagline: {
      tr: "Mavişehir'de deniz, doğa ve müstakil yaşam — zamansız bir villa konsepti.",
      en: "Sea, nature and detached living in Mavişehir — a timeless villa concept.",
    },
    heroImage: "/sample-apartments/DSC_0276.jpg",
    heroVideo: "/showcase/oasis-2026-02-24.mp4",
    location: {
      tr: "Mavişehir · Karşıyaka · İzmir",
      en: "Mavişehir · Karşıyaka · İzmir",
    },
    description: {
      tr: "Atılgan Oasis, Mavişehir'in prestijli aksında 78 adet villadan oluşan butik bir villa projesidir. Deniz hattına yakın konumu, akıllı ev sistemleri ve özel yüzme havuzlu villaları ile İzmir'in yükselen değerleri arasında öne çıkar.",
      en: "Atılgan Oasis is a boutique 78-villa development on Mavişehir's prestigious axis. With its proximity to the coastline, full smart-home integration and private pools, it stands out among İzmir's rising values.",
    },
    specs: [
      { label: { tr: "Daire tipleri", en: "Villa types" }, value: { tr: "4+1 · 5+1 · 8+1", en: "4+1 · 5+1 · 8+1" } },
      { label: { tr: "Villa büyüklüğü", en: "Villa size" }, value: { tr: "426 – 869 m²", en: "426 – 869 m²" } },
      { label: { tr: "Toplam villa", en: "Total villas" }, value: { tr: "78 villa", en: "78 villas" } },
      { label: { tr: "Konum", en: "Location" }, value: { tr: "Mavişehir / Karşıyaka", en: "Mavişehir / Karşıyaka" } },
    ],
    features: {
      tr: [
        "Her villaya özel yüzme havuzu",
        "Her villaya özel bahçe",
        "Akıllı ev sistemleri (KNX)",
        "Yüz tanıma + parmak izi giriş",
        "Görüntülü diafon",
        "Şömine, ebeveyn banyosu, giyinme odası",
        "Full ankastre mutfak + kiler",
        "Yerden ısıtma & soğutma",
        "Fitness salonu",
        "7/24 güvenlik",
        "Her villaya özel otopark",
        "Jakuzi, barbekü, teras",
      ],
      en: [
        "Private swimming pool per villa",
        "Private garden per villa",
        "Smart-home systems (KNX)",
        "Face recognition + fingerprint entry",
        "Video intercom",
        "Fireplace, master bath, dressing room",
        "Full built-in kitchen + pantry",
        "Underfloor heating & cooling",
        "Fitness center",
        "24/7 security",
        "Private parking per villa",
        "Jacuzzi, BBQ, terrace",
      ],
    },
    gallery: [
      "/sample-apartments/DSC_0214.jpg",
      "/sample-apartments/DSC_0241.jpg",
      "/sample-apartments/DSC_0252.jpg",
      "/sample-apartments/DSC_0266.jpg",
      "/sample-apartments/DSC_0276.jpg",
      "/sample-apartments/DSC_0285.jpg",
      "/sample-apartments/DSC_0292.jpg",
      "/sample-apartments/DSC_0301.jpg",
    ],
    brochureUrl: "https://atilganinsaat.com/proje/oasis",
    status: { tr: "Satışı devam eden proje", en: "On sale" },
    statusTone: "live",
  },
  {
    slug: "atilgan-royal",
    brand: "Atılgan İnşaat",
    name: { tr: "Atılgan Royal", en: "Atılgan Royal" },
    tagline: {
      tr: "Atılgan koleksiyonunun premium tier'ı — sınırlı sayıda özel villa, mahremiyet ve zarafet.",
      en: "The premium tier of the Atılgan collection — a limited series of private villas with discretion and refinement.",
    },
    heroImage: "/sample-apartments/DSC_0287.jpg",
    heroVideo: "/showcase/oasis-2025-11-25.mp4",
    location: {
      tr: "Mavişehir · Karşıyaka · İzmir",
      en: "Mavişehir · Karşıyaka · İzmir",
    },
    description: {
      tr: "Atılgan Royal, Atılgan Oasis koleksiyonu içinde özel olarak tanımlanmış bir seçkidir. Sınırlı sayıda mahrem konumlu villadan oluşur; kapsam, malzeme ve sosyal alan ayrıcalıkları standart koleksiyonun üzerine inşa edilir. Detaylar şahsi görüşme ile paylaşılır.",
      en: "Atılgan Royal is a curated selection within the broader Atılgan Oasis collection — a limited number of villas in discreet positions, with elevated specifications and exclusive amenities. Details are shared in private consultation.",
    },
    specs: [
      { label: { tr: "Seçki", en: "Selection" }, value: { tr: "Mahdut sayıda villa", en: "Limited number of villas" } },
      { label: { tr: "Tip aralığı", en: "Type range" }, value: { tr: "5+1 · 8+1 premium", en: "5+1 · 8+1 premium" } },
      { label: { tr: "Konum", en: "Location" }, value: { tr: "Private sok. / Mavişehir", en: "Private street / Mavişehir" } },
      { label: { tr: "Erişim", en: "Access" }, value: { tr: "Davet ile görüşme", en: "By invitation only" } },
    ],
    features: {
      tr: [
        "Mahremiyet odaklı konumlama",
        "Genişletilmiş özel havuz + spa alanı",
        "Premium malzeme ve teslim seçenekleri",
        "Özelleştirilebilir iç mimari",
        "Ayrıcalıklı concierge hizmeti",
        "Diğer detaylar şahsi görüşmede paylaşılır",
      ],
      en: [
        "Privacy-focused positioning",
        "Extended private pool + spa area",
        "Premium material and delivery options",
        "Customizable interior architecture",
        "Concierge service",
        "Further details shared in private consultation",
      ],
    },
    gallery: [
      "/sample-apartments/DSC_0287.jpg",
      "/sample-apartments/DSC_0289.jpg",
      "/sample-apartments/DSC_0295.jpg",
      "/sample-apartments/DSC_0297.jpg",
      "/sample-apartments/DSC_0299.jpg",
      "/sample-apartments/DSC_0303.jpg",
    ],
    status: { tr: "Davet ile", en: "By invitation" },
    statusTone: "exclusive",
  },
];

export default function KoleksiyonPage() {
  const [locale] = useLocale();

  return (
    <div className="bg-[#FAF8F4]">
      {/* Hero */}
      <section className="bg-[#0E0E0E] text-[#F5F2EC] pt-32 lg:pt-40 pb-20 lg:pb-28 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-4">
            {locale === "tr" ? "KOLEKSİYON" : "COLLECTION"}
          </p>
          <h1 className="font-display font-light text-3xl lg:text-5xl leading-[1.05] max-w-4xl">
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
          </h1>
          <p className="mt-8 text-base lg:text-lg text-[#F5F2EC]/70 max-w-2xl">
            {locale === "tr"
              ? "Karşıyaka Mavişehir aksında geliştirilen butik villa koleksiyonu. Atılgan İnşaat ile birlikte sunulan iki seçki: standart koleksiyon ve private tier."
              : "A boutique villa collection developed along the Karşıyaka Mavişehir axis. Two curated tiers from Atılgan İnşaat: standard collection and private."}
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="py-16 lg:py-24 px-6 lg:px-10 space-y-20 lg:space-y-32">
        <div className="max-w-[1600px] mx-auto space-y-20 lg:space-y-32">
          {PROJECTS.map((p, idx) => (
            <ProjectBlock key={p.slug} project={p} reverse={idx % 2 === 1} locale={locale} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0E0E0E] text-[#F5F2EC] py-20 lg:py-28 px-6 lg:px-10">
        <div className="max-w-[1100px] mx-auto text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-4">
            {locale === "tr" ? "İLETİŞİM" : "CONTACT"}
          </p>
          <h2 className="font-display font-light text-3xl lg:text-5xl leading-[1.05]">
            {locale === "tr" ? (
              <>
                Koleksiyonu birlikte
                <br />
                <span className="italic text-[#D4B36A]">inceleyelim.</span>
              </>
            ) : (
              <>
                Let's review the
                <br />
                <span className="italic text-[#D4B36A]">collection together.</span>
              </>
            )}
          </h2>
          <p className="mt-6 text-base text-[#F5F2EC]/70 max-w-xl mx-auto">
            {locale === "tr"
              ? "Plan, fiyat ve müsait villalar için Hazal Muti'ye doğrudan ulaşın."
              : "Reach Hazal Muti directly for plans, prices and available villas."}
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#D4B36A] text-[#D4B36A] hover:bg-[#D4B36A] hover:text-[#0E0E0E] transition-colors text-[11px] tracking-[0.3em] uppercase"
            >
              {locale === "tr" ? "İletişime Geç" : "Get in Touch"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProjectBlock({
  project: p,
  reverse,
  locale,
}: {
  project: Project;
  reverse: boolean;
  locale: "tr" | "en";
}) {
  const [lightboxIdx, setLightboxIdx] = React.useState<number | null>(null);

  return (
    <div className="space-y-12">
      {/* Top: hero media + headline */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] lg:aspect-[3/2] overflow-hidden bg-[#0E0E0E]">
            {p.heroVideo ? (
              <video
                src={`${p.heroVideo}#t=2`}
                muted
                loop
                playsInline
                autoPlay
                className="absolute inset-0 w-full h-full object-cover"
                poster={p.heroImage}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.heroImage} alt={p.name[locale]} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 text-white">
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A]">{p.brand}</p>
                <h3 className="font-display text-2xl lg:text-4xl leading-tight mt-1">{p.name[locale]}</h3>
              </div>
              <span
                className={`text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 ${
                  p.statusTone === "live"
                    ? "bg-[#D4B36A] text-[#0E0E0E]"
                    : "border border-[#D4B36A] text-[#D4B36A]"
                }`}
              >
                {p.status[locale]}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <p className="font-display text-xl lg:text-2xl leading-snug text-[#0E0E0E]">{p.tagline[locale]}</p>
          <p className="inline-flex items-center gap-2 text-sm text-[#666]">
            <MapPin className="h-4 w-4 text-[#D4B36A]" />
            {p.location[locale]}
          </p>
          <p className="text-[15px] leading-[1.75] text-[#3A3A3A]">{p.description[locale]}</p>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-2">
            {p.specs.map((s) => (
              <div key={s.label[locale]} className="border-t border-[#0E0E0E]/10 pt-3">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#999] mb-1">{s.label[locale]}</p>
                <p className="text-sm font-medium text-[#0E0E0E]">{s.value[locale]}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            {p.brochureUrl && (
              <a
                href={p.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0E0E0E] text-white text-[10px] tracking-[0.3em] uppercase hover:bg-[#D4B36A] hover:text-[#0E0E0E] transition-colors"
              >
                {locale === "tr" ? "Detaylı İnceleyin" : "View Details"}
                <ArrowRight className="h-3 w-3" />
              </a>
            )}
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#0E0E0E] text-[#0E0E0E] text-[10px] tracking-[0.3em] uppercase hover:bg-[#0E0E0E] hover:text-white transition-colors"
            >
              {locale === "tr" ? "Bilgi Al" : "Request Info"}
            </Link>
          </div>
        </div>
      </div>

      {/* Features list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-3">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-3 flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            {locale === "tr" ? "Proje Özellikleri" : "Project Features"}
          </p>
        </div>
        <ul className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
          {p.features[locale].map((f) => (
            <li key={f} className="text-sm text-[#3A3A3A] flex items-start gap-2">
              <span className="text-[#D4B36A] mt-1">•</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Gallery thumbs */}
      <div>
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-3 flex items-center gap-2">
          <Layers className="h-3.5 w-3.5" />
          {locale === "tr" ? "Galeri" : "Gallery"}
        </p>
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3">
          {p.gallery.map((src, i) => (
            <button
              key={src}
              onClick={() => setLightboxIdx(i)}
              className="relative aspect-[4/3] overflow-hidden bg-[#0E0E0E] group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 lg:p-10"
          onClick={() => setLightboxIdx(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.gallery[lightboxIdx]}
            alt=""
            className="max-h-[90vh] max-w-[95vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

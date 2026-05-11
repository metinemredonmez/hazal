"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Layers, ShieldCheck } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import type { Project } from "@/lib/projects";
import { API_URL } from "@/lib/api";

// Fallback — kullanılır eğer API boş/erişilemezse
const FALLBACK: Project[] = [
  {
    id: "fallback-oasis",
    slug: "atilgan-oasis",
    brandTr: "Atılgan İnşaat",
    brandEn: "Atılgan İnşaat",
    nameTr: "Atılgan Oasis",
    nameEn: "Atılgan Oasis",
    taglineTr: "Mavişehir'de deniz, doğa ve müstakil yaşam — zamansız bir villa konsepti.",
    taglineEn: "Sea, nature and detached living in Mavişehir — a timeless villa concept.",
    locationTr: "Mavişehir · Karşıyaka · İzmir",
    locationEn: "Mavişehir · Karşıyaka · İzmir",
    descriptionTr:
      "Atılgan Oasis, Mavişehir'in prestijli aksında 78 adet villadan oluşan butik bir villa projesidir. Deniz hattına yakın konumu, akıllı ev sistemleri ve özel yüzme havuzlu villaları ile İzmir'in yükselen değerleri arasında öne çıkar.",
    descriptionEn:
      "Atılgan Oasis is a boutique 78-villa development on Mavişehir's prestigious axis. With its proximity to the coastline, full smart-home integration and private pools, it stands out among İzmir's rising values.",
    heroImage: "/sample-apartments/DSC_0276.jpg",
    heroVideo: "/showcase/oasis-2026-02-24.mp4",
    specs: [
      { labelTr: "Daire tipleri", labelEn: "Villa types", valueTr: "4+1 · 5+1 · 8+1", valueEn: "4+1 · 5+1 · 8+1" },
      { labelTr: "Villa büyüklüğü", labelEn: "Villa size", valueTr: "426 – 869 m²", valueEn: "426 – 869 m²" },
      { labelTr: "Toplam villa", labelEn: "Total villas", valueTr: "78 villa", valueEn: "78 villas" },
      { labelTr: "Konum", labelEn: "Location", valueTr: "Mavişehir / Karşıyaka", valueEn: "Mavişehir / Karşıyaka" },
    ],
    featuresTr: [
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
    featuresEn: [
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
    statusTr: "Satışı devam eden proje",
    statusEn: "On sale",
    statusTone: "live",
    featured: true,
    order: 0,
    isPublished: true,
  },
  {
    id: "fallback-royal",
    slug: "atilgan-royal",
    brandTr: "Atılgan İnşaat",
    brandEn: "Atılgan İnşaat",
    nameTr: "Atılgan Royal",
    nameEn: "Atılgan Royal",
    taglineTr: "Atılgan koleksiyonunun premium tier'ı — sınırlı sayıda özel villa, mahremiyet ve zarafet.",
    taglineEn: "The premium tier of the Atılgan collection — a limited series of private villas with discretion and refinement.",
    locationTr: "Mavişehir · Karşıyaka · İzmir",
    locationEn: "Mavişehir · Karşıyaka · İzmir",
    descriptionTr:
      "Atılgan Royal, Atılgan Oasis koleksiyonu içinde özel olarak tanımlanmış bir seçkidir. Sınırlı sayıda mahrem konumlu villadan oluşur; kapsam, malzeme ve sosyal alan ayrıcalıkları standart koleksiyonun üzerine inşa edilir. Detaylar şahsi görüşme ile paylaşılır.",
    descriptionEn:
      "Atılgan Royal is a curated selection within the broader Atılgan Oasis collection — a limited number of villas in discreet positions, with elevated specifications and exclusive amenities. Details are shared in private consultation.",
    heroImage: "/sample-apartments/DSC_0287.jpg",
    heroVideo: "/showcase/oasis-2025-11-25.mp4",
    specs: [
      { labelTr: "Seçki", labelEn: "Selection", valueTr: "Mahdut sayıda villa", valueEn: "Limited number of villas" },
      { labelTr: "Tip aralığı", labelEn: "Type range", valueTr: "5+1 · 8+1 premium", valueEn: "5+1 · 8+1 premium" },
      { labelTr: "Konum", labelEn: "Location", valueTr: "Private sok. / Mavişehir", valueEn: "Private street / Mavişehir" },
      { labelTr: "Erişim", labelEn: "Access", valueTr: "Davet ile görüşme", valueEn: "By invitation only" },
    ],
    featuresTr: [
      "Mahremiyet odaklı konumlama",
      "Genişletilmiş özel havuz + spa alanı",
      "Premium malzeme ve teslim seçenekleri",
      "Özelleştirilebilir iç mimari",
      "Ayrıcalıklı concierge hizmeti",
      "Diğer detaylar şahsi görüşmede paylaşılır",
    ],
    featuresEn: [
      "Privacy-focused positioning",
      "Extended private pool + spa area",
      "Premium material and delivery options",
      "Customizable interior architecture",
      "Concierge service",
      "Further details shared in private consultation",
    ],
    gallery: [
      "/sample-apartments/DSC_0287.jpg",
      "/sample-apartments/DSC_0289.jpg",
      "/sample-apartments/DSC_0295.jpg",
      "/sample-apartments/DSC_0297.jpg",
      "/sample-apartments/DSC_0299.jpg",
      "/sample-apartments/DSC_0303.jpg",
    ],
    brochureUrl: null,
    statusTr: "Davet ile",
    statusEn: "By invitation",
    statusTone: "exclusive",
    featured: true,
    order: 1,
    isPublished: true,
  },
];

export default function KoleksiyonPage() {
  const [locale] = useLocale();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    fetch(`${API_URL}/api/projects`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Project[]) => {
        const list = Array.isArray(data) ? data : [];
        setProjects(list.length > 0 ? list : FALLBACK);
        setLoaded(true);
      })
      .catch(() => {
        setProjects(FALLBACK);
        setLoaded(true);
      });
  }, []);

  return (
    <div className="bg-[#FAF8F4]">
      {/* Hero */}
      <section className="bg-[#0E0E0E] text-[#F5F2EC] pt-32 lg:pt-40 pb-20 lg:pb-28 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-4">
            {locale === "tr" ? "PROJELERİMİZ" : "OUR PROJECTS"}
          </p>
          <h1 className="font-display font-light text-3xl lg:text-5xl leading-[1.05] max-w-4xl">
            {locale === "tr" ? (
              <>
                Hazal'ın seçtiği,
                <br />
                <span className="italic text-[#D4B36A]">imzalı projeler.</span>
              </>
            ) : (
              <>
                Curated by Hazal,
                <br />
                <span className="italic text-[#D4B36A]">signature developments.</span>
              </>
            )}
          </h1>
          <p className="mt-8 text-base lg:text-lg text-[#F5F2EC]/70 max-w-2xl">
            {locale === "tr"
              ? "Yüksek standartlı geliştiriciler ile birlikte sunulan, Hazal Muti seçkili portföy."
              : "A curated portfolio in partnership with high-standard developers, signed by Hazal Muti."}
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="py-16 lg:py-24 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto space-y-20 lg:space-y-32">
          {!loaded ? (
            <div className="h-96 animate-pulse bg-[#0E0E0E]/5" />
          ) : projects.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              {locale === "tr" ? "Henüz proje yok." : "No projects yet."}
            </p>
          ) : (
            projects.map((p, idx) => <ProjectBlock key={p.id} project={p} reverse={idx % 2 === 1} locale={locale} />)
          )}
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
                Projeleri birlikte
                <br />
                <span className="italic text-[#D4B36A]">inceleyelim.</span>
              </>
            ) : (
              <>
                Let's review the
                <br />
                <span className="italic text-[#D4B36A]">projects together.</span>
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
  const t = (tr: string, en: string) => (locale === "tr" ? tr : en);
  const tArr = (tr: string[], en: string[]) => (locale === "tr" ? tr : en);

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
              <img src={p.heroImage} alt={t(p.nameTr, p.nameEn)} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 text-white">
              <div>
                {(p.brandTr || p.brandEn) && (
                  <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A]">{t(p.brandTr, p.brandEn)}</p>
                )}
                <h3 className="font-display text-2xl lg:text-4xl leading-tight mt-1">{t(p.nameTr, p.nameEn)}</h3>
              </div>
              {(p.statusTr || p.statusEn) && (
                <span
                  className={`text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 ${
                    p.statusTone === "live"
                      ? "bg-[#D4B36A] text-[#0E0E0E]"
                      : "border border-[#D4B36A] text-[#D4B36A]"
                  }`}
                >
                  {t(p.statusTr, p.statusEn)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {(p.taglineTr || p.taglineEn) && (
            <p className="font-display text-xl lg:text-2xl leading-snug text-[#0E0E0E]">{t(p.taglineTr, p.taglineEn)}</p>
          )}
          {(p.locationTr || p.locationEn) && (
            <p className="inline-flex items-center gap-2 text-sm text-[#666]">
              <MapPin className="h-4 w-4 text-[#D4B36A]" />
              {t(p.locationTr, p.locationEn)}
            </p>
          )}
          {(p.descriptionTr || p.descriptionEn) && (
            <p className="text-[15px] leading-[1.75] text-[#3A3A3A]">{t(p.descriptionTr, p.descriptionEn)}</p>
          )}

          {/* Specs grid */}
          {p.specs.length > 0 && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-2">
              {p.specs.map((s, i) => (
                <div key={i} className="border-t border-[#0E0E0E]/10 pt-3">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#999] mb-1">{t(s.labelTr, s.labelEn)}</p>
                  <p className="text-sm font-medium text-[#0E0E0E]">{t(s.valueTr, s.valueEn)}</p>
                </div>
              ))}
            </div>
          )}

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
      {tArr(p.featuresTr, p.featuresEn).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-3">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-3 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              {locale === "tr" ? "Proje Özellikleri" : "Project Features"}
            </p>
          </div>
          <ul className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            {tArr(p.featuresTr, p.featuresEn).map((f, i) => (
              <li key={i} className="text-sm text-[#3A3A3A] flex items-start gap-2">
                <span className="text-[#D4B36A] mt-1">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gallery thumbs */}
      {p.gallery.length > 0 && (
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-3 flex items-center gap-2">
            <Layers className="h-3.5 w-3.5" />
            {locale === "tr" ? "Galeri" : "Gallery"}
          </p>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3">
            {p.gallery.map((src, i) => (
              <button
                key={src + i}
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
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && p.gallery[lightboxIdx] && (
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

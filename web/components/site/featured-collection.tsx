"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { useSettings } from "@/lib/use-settings";
import { pageContent, pick } from "@/lib/page-content";
import type { Project } from "@/lib/projects";
import { API_URL } from "@/lib/api";

// Fallback hardcoded cards — kullanılır eğer API boş ise (ilk deploy / down)
const FALLBACK: Project[] = [
  {
    id: "fallback-1",
    slug: "atilgan-oasis",
    brandTr: "Atılgan İnşaat",
    brandEn: "Atılgan İnşaat",
    nameTr: "Atılgan Oasis",
    nameEn: "Atılgan Oasis",
    locationTr: "Mavişehir · Karşıyaka · İzmir",
    locationEn: "Mavişehir · Karşıyaka · İzmir",
    taglineTr: "Mavişehir'de deniz, doğa ve müstakil yaşam — zamansız bir villa konsepti.",
    taglineEn: "Sea, nature and detached living in Mavişehir — a timeless villa concept.",
    descriptionTr: "",
    descriptionEn: "",
    heroImage: "/sample-apartments/DSC_0276.jpg",
    heroVideo: "/showcase/oasis-2026-02-24.mp4",
    specs: [],
    featuresTr: [],
    featuresEn: [],
    gallery: [],
    brochureUrl: null,
    statusTr: "Satışı devam eden",
    statusEn: "On sale",
    statusTone: "live",
    featured: true,
    order: 0,
    isPublished: true,
  },
  {
    id: "fallback-2",
    slug: "atilgan-royal",
    brandTr: "Atılgan İnşaat",
    brandEn: "Atılgan İnşaat",
    nameTr: "Atılgan Royal",
    nameEn: "Atılgan Royal",
    locationTr: "Private sok. · Mavişehir",
    locationEn: "Private street · Mavişehir",
    taglineTr: "Atılgan koleksiyonunun premium tier'ı — sınırlı sayıda özel villa.",
    taglineEn: "The premium tier — a limited series of private villas.",
    descriptionTr: "",
    descriptionEn: "",
    heroImage: "/sample-apartments/DSC_0287.jpg",
    heroVideo: "/showcase/oasis-2025-11-25.mp4",
    specs: [],
    featuresTr: [],
    featuresEn: [],
    gallery: [],
    brochureUrl: null,
    statusTr: "Davet ile",
    statusEn: "By invitation",
    statusTone: "exclusive",
    featured: true,
    order: 1,
    isPublished: true,
  },
];

export function FeaturedCollection() {
  const [locale] = useLocale();
  const settings = useSettings();
  const cmsCollection = pageContent(settings).collection;
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  const eyebrow = pick(cmsCollection?.eyebrow, locale, locale === "tr" ? "PROJELERİMİZ" : "OUR PROJECTS");
  const titleRaw = pick(
    cmsCollection?.title,
    locale,
    locale === "tr" ? "Hazal'ın seçtiği,\nimzalı projeler." : "Curated by Hazal,\nsignature developments.",
  );
  const ctaLabel = pick(cmsCollection?.ctaLabel, locale, locale === "tr" ? "Tümünü Gör" : "View All");

  React.useEffect(() => {
    fetch(`${API_URL}/api/projects/featured`)
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

  if (!loaded) {
    return (
      <section className="bg-[#FAF8F4] py-20 lg:py-28 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto h-96 animate-pulse bg-[#0E0E0E]/5" />
      </section>
    );
  }

  if (projects.length === 0) return null;

  return (
    <section className="bg-[#FAF8F4] py-20 lg:py-28 px-6 lg:px-10">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between gap-6 mb-10 lg:mb-14 flex-wrap">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-3">{eyebrow}</p>
            <h2 className="font-display font-light text-3xl lg:text-5xl leading-[1.05] max-w-3xl">
              {(() => {
                const lines = titleRaw.split("\n");
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
            </h2>
          </div>
          <Link
            href="/koleksiyon"
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#0E0E0E] hover:text-[#D4B36A] transition-colors"
          >
            {ctaLabel}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div
          className={`grid gap-6 lg:gap-8 ${
            projects.length === 1
              ? "grid-cols-1 max-w-3xl mx-auto"
              : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {projects.map((p) => (
            <Link
              key={p.id}
              href="/koleksiyon"
              className="group relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-[#0E0E0E]"
            >
              {p.heroVideo ? (
                <video
                  src={`${p.heroVideo}#t=2`}
                  muted
                  loop
                  playsInline
                  autoPlay
                  poster={p.heroImage}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.heroImage}
                  alt={locale === "tr" ? p.nameTr : p.nameEn}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

              {(p.statusTr || p.statusEn) && (
                <span
                  className={`absolute top-5 left-5 text-[9px] tracking-[0.3em] uppercase px-3 py-1.5 ${
                    p.statusTone === "live"
                      ? "bg-[#D4B36A] text-[#0E0E0E]"
                      : "border border-[#D4B36A] text-[#D4B36A] bg-black/30 backdrop-blur"
                  }`}
                >
                  {locale === "tr" ? p.statusTr : p.statusEn}
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8 text-white">
                {(p.brandTr || p.brandEn) && (
                  <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-2">
                    {locale === "tr" ? p.brandTr : p.brandEn}
                  </p>
                )}
                <h3 className="font-display text-2xl lg:text-3xl leading-tight">
                  {locale === "tr" ? p.nameTr : p.nameEn}
                </h3>
                {(p.locationTr || p.locationEn) && (
                  <p className="mt-2 text-[13px] text-white/85 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#D4B36A]" />
                    {locale === "tr" ? p.locationTr : p.locationEn}
                  </p>
                )}
                {(p.taglineTr || p.taglineEn) && (
                  <p className="mt-4 text-sm text-white/85 max-w-lg line-clamp-3">
                    {locale === "tr" ? p.taglineTr : p.taglineEn}
                  </p>
                )}
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

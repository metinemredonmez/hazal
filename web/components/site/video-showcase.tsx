"use client";

import * as React from "react";
import { Play, X, Volume2, VolumeX } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { useSettings } from "@/lib/use-settings";
import { pageContent, pick } from "@/lib/page-content";

interface VideoItem {
  src: string;
  poster?: string;
  titleTr: string;
  titleEn: string;
  date?: string;
}

// Files served by Next.js from web/public/showcase/
// (symlink to /var/www/hazal/api/uploads/showcase/)
const DEFAULT_VIDEOS: VideoItem[] = [
  {
    src: "/showcase/atilgan-royal-2025-12-24.mp4",
    titleTr: "Atılgan Royal",
    titleEn: "Atılgan Royal",
    date: "24.12.2025",
  },
  {
    src: "/showcase/atilgan-royal-oasis-mutlu-yillar-2025-12-30.mp4",
    titleTr: "Atılgan Royal & Oasis · Yılbaşı",
    titleEn: "Atılgan Royal & Oasis · New Year",
    date: "30.12.2025",
  },
  {
    src: "/showcase/oasis-2026-02-24.mp4",
    titleTr: "Oasis Sunum",
    titleEn: "Oasis Showcase",
    date: "24.02.2026",
  },
];

export function VideoShowcase({ videos: propVideos }: { videos?: VideoItem[] }) {
  const [locale] = useLocale();
  const settings = useSettings();
  const home = pageContent(settings).home;

  // CMS'ten video al, yoksa default'ları göster
  const cmsVideos: VideoItem[] = [1, 2, 3]
    .map((n) => {
      const url = home?.[`showcaseVideo${n}Url` as keyof typeof home] as string | undefined;
      if (!url) return null;
      const titleObj = home?.[`showcaseVideo${n}Title` as keyof typeof home] as
        | { tr: string; en: string }
        | undefined;
      const date = home?.[`showcaseVideo${n}Date` as keyof typeof home] as string | undefined;
      return {
        src: url,
        titleTr: pick(titleObj, "tr", `Video ${n}`),
        titleEn: pick(titleObj, "en", `Video ${n}`),
        date,
      } as VideoItem;
    })
    .filter((v): v is VideoItem => v !== null);

  const videos =
    propVideos && propVideos.length > 0
      ? propVideos
      : cmsVideos.length > 0
        ? cmsVideos
        : DEFAULT_VIDEOS;

  // Hiç video yoksa bölümü gizle (CMS boş + default da olmazsa)
  if (videos.length === 0) return null;

  // Add #t=0.5 fragment so browser shows first frame as preview poster
  const withPreview = (src: string) => (src.includes("#t=") ? src : `${src}#t=0.5`);
  const [active, setActive] = React.useState<VideoItem | null>(null);
  const [muted, setMuted] = React.useState(true);

  React.useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  React.useEffect(() => {
    if (active) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [active]);

  return (
    <section className="bg-[#0E0E0E] text-[#F5F2EC] py-14 lg:py-20 px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8 lg:mb-10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-2">
            {locale === "tr" ? "Video Sunum" : "Video Showcase"}
          </p>
          <h2 className="font-display font-light text-2xl lg:text-3xl">
            {locale === "tr" ? "Mülklerden kareler" : "Frames from properties"}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-6">
          {videos.map((v) => (
            <button
              key={v.src}
              onClick={() => setActive(v)}
              className="group relative aspect-[4/5] overflow-hidden bg-[#1A1A1F] rounded-sm"
            >
              <video
                src={withPreview(v.src)}
                preload="metadata"
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-[#C9A96E]/95 text-[#14141A] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3.5 text-left">
                {v.date && (
                  <p className="text-[9px] tracking-[0.4em] uppercase text-[#C9A96E] mb-1">
                    {v.date}
                  </p>
                )}
                <h3 className="font-display text-base text-white line-clamp-1">
                  {locale === "tr" ? v.titleTr : v.titleEn}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 lg:p-10"
          onClick={() => setActive(null)}
        >
          <button
            className="absolute top-5 right-5 text-white/70 hover:text-white p-2 z-10"
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              key={active.src}
              src={active.src}
              poster={active.poster}
              autoPlay
              controls
              preload="auto"
              muted={muted}
              playsInline
              className="block max-h-[85vh] max-w-[95vw] w-auto h-auto rounded-sm shadow-2xl bg-black"
            />
            <div className="mt-3 flex items-center justify-between gap-4 text-white/85 w-full max-w-md">
              <div className="text-center flex-1">
                {active.date && (
                  <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E]">
                    {active.date}
                  </p>
                )}
                <h3 className="font-display text-lg mt-0.5">
                  {locale === "tr" ? active.titleTr : active.titleEn}
                </h3>
              </div>
              <button
                onClick={() => setMuted((m) => !m)}
                className="p-2 hover:text-[#C9A96E] transition-colors"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import * as React from "react";
import { Play, X, Volume2, VolumeX } from "lucide-react";
import { useLocale } from "@/lib/i18n";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.hazalmuti.com").replace(
  /\/$/,
  "",
);

interface VideoItem {
  src: string;
  poster?: string;
  titleTr: string;
  titleEn: string;
  date?: string;
}

const DEFAULT_VIDEOS: VideoItem[] = [
  {
    src: `${API_URL}/uploads/showcase/atilgan-royal-2025-12-24.mp4`,
    titleTr: "Atılgan Royal",
    titleEn: "Atılgan Royal",
    date: "24.12.2025",
  },
  {
    src: `${API_URL}/uploads/showcase/atilgan-royal-oasis-mutlu-yillar-2025-12-30.mp4`,
    titleTr: "Atılgan Royal & Oasis · Yılbaşı",
    titleEn: "Atılgan Royal & Oasis · New Year",
    date: "30.12.2025",
  },
  {
    src: `${API_URL}/uploads/showcase/oasis-2026-02-24.mp4`,
    titleTr: "Oasis Sunum",
    titleEn: "Oasis Showcase",
    date: "24.02.2026",
  },
];

export function VideoShowcase({ videos = DEFAULT_VIDEOS }: { videos?: VideoItem[] }) {
  const [locale] = useLocale();
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
    <section className="bg-[#0E0E0E] text-[#F5F2EC] py-20 lg:py-28 px-6 lg:px-10">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-10 lg:mb-14">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3">
            {locale === "tr" ? "Video Sunum" : "Video Showcase"}
          </p>
          <h2 className="font-display font-light text-3xl lg:text-5xl">
            {locale === "tr" ? "Mülklerden kareler" : "Frames from properties"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-5">
          {videos.map((v) => (
            <button
              key={v.src}
              onClick={() => setActive(v)}
              className="group relative aspect-[4/5] overflow-hidden bg-[#1A1A1F] rounded-sm"
            >
              <video
                src={v.src}
                preload="metadata"
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-[#C9A96E]/95 text-[#14141A] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                <p className="text-[9px] tracking-[0.4em] uppercase text-[#C9A96E] mb-1">
                  {v.date}
                </p>
                <h3 className="font-display text-xl text-white">
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
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={active.src}
              poster={active.poster}
              autoPlay
              controls
              muted={muted}
              playsInline
              className="w-full h-auto max-h-[85vh] rounded-sm shadow-2xl bg-black"
            />
            <div className="mt-4 flex items-center justify-between text-white/85">
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E]">
                  {active.date}
                </p>
                <h3 className="font-display text-2xl mt-1">
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

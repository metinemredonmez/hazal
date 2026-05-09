"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/lib/i18n";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.hazalmuti.com").replace(
  /\/$/,
  "",
);

const SAMPLE_FILES = [
  "DSC_0214.jpg",
  "DSC_0241.jpg",
  "DSC_0247.jpg",
  "DSC_0248.jpg",
  "DSC_0252.jpg",
  "DSC_0256.jpg",
  "DSC_0258.jpg",
  "DSC_0260.jpg",
  "DSC_0263.jpg",
  "DSC_0266.jpg",
  "DSC_0268.jpg",
  "DSC_0270.jpg",
  "DSC_0271.jpg",
  "DSC_0272.jpg",
  "DSC_0273.jpg",
  "DSC_0276.jpg",
  "DSC_0278.jpg",
  "DSC_0279.jpg",
  "DSC_0280.jpg",
  "DSC_0281.jpg",
  "DSC_0283.jpg",
  "DSC_0284.jpg",
  "DSC_0285.jpg",
  "DSC_0287.jpg",
  "DSC_0288.jpg",
  "DSC_0289.jpg",
  "DSC_0290.jpg",
  "DSC_0291.jpg",
  "DSC_0292.jpg",
  "DSC_0295.jpg",
  "DSC_0297.jpg",
  "DSC_0298.jpg",
  "DSC_0299.jpg",
  "DSC_0300.jpg",
  "DSC_0301.jpg",
  "DSC_0302.jpg",
  "DSC_0303.jpg",
];

const IMAGES = SAMPLE_FILES.map((f) => `${API_URL}/uploads/sample-apartments/${f}`);

export function SampleApartments() {
  const [locale] = useLocale();
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(null);
      if (e.key === "ArrowLeft") setOpenIdx((i) => (i! > 0 ? i! - 1 : IMAGES.length - 1));
      if (e.key === "ArrowRight") setOpenIdx((i) => (i! < IMAGES.length - 1 ? i! + 1 : 0));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openIdx]);

  React.useEffect(() => {
    if (openIdx !== null) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [openIdx]);

  return (
    <section className="bg-white pb-12 lg:pb-16 px-6 lg:px-10">
      <div className="max-w-[1400px] mx-auto">

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3">
          {IMAGES.map((src, i) => (
            <button
              key={src}
              onClick={() => setOpenIdx(i)}
              className="group relative aspect-[4/5] overflow-hidden bg-[#FAF8F4]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {openIdx !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 lg:p-10"
          onClick={() => setOpenIdx(null)}
        >
          <button
            className="absolute top-5 right-5 text-white/70 hover:text-white p-2 z-10"
            onClick={() => setOpenIdx(null)}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            className="absolute left-5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx((i) => (i! > 0 ? i! - 1 : IMAGES.length - 1));
            }}
            aria-label="Previous"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx((i) => (i! < IMAGES.length - 1 ? i! + 1 : 0));
            }}
            aria-label="Next"
          >
            <ChevronRight className="h-7 w-7" />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMAGES[openIdx]}
            alt=""
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase text-white/60">
            {openIdx + 1} / {IMAGES.length}
          </div>
        </div>
      )}
    </section>
  );
}

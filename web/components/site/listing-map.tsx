"use client";

import * as React from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { useSettings } from "@/lib/use-settings";
import { useLocale } from "@/lib/i18n";

const DEFAULT_PUBLIC_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

interface ListingMapProps {
  lat: number;
  lng: number;
  title?: string;
  zoom?: number;
}

/**
 * Static Mapbox map (no JS bundle, just <img>).
 * Uses Mapbox Static Images API; needs MAPBOX token set either as
 * NEXT_PUBLIC_MAPBOX_TOKEN env or in Site Settings (admin).
 *
 * Falls back to OpenStreetMap iframe if no token configured —
 * still functional, just no Mapbox styling.
 */
export function ListingMap({ lat, lng, title, zoom = 14 }: ListingMapProps) {
  const settings = useSettings();
  const [locale] = useLocale();
  const token = DEFAULT_PUBLIC_TOKEN || settings?.mapboxToken || "";

  // Open coordinates in Google Maps for navigation
  const gmapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  if (!token) {
    // Fallback: free OpenStreetMap embed
    const bbox = `${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}`;
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden border border-[#E5E2DD] bg-[#FAF8F4]">
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
          className="w-full h-full"
          loading="lazy"
          title={title ?? "Konum"}
        />
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-white/95 text-[#14141A] hover:bg-white text-xs tracking-[0.2em] uppercase px-3 py-2 backdrop-blur shadow"
        >
          <ExternalLink className="h-3 w-3" />
          {locale === "tr" ? "Yol tarifi" : "Directions"}
        </a>
      </div>
    );
  }

  // Mapbox Static Images API — pin in accent color
  const pinColor = "C9A96E";
  const staticUrl =
    `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/` +
    `pin-l+${pinColor}(${lng},${lat})/` +
    `${lng},${lat},${zoom}/1280x720@2x` +
    `?access_token=${token}`;

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden border border-[#E5E2DD] bg-[#FAF8F4]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={staticUrl} alt={title ?? "Konum haritası"} className="w-full h-full object-cover" />
      <a
        href={gmapsUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-white/95 text-[#14141A] hover:bg-white text-xs tracking-[0.2em] uppercase px-3 py-2 backdrop-blur shadow"
      >
        <ExternalLink className="h-3 w-3" />
        {locale === "tr" ? "Yol tarifi" : "Directions"}
      </a>
      {title && (
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 text-[#14141A] text-xs px-3 py-1.5 backdrop-blur shadow">
          <MapPin className="h-3 w-3 text-[#C9A96E]" />
          <span className="line-clamp-1 max-w-[260px]">{title}</span>
        </div>
      )}
    </div>
  );
}

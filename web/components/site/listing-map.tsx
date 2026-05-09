"use client";

import * as React from "react";
import { ExternalLink, MapPin, Navigation, Copy, Check } from "lucide-react";
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
 * Premium interactive map for listing detail pages.
 *
 * - Mapbox Static Images API (high-DPI dark style) when token available
 * - OpenStreetMap iframe fallback (no token)
 * - Action overlay: Google Maps, Apple Maps, Copy coordinates
 *
 * No mapbox-gl bundle = no extra ~100KB JS, fast page load.
 */
export function ListingMap({ lat, lng, title, zoom = 14 }: ListingMapProps) {
  const settings = useSettings();
  const [locale] = useLocale();
  const [copied, setCopied] = React.useState(false);
  const token = DEFAULT_PUBLIC_TOKEN || settings?.mapboxToken || "";

  const gmapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${lat},${lng}&ll=${lat},${lng}`;
  const wazeUrl = `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  const coordStr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

  const copyCoords = async () => {
    try {
      await navigator.clipboard.writeText(coordStr);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const isApple =
    typeof navigator !== "undefined" &&
    /iP(hone|ad|od)|Mac/.test(navigator.userAgent ?? "");
  const directionsUrl = isApple ? appleMapsUrl : gmapsUrl;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] w-full overflow-hidden border border-[#E5E2DD] bg-[#FAF8F4] rounded-sm">
        {token ? (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={locale === "tr" ? "Yol tarifi" : "Get directions"}
            className="block w-full h-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/` +
                `pin-l+C9A96E(${lng},${lat})/` +
                `${lng},${lat},${zoom}/1280x720@2x` +
                `?access_token=${token}`
              }
              alt={title ?? "Konum haritası"}
              className="w-full h-full object-cover"
            />
          </a>
        ) : (
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`}
            className="w-full h-full"
            loading="lazy"
            title={title ?? "Konum"}
          />
        )}

        {title && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 text-[#14141A] text-xs px-3 py-1.5 backdrop-blur shadow rounded-sm">
            <MapPin className="h-3 w-3 text-[#C9A96E]" />
            <span className="line-clamp-1 max-w-[260px]">{title}</span>
          </div>
        )}

        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-[#14141A] hover:bg-[#C9A96E] text-white text-xs tracking-[0.2em] uppercase px-4 py-2.5 transition-colors shadow-lg rounded-sm"
        >
          <Navigation className="h-3.5 w-3.5" />
          {locale === "tr" ? "Yol Tarifi" : "Directions"}
        </a>
      </div>

      {/* Quick actions row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E2DD] hover:border-[#C9A96E] hover:text-[#C9A96E] text-[#14141A]/80 transition-colors rounded-sm"
        >
          <ExternalLink className="h-3 w-3" /> Google Maps
        </a>
        <a
          href={appleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E2DD] hover:border-[#C9A96E] hover:text-[#C9A96E] text-[#14141A]/80 transition-colors rounded-sm"
        >
          <ExternalLink className="h-3 w-3" /> Apple Maps
        </a>
        <a
          href={wazeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E2DD] hover:border-[#C9A96E] hover:text-[#C9A96E] text-[#14141A]/80 transition-colors rounded-sm"
        >
          <ExternalLink className="h-3 w-3" /> Waze
        </a>
        <button
          onClick={copyCoords}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E2DD] hover:border-[#C9A96E] hover:text-[#C9A96E] text-[#14141A]/80 transition-colors ml-auto rounded-sm"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-[#C9A96E]" />
              {locale === "tr" ? "Kopyalandı" : "Copied"}
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> {coordStr}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Bed, Bath, Maximize2, Heart, GitCompare, Check } from "lucide-react";
import { useLocale, t, CATEGORY_LABEL } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { useFavorites, useCompare } from "@/lib/favorites";
import type { Listing } from "@/lib/types";

interface Props {
  listing: Listing;
  size?: "default" | "large";
}

export function ListingCard({ listing, size = "default" }: Props) {
  const [locale] = useLocale();
  const tx = t[locale];
  const cover =
    listing.images.find((i) => i.isPrimary)?.url ?? listing.images[0]?.url ?? null;
  const title = locale === "tr" ? listing.titleTr : listing.titleEn;
  const cityLine = [listing.district, listing.city].filter(Boolean).join(", ");

  const fav = useFavorites();
  const cmp = useCompare();
  const isFav = fav.has(listing.slug);
  const isCmp = cmp.has(listing.slug);

  function onFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    fav.toggle(listing.slug);
  }
  function onCmp(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isCmp && cmp.full) {
      // soft-fail; UI hint via title attr (alert too disruptive)
      return;
    }
    cmp.toggle(listing.slug);
  }

  return (
    <Link
      href={`/ilanlar/${listing.slug}`}
      className="group block"
    >
      <div
        className={`relative overflow-hidden bg-[#1A1A1F] ${
          size === "large" ? "aspect-[4/3]" : "aspect-[5/4]"
        }`}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#F5F2EC]/30 text-xs">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="text-[9px] tracking-[0.3em] uppercase bg-black/70 text-[#F5F2EC] px-3 py-1 backdrop-blur">
            {listing.type === "SALE" ? tx.listing.forSale : tx.listing.forRent}
          </span>
          {listing.featured && (
            <span className="text-[9px] tracking-[0.3em] uppercase bg-[#C9A96E] text-[#14141A] px-3 py-1">
              ★
            </span>
          )}
        </div>

        {/* Favori + Karşılaştır overlay (sağ üst) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            onClick={onFav}
            aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
            title={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
            className={
              "w-8 h-8 rounded-full backdrop-blur flex items-center justify-center transition-all " +
              (isFav
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white/85 text-[#14141A] hover:bg-white opacity-0 group-hover:opacity-100")
            }
          >
            <Heart className={"h-4 w-4 " + (isFav ? "fill-current" : "")} />
          </button>
          <button
            onClick={onCmp}
            aria-label={
              isCmp
                ? "Karşılaştırmadan çıkar"
                : cmp.full
                  ? `Maks ${cmp.max} ilan karşılaştırılabilir`
                  : "Karşılaştırmaya ekle"
            }
            title={
              isCmp
                ? "Karşılaştırmadan çıkar"
                : cmp.full
                  ? `Maks ${cmp.max} ilan`
                  : "Karşılaştır"
            }
            className={
              "w-8 h-8 rounded-full backdrop-blur flex items-center justify-center transition-all " +
              (isCmp
                ? "bg-[#C9A96E] text-[#14141A] shadow-lg"
                : cmp.full
                  ? "bg-white/40 text-[#14141A]/40 cursor-not-allowed opacity-0 group-hover:opacity-100"
                  : "bg-white/85 text-[#14141A] hover:bg-white opacity-0 group-hover:opacity-100")
            }
          >
            {isCmp ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="pt-5 pb-2">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">
          {CATEGORY_LABEL[listing.category]?.[locale] ?? listing.category}
          {cityLine && <span className="text-[#6E6E73]"> · {cityLine}</span>}
        </p>
        <h3 className="font-display text-xl lg:text-2xl text-[#14141A] leading-tight group-hover:text-[#C9A96E] transition-colors">
          {title}
        </h3>
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-base font-medium text-[#14141A]">
            {listing.price
              ? formatCurrency(listing.price, listing.currency)
              : tx.listing.priceOnRequest}
          </p>
          <div className="flex items-center gap-3 text-[#6E6E73] text-xs">
            {listing.bedrooms != null && (
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" /> {listing.bedrooms}
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" /> {listing.bathrooms}
              </span>
            )}
            {listing.areaM2 != null && (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3.5 w-3.5" /> {listing.areaM2}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton({ size = "default" }: { size?: "default" | "large" }) {
  return (
    <div className="block">
      <div
        className={`bg-[#F0EDE6] animate-pulse ${
          size === "large" ? "aspect-[4/3]" : "aspect-[5/4]"
        }`}
      />
      <div className="pt-5 space-y-2">
        <div className="h-3 w-32 bg-[#F0EDE6] animate-pulse" />
        <div className="h-6 w-3/4 bg-[#F0EDE6] animate-pulse" />
        <div className="h-4 w-1/2 bg-[#F0EDE6] animate-pulse" />
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { useLocale } from "@/lib/i18n";
import { api } from "@/lib/api";
import { ListingCard, ListingCardSkeleton } from "@/components/site/listing-card";
import type { Listing } from "@/lib/types";

export default function FavorilerimPage() {
  const fav = useFavorites();
  const [locale] = useLocale();
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (fav.favorites.length === 0) {
      setLoading(false);
      setListings([]);
      return;
    }
    setLoading(true);
    Promise.all(
      fav.favorites.map((slug) =>
        api<Listing>(`/api/listings/${slug}`, { auth: false }).catch(() => null),
      ),
    )
      .then((results) =>
        setListings(results.filter((l): l is Listing => l !== null)),
      )
      .finally(() => setLoading(false));
  }, [fav.favorites]);

  const tx = {
    tr: {
      title: "Favorilerim",
      subtitle: "Beğendiğin ilanlar burada toplanır",
      empty: "Henüz favori ilan yok",
      emptyHint: "İlanları gezerken kalp ikonuna basarak favorilere ekleyebilirsin.",
      browse: "İlanlara Git",
      back: "Tüm ilanlara dön",
      clearAll: "Tümünü Temizle",
    },
    en: {
      title: "My Favorites",
      subtitle: "Listings you saved",
      empty: "No favorite listings yet",
      emptyHint: "Tap the heart icon while browsing to save listings here.",
      browse: "Browse Listings",
      back: "Back to all listings",
      clearAll: "Clear All",
    },
  }[locale];

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <section className="bg-[#0E0E0E] text-[#F5F2EC] pt-32 lg:pt-40 pb-16 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          <Link
            href="/ilanlar"
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] hover:text-[#F5F2EC] mb-6"
          >
            <ArrowLeft className="h-3 w-3" />
            {tx.back}
          </Link>
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3">
            {tx.subtitle}
          </p>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-display font-light text-4xl lg:text-6xl flex items-center gap-3">
              <Heart className="h-7 w-7 lg:h-10 lg:w-10 fill-[#C9A96E] text-[#C9A96E]" />
              {tx.title}
            </h1>
            {fav.count > 0 && (
              <button
                onClick={fav.clear}
                className="text-[10px] tracking-[0.3em] uppercase text-[#F5F2EC]/50 hover:text-[#C9A96E] transition-colors"
              >
                {tx.clearAll}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <ListingCardSkeleton key={i} size="large" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16">
              <Heart className="h-12 w-12 mx-auto opacity-30 mb-4" />
              <h2 className="font-display text-2xl mb-2">{tx.empty}</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {tx.emptyHint}
              </p>
              <Link
                href="/ilanlar"
                className="inline-block px-5 py-3 bg-[#14141A] text-white rounded text-sm hover:bg-[#C9A96E]"
              >
                {tx.browse}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} size="large" />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

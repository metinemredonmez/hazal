"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useLocale, t } from "@/lib/i18n";
import type { Listing } from "@/lib/types";
import { ListingCard, ListingCardSkeleton } from "./listing-card";

export function FeaturedListings() {
  const [locale] = useLocale();
  const tx = t[locale];
  const [items, setItems] = React.useState<Listing[] | null>(null);

  React.useEffect(() => {
    api<Listing[]>("/api/listings/featured", { auth: false })
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <section className="bg-[#FAF8F4] py-24 lg:py-32 px-6 lg:px-10">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between mb-12 lg:mb-16">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3">
              {tx.sections.featuredSub}
            </p>
            <h2 className="font-display font-light text-4xl lg:text-6xl text-[#14141A]">
              {tx.sections.featured}
            </h2>
          </div>
          <Link
            href="/ilanlar"
            className="hidden md:flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#14141A] hover:text-[#C9A96E] group"
          >
            {tx.sections.viewAll}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {items === null
            ? Array.from({ length: 3 }).map((_, i) => <ListingCardSkeleton key={i} size="large" />)
            : items.length === 0
            ? null
            : items.slice(0, 6).map((l) => <ListingCard key={l.id} listing={l} size="large" />)}
        </div>

        {items !== null && items.length === 0 && (
          <p className="text-center text-sm text-[#6E6E73] py-12">{tx.listing.noResults}</p>
        )}

        <div className="md:hidden mt-10 text-center">
          <Link
            href="/ilanlar"
            className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase border-b border-[#C9A96E] text-[#C9A96E] pb-1"
          >
            {tx.sections.viewAll} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}

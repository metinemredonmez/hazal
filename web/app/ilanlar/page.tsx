"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { api } from "@/lib/api";
import { useLocale, t, CATEGORY_LABEL } from "@/lib/i18n";
import type { Listing, Paginated } from "@/lib/types";
import { ListingCard, ListingCardSkeleton } from "@/components/site/listing-card";

function ListingsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [locale] = useLocale();
  const tx = t[locale];

  const q = params.get("q") ?? "";
  const type = params.get("type") ?? "";
  const category = params.get("category") ?? "";
  const city = params.get("city") ?? "";
  const sort = params.get("sort") ?? "newest";
  const featured = params.get("featured");

  const [data, setData] = React.useState<Paginated<Listing> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [qInput, setQInput] = React.useState(q);

  React.useEffect(() => {
    setQInput(q);
  }, [q]);

  React.useEffect(() => {
    setLoading(true);
    const sp = new URLSearchParams();
    sp.set("status", "ACTIVE");
    if (q) sp.set("q", q);
    if (type) sp.set("type", type);
    if (category) sp.set("category", category);
    if (city) sp.set("city", city);
    if (featured) sp.set("featured", "true");
    sp.set("sort", sort);
    sp.set("pageSize", "24");

    api<Paginated<Listing>>(`/api/listings?${sp.toString()}`, { auth: false })
      .then(setData)
      .catch(() => setData({ items: [], page: 1, pageSize: 24, total: 0, totalPages: 0 }))
      .finally(() => setLoading(false));
  }, [q, type, category, city, sort, featured]);

  function setParam(key: string, value: string | null) {
    const sp = new URLSearchParams(params.toString());
    if (value === null || value === "") sp.delete(key);
    else sp.set(key, value);
    router.replace(`/ilanlar${sp.toString() ? "?" + sp.toString() : ""}`);
  }

  function clearAll() {
    router.replace("/ilanlar");
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setParam("q", qInput.trim() || null);
  }

  const activeFilters = [type, category, city, featured].filter(Boolean).length;

  const heading =
    type === "SALE"
      ? tx.nav.listingsSale
      : type === "RENT"
      ? tx.nav.listingsRent
      : featured
      ? tx.nav.listingsFeatured
      : tx.nav.listingsAll;

  return (
    <div className="bg-[#FAF8F4] min-h-screen pt-28 lg:pt-32 pb-24">
      {/* Heading */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 mb-10 lg:mb-14">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3">
          {tx.sections.allListingsSub}
        </p>
        <h1 className="font-display font-light text-4xl lg:text-6xl text-[#14141A]">
          {heading}
        </h1>
      </div>

      {/* Filter bar */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 mb-10">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <form onSubmit={submitSearch} className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6E6E73]" />
            <input
              type="text"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder={locale === "tr" ? "Konum, ilan adı..." : "Location, name..."}
              className="w-full pl-10 pr-4 h-11 bg-white border border-[#E5E2DD] text-sm focus:outline-none focus:border-[#C9A96E]"
            />
          </form>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase border border-[#14141A] px-4 h-11 hover:bg-[#14141A] hover:text-white transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {tx.listing.filters}
              {activeFilters > 0 && (
                <span className="ml-1 bg-[#C9A96E] text-[#14141A] text-[10px] px-1.5 py-0.5">
                  {activeFilters}
                </span>
              )}
            </button>

            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value === "newest" ? null : e.target.value)}
              className="h-11 px-4 bg-white border border-[#E5E2DD] text-xs tracking-[0.15em] uppercase focus:outline-none focus:border-[#C9A96E]"
            >
              <option value="newest">{tx.listing.newest}</option>
              <option value="priceAsc">{tx.listing.priceLow}</option>
              <option value="priceDesc">{tx.listing.priceHigh}</option>
            </select>
          </div>
        </div>

        {filtersOpen && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 p-5 bg-white border border-[#E5E2DD]">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] mb-2 block">
                {tx.listing.type}
              </label>
              <select
                value={type}
                onChange={(e) => setParam("type", e.target.value || null)}
                className="w-full h-10 px-3 bg-white border border-[#E5E2DD] text-sm focus:outline-none focus:border-[#C9A96E]"
              >
                <option value="">—</option>
                <option value="SALE">{tx.listing.forSale}</option>
                <option value="RENT">{tx.listing.forRent}</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] mb-2 block">
                {tx.listing.category}
              </label>
              <select
                value={category}
                onChange={(e) => setParam("category", e.target.value || null)}
                className="w-full h-10 px-3 bg-white border border-[#E5E2DD] text-sm focus:outline-none focus:border-[#C9A96E]"
              >
                <option value="">—</option>
                {Object.entries(CATEGORY_LABEL).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val[locale]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] mb-2 block">
                {tx.listing.city}
              </label>
              <input
                value={city}
                onChange={(e) => setParam("city", e.target.value || null)}
                placeholder="İstanbul, Bodrum..."
                className="w-full h-10 px-3 bg-white border border-[#E5E2DD] text-sm focus:outline-none focus:border-[#C9A96E]"
              />
            </div>

            {activeFilters > 0 && (
              <div className="md:col-span-3 flex justify-end">
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] hover:text-[#14141A]"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} size="large" />
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {data.items.map((l) => (
                <ListingCard key={l.id} listing={l} size="large" />
              ))}
            </div>
            <p className="text-center text-xs tracking-[0.2em] uppercase text-[#6E6E73] mt-12">
              {data.total} {locale === "tr" ? "sonuç" : "results"}
            </p>
          </>
        ) : (
          <div className="py-32 text-center text-sm text-[#6E6E73]">
            {tx.listing.noResults}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="bg-[#FAF8F4] min-h-screen pt-28 lg:pt-32 pb-24 px-6 lg:px-10">
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {Array.from({ length: 6 }).map((_, i) => (
                <ListingCardSkeleton key={i} size="large" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ListingsContent />
    </React.Suspense>
  );
}

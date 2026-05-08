import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hazalmuti.com").replace(/\/$/, "");
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.hazalmuti.com").replace(/\/$/, "");

interface ListingForSitemap {
  slug: string;
  updatedAt: string;
}

interface PaginatedListings {
  items: ListingForSitemap[];
  totalPages: number;
}

async function fetchAllActiveListings(): Promise<ListingForSitemap[]> {
  const all: ListingForSitemap[] = [];
  let page = 1;
  // Cap pages to avoid runaway loops if API is misbehaving
  for (let safety = 0; safety < 50; safety++) {
    try {
      const res = await fetch(
        `${API_URL}/api/listings?status=ACTIVE&page=${page}&pageSize=100`,
        { next: { revalidate: 3600 } },
      );
      if (!res.ok) break;
      const data = (await res.json()) as PaginatedListings;
      if (!Array.isArray(data.items) || data.items.length === 0) break;
      all.push(...data.items);
      if (page >= data.totalPages) break;
      page += 1;
    } catch {
      break;
    }
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/ilanlar`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/hakkimizda`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/iletisim`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/kvkk`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/gizlilik-politikasi`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/kullanim-kosullari`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/cerez-politikasi`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const listings = await fetchAllActiveListings();
  const listingRoutes: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${SITE_URL}/ilanlar/${l.slug}`,
    lastModified: l.updatedAt ? new Date(l.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...listingRoutes];
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Listing, SiteSettings } from "@/lib/types";
import { BrochureView } from "./brochure-view";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hazalmuti.com").replace(/\/$/, "");
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.hazalmuti.com").replace(/\/$/, "");

async function fetchListing(slug: string): Promise<Listing | null> {
  try {
    const res = await fetch(`${API_URL}/api/listings/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return (await res.json()) as Listing;
  } catch {
    return null;
  }
}

async function fetchSettings(): Promise<SiteSettings | null> {
  try {
    const res = await fetch(`${API_URL}/api/settings/public`, { next: { revalidate: 600 } });
    if (!res.ok) return null;
    return (await res.json()) as SiteSettings;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await fetchListing(slug);
  return {
    title: listing
      ? `Brosür · ${listing.titleTr || listing.titleEn}`
      : "Brosür",
    robots: { index: false, follow: false },
  };
}

export default async function BrochurePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [listing, settings] = await Promise.all([fetchListing(slug), fetchSettings()]);

  if (!listing) {
    notFound();
  }

  const url = `${SITE_URL}/ilanlar/${slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    url,
  )}&color=14141A&bgcolor=FFFFFF`;

  return <BrochureView listing={listing} settings={settings} listingUrl={url} qrUrl={qrUrl} />;
}

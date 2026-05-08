import type { Metadata } from "next";
import type { Listing } from "@/lib/types";
import ListingDetailView from "./listing-detail-view";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hazalmuti.com").replace(/\/$/, "");
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.hazalmuti.com").replace(/\/$/, "");

async function fetchListing(slug: string): Promise<Listing | null> {
  try {
    const res = await fetch(`${API_URL}/api/listings/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as Listing;
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

  if (!listing) {
    return {
      title: "İlan bulunamadı",
      robots: { index: false, follow: false },
    };
  }

  const title = listing.titleTr || listing.titleEn;
  const description =
    (listing.descriptionTr || listing.descriptionEn || "").slice(0, 160) ||
    `${listing.district ?? listing.city ?? ""} · Hazal Muti portföyünde lüks gayrimenkul`;
  const cover =
    listing.images?.find((i) => i.isPrimary)?.url ?? listing.images?.[0]?.url;
  const url = `${SITE_URL}/ilanlar/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "Hazal Muti",
      images: cover ? [{ url: cover, width: 1200, height: 800, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

function buildJsonLd(listing: Listing | null, slug: string) {
  if (!listing) return null;
  const url = `${SITE_URL}/ilanlar/${slug}`;
  const cover = listing.images?.find((i) => i.isPrimary)?.url ?? listing.images?.[0]?.url;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.titleTr || listing.titleEn,
    description: (listing.descriptionTr || listing.descriptionEn || "").slice(0, 500),
    url,
    image: cover ? [cover] : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.district ?? undefined,
      addressRegion: listing.city ?? undefined,
      addressCountry: "TR",
    },
    offers: listing.price
      ? {
          "@type": "Offer",
          price: Number(listing.price),
          priceCurrency: listing.currency,
          availability: "https://schema.org/InStock",
        }
      : undefined,
    numberOfRooms: listing.bedrooms ?? undefined,
    numberOfBathroomsTotal: listing.bathrooms ?? undefined,
    floorSize: listing.areaM2
      ? { "@type": "QuantitativeValue", value: listing.areaM2, unitCode: "MTK" }
      : undefined,
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await fetchListing(slug);
  const jsonLd = buildJsonLd(listing, slug);
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ListingDetailView slug={slug} initialListing={listing} />
    </>
  );
}

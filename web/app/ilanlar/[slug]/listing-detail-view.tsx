"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Bed, Bath, Maximize2, MapPin, Calendar, Eye, ChevronLeft, ChevronRight, Box, Play, X, FileDown } from "lucide-react";
import { api } from "@/lib/api";
import { useLocale, t, CATEGORY_LABEL } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import type { Listing } from "@/lib/types";
import { InquiryForm } from "@/components/site/inquiry-form";
import { ListingMap } from "@/components/site/listing-map";

export default function ListingDetailView({
  slug,
  initialListing,
}: {
  slug: string;
  initialListing: Listing | null;
}) {
  const [locale] = useLocale();
  const tx = t[locale];

  const [listing, setListing] = React.useState<Listing | null>(initialListing);
  const [loading, setLoading] = React.useState(!initialListing);
  const [activeImg, setActiveImg] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);
  const [tourOpen, setTourOpen] = React.useState(false);
  const [videoOpen, setVideoOpen] = React.useState(false);

  React.useEffect(() => {
    // If we already have server-rendered data, skip refetch
    if (initialListing) return;
    if (!slug) return;
    setLoading(true);
    api<Listing>(`/api/listings/${slug}`, { auth: false })
      .then((l) => {
        setListing(l);
        setActiveImg(0);
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [slug, initialListing]);

  if (loading) {
    return (
      <div className="bg-[#FAF8F4] min-h-screen pt-28 lg:pt-32 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          <div className="aspect-[16/10] bg-[#F0EDE6] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="bg-[#FAF8F4] min-h-screen pt-28 lg:pt-32 px-6 lg:px-10 text-center py-32">
        <p className="text-[#6E6E73]">{tx.listing.noResults}</p>
        <Link href="/ilanlar" className="inline-flex items-center gap-2 mt-6 text-xs tracking-[0.3em] uppercase text-[#C9A96E]">
          <ArrowLeft className="h-3.5 w-3.5" /> {tx.listing.backToList}
        </Link>
      </div>
    );
  }

  const title = locale === "tr" ? listing.titleTr : listing.titleEn;
  const description = locale === "tr" ? listing.descriptionTr : listing.descriptionEn;
  const cityLine = [listing.district, listing.city].filter(Boolean).join(", ");
  const images = listing.images.length > 0 ? listing.images : null;

  function nextImg() {
    if (!images) return;
    setActiveImg((i) => (i + 1) % images.length);
  }
  function prevImg() {
    if (!images) return;
    setActiveImg((i) => (i - 1 + images.length) % images.length);
  }

  return (
    <div className="bg-[#FAF8F4] min-h-screen">
      {/* Hero gallery */}
      <section className="relative bg-[#0E0E0E] pt-16 lg:pt-20">
        <div className="relative aspect-[16/10] lg:aspect-[16/9] max-h-[90vh] w-full bg-[#1A1A1F] overflow-hidden">
          {images ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[activeImg].url}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
                onClick={() => setLightbox(true)}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 backdrop-blur transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 backdrop-blur transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 bg-black/60 backdrop-blur text-white text-xs tracking-[0.2em] uppercase px-3 py-1.5">
                {activeImg + 1} / {images.length}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">
              No image
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images && images.length > 1 && (
          <div className="bg-[#0E0E0E] py-4 px-4 lg:px-8 overflow-x-auto">
            <div className="flex gap-2 max-w-[1600px] mx-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(i)}
                  className={`relative shrink-0 w-20 h-14 lg:w-24 lg:h-16 overflow-hidden border-2 transition-all ${
                    i === activeImg ? "border-[#C9A96E]" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Content */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <Link
          href="/ilanlar"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] hover:text-[#C9A96E] mb-8"
        >
          <ArrowLeft className="h-3 w-3" /> {tx.listing.backToList}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main info */}
          <div className="lg:col-span-7 xl:col-span-8">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3">
              {CATEGORY_LABEL[listing.category]?.[locale] ?? listing.category} ·{" "}
              {listing.type === "SALE" ? tx.listing.forSale : tx.listing.forRent}
            </p>
            <h1 className="font-display font-light text-4xl lg:text-6xl text-[#14141A] leading-[1.05] mb-4">
              {title}
            </h1>
            {cityLine && (
              <p className="flex items-center gap-2 text-[#6E6E73] mb-8">
                <MapPin className="h-4 w-4" /> {cityLine}
              </p>
            )}

            <p className="text-3xl lg:text-4xl font-light text-[#14141A] mb-10">
              {listing.price ? formatCurrency(listing.price, listing.currency) : tx.listing.priceOnRequest}
            </p>

            {/* Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-[#E5E2DD] mb-10">
              {listing.bedrooms != null && (
                <Spec icon={<Bed />} label={tx.listing.bedrooms} value={listing.bedrooms.toString()} />
              )}
              {listing.bathrooms != null && (
                <Spec icon={<Bath />} label={tx.listing.bathrooms} value={listing.bathrooms.toString()} />
              )}
              {listing.areaM2 != null && (
                <Spec icon={<Maximize2 />} label={tx.listing.area} value={listing.areaM2.toString()} />
              )}
              {listing.yearBuilt != null && (
                <Spec icon={<Calendar />} label={tx.listing.yearBuilt} value={listing.yearBuilt.toString()} />
              )}
            </div>

            {/* Description */}
            {description && (
              <div className="mb-10">
                <h2 className="font-display text-2xl text-[#14141A] mb-4">{tx.listing.description}</h2>
                <p className="text-[#14141A]/85 leading-relaxed whitespace-pre-line text-base">
                  {description}
                </p>
              </div>
            )}

            {/* Tour / video — açılır lightbox */}
            {(listing.tourUrl || listing.videoUrl) && (
              <div className="flex flex-wrap gap-3 mb-10">
                {listing.tourUrl && (
                  <button
                    type="button"
                    onClick={() => setTourOpen(true)}
                    className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase bg-[#C9A96E] text-[#14141A] hover:bg-[#14141A] hover:text-white px-5 py-3 transition-colors group"
                  >
                    <Box className="h-4 w-4" />
                    {tx.listing.virtualTour}
                  </button>
                )}
                {listing.videoUrl && (
                  <button
                    type="button"
                    onClick={() => setVideoOpen(true)}
                    className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase border border-[#14141A] px-5 py-3 hover:bg-[#14141A] hover:text-white transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    {tx.listing.video}
                  </button>
                )}
              </div>
            )}

            {/* Address */}
            {listing.address && (
              <div className="mb-10">
                <h2 className="font-display text-2xl text-[#14141A] mb-3">{tx.listing.address}</h2>
                <p className="text-[#14141A]/85">{listing.address}</p>
              </div>
            )}

            {/* Map */}
            {listing.lat != null && listing.lng != null && (
              <div className="mb-10">
                <h2 className="font-display text-2xl text-[#14141A] mb-3">
                  {locale === "tr" ? "Konum" : "Location"}
                </h2>
                <ListingMap
                  lat={listing.lat}
                  lng={listing.lng}
                  title={cityLine || (locale === "tr" ? listing.titleTr : listing.titleEn)}
                />
              </div>
            )}

            <p className="flex items-center gap-2 text-xs text-[#6E6E73]">
              <Eye className="h-3.5 w-3.5" /> {listing.views} {locale === "tr" ? "görüntülenme" : "views"}
            </p>
          </div>

          {/* Sticky inquiry */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-3">
              <InquiryForm listingId={listing.id} variant="page" />
              <Link
                href={`/brochure/${listing.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-white border border-[#E5E2DD] hover:border-[#C9A96E] hover:text-[#C9A96E] text-[#14141A] px-5 py-3 text-xs tracking-[0.3em] uppercase transition-colors"
              >
                <FileDown className="h-3.5 w-3.5" />
                {locale === "tr" ? "Broşürü İndir (PDF)" : "Download Brochure (PDF)"}
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && images && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-6 right-6 text-white text-sm tracking-[0.3em] uppercase"
            onClick={() => setLightbox(false)}
          >
            ✕ Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeImg].url}
            alt=""
            className="max-h-[90vh] max-w-[95vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImg();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImg();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Virtual tour lightbox */}
      {tourOpen && listing.tourUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setTourOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white text-sm tracking-[0.3em] uppercase z-10 inline-flex items-center gap-2 hover:text-[#C9A96E]"
            onClick={() => setTourOpen(false)}
          >
            <X className="h-5 w-5" /> Kapat
          </button>
          <div
            className="w-full max-w-7xl aspect-video bg-black rounded overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={listing.tourUrl}
              className="w-full h-full border-0"
              allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
              allowFullScreen
              title="Virtual tour"
            />
          </div>
        </div>
      )}

      {/* Video lightbox */}
      {videoOpen && listing.videoUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setVideoOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white text-sm tracking-[0.3em] uppercase z-10 inline-flex items-center gap-2 hover:text-[#C9A96E]"
            onClick={() => setVideoOpen(false)}
          >
            <X className="h-5 w-5" /> Kapat
          </button>
          <div
            className="w-full max-w-7xl aspect-video bg-black rounded overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/youtube\.com|youtu\.be|vimeo\.com/i.test(listing.videoUrl) ? (
              <iframe
                src={
                  listing.videoUrl
                    .replace("youtu.be/", "youtube.com/embed/")
                    .replace("watch?v=", "embed/")
                }
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title="Video"
              />
            ) : (
              <video
                src={listing.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[#C9A96E] mb-2 [&>svg]:h-4 [&>svg]:w-4">{icon}</div>
      <p className="text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] mb-1">{label}</p>
      <p className="text-2xl font-light text-[#14141A]">{value}</p>
    </div>
  );
}

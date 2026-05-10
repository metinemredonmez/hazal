"use client";

import * as React from "react";
import Link from "next/link";
import { Bed, Bath, Maximize2, MapPin, Calendar, Phone, Mail, Printer, ArrowLeft } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import type { Listing, SiteSettings } from "@/lib/types";

export function BrochureView({
  listing,
  settings,
  listingUrl,
  qrUrl,
}: {
  listing: Listing;
  settings: SiteSettings | null;
  listingUrl: string;
  qrUrl: string;
}) {
  const [locale] = useLocale();
  const title = locale === "tr" ? listing.titleTr : listing.titleEn;
  const description = locale === "tr" ? listing.descriptionTr : listing.descriptionEn;
  const cityLine = [listing.district, listing.city].filter(Boolean).join(", ");
  const cover = listing.images?.find((i) => i.isPrimary)?.url ?? listing.images?.[0]?.url;
  const otherImages = (listing.images ?? []).filter((i) => i.url !== cover).slice(0, 6);
  const brand = settings?.brandName ?? "Hazal Muti";

  return (
    <>
      {/* Print-only styles */}
      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .brochure-page {
            page-break-after: always;
            min-height: 297mm;
          }
          .brochure-page:last-child {
            page-break-after: auto;
          }
        }
      `}</style>

      {/* Action bar (screen-only) */}
      <div className="no-print fixed top-4 left-4 right-4 z-50 flex items-center justify-between gap-2 max-w-5xl mx-auto">
        <Link
          href={`/ilanlar/${listing.slug}`}
          className="inline-flex items-center gap-1.5 bg-white border border-[#E5E2DD] hover:border-[#D4B36A] text-[#14141A] px-4 py-2.5 text-xs tracking-[0.2em] uppercase shadow"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {locale === "tr" ? "İlana dön" : "Back to listing"}
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-[#14141A] text-white hover:bg-[#D4B36A] px-5 py-2.5 text-xs tracking-[0.2em] uppercase shadow"
        >
          <Printer className="h-3.5 w-3.5" />
          {locale === "tr" ? "PDF Olarak Yazdır" : "Print as PDF"}
        </button>
      </div>

      <div className="bg-[#FAF8F4] min-h-screen pt-20 pb-10 print:pt-0 print:pb-0">
        {/* Page 1: Cover */}
        <div
          className="brochure-page bg-white max-w-[210mm] mx-auto shadow-lg print:shadow-none flex flex-col overflow-hidden"
          style={{ minHeight: "297mm" }}
        >
          {/* Cover image — full width */}
          <div className="relative h-[160mm] bg-[#1A1A1F]">
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={title} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Brand on top */}
            <div className="absolute top-8 left-8">
              <p className="font-display text-2xl tracking-[0.2em] uppercase text-white">
                HAZAL <span className="italic font-light text-[#D4B36A]">MUTİ</span>
              </p>
              <p className="text-[9px] tracking-[0.4em] uppercase text-[#D4B36A] mt-1">
                Real Estate · İstanbul
              </p>
            </div>

            {/* Title at bottom */}
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-[9px] tracking-[0.4em] uppercase text-[#D4B36A] mb-2">
                {listing.type === "SALE"
                  ? locale === "tr"
                    ? "Satılık"
                    : "For Sale"
                  : locale === "tr"
                    ? "Kiralık"
                    : "For Rent"}
              </p>
              <h1 className="font-display text-4xl text-white leading-tight">{title}</h1>
              {cityLine && (
                <p className="flex items-center gap-2 text-white/80 text-sm mt-2">
                  <MapPin className="h-3.5 w-3.5" /> {cityLine}
                </p>
              )}
            </div>
          </div>

          {/* Below cover: price + key specs */}
          <div className="px-10 py-8 flex-1 flex flex-col">
            <div className="flex items-end justify-between mb-6 pb-6 border-b border-[#E5E2DD]">
              <div>
                <p className="text-[9px] tracking-[0.4em] uppercase text-[#6E6E73] mb-1">
                  {locale === "tr" ? "Fiyat" : "Price"}
                </p>
                <p className="font-display text-3xl text-[#14141A]">
                  {listing.price
                    ? formatCurrency(listing.price, listing.currency)
                    : locale === "tr"
                      ? "Talep üzerine"
                      : "On request"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] tracking-[0.4em] uppercase text-[#6E6E73]">
                  {locale === "tr" ? "Referans" : "Reference"}
                </p>
                <p className="font-mono text-xs text-[#14141A] mt-1">
                  HM-{listing.id.slice(0, 6).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <Spec
                icon={<Bed />}
                label={locale === "tr" ? "Yatak Odası" : "Bedrooms"}
                value={listing.bedrooms?.toString() ?? "—"}
              />
              <Spec
                icon={<Bath />}
                label={locale === "tr" ? "Banyo" : "Bathrooms"}
                value={listing.bathrooms?.toString() ?? "—"}
              />
              <Spec
                icon={<Maximize2 />}
                label={locale === "tr" ? "Alan" : "Area"}
                value={listing.areaM2 ? `${listing.areaM2} m²` : "—"}
              />
              <Spec
                icon={<Calendar />}
                label={locale === "tr" ? "Yıl" : "Year"}
                value={listing.yearBuilt?.toString() ?? "—"}
              />
            </div>

            {description && (
              <div className="text-[#14141A]/85 text-sm leading-relaxed flex-1 whitespace-pre-line">
                {description.slice(0, 700)}
                {description.length > 700 && "…"}
              </div>
            )}

            {/* Footer: contact + QR */}
            <div className="mt-8 pt-6 border-t border-[#E5E2DD] flex items-center justify-between">
              <div className="space-y-1.5 text-xs text-[#14141A]">
                {settings?.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#D4B36A]" /> {settings.phone}
                  </p>
                )}
                {settings?.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-[#D4B36A]" /> {settings.email}
                  </p>
                )}
                <p className="text-[10px] text-[#6E6E73] mt-2">{listingUrl}</p>
              </div>
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="QR" className="w-24 h-24" />
                <p className="text-[9px] tracking-wider uppercase text-[#6E6E73] mt-1">
                  {locale === "tr" ? "Detay için tara" : "Scan for details"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page 2: Photos + extra info */}
        {(otherImages.length > 0 || listing.address) && (
          <div
            className="brochure-page bg-white max-w-[210mm] mx-auto mt-6 shadow-lg print:shadow-none print:mt-0 px-10 py-10 flex flex-col"
            style={{ minHeight: "297mm" }}
          >
            <div className="mb-6">
              <p className="text-[9px] tracking-[0.4em] uppercase text-[#D4B36A] mb-1">{brand}</p>
              <h2 className="font-display text-2xl text-[#14141A]">
                {locale === "tr" ? "Galeri" : "Gallery"}
              </h2>
            </div>

            {otherImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-8">
                {otherImages.map((img) => (
                  <div key={img.id} className="aspect-[4/3] bg-[#1A1A1F] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {listing.address && (
              <div className="mt-auto pt-6 border-t border-[#E5E2DD]">
                <p className="text-[9px] tracking-[0.4em] uppercase text-[#D4B36A] mb-2">
                  {locale === "tr" ? "Adres" : "Address"}
                </p>
                <p className="text-sm text-[#14141A]">{listing.address}</p>
              </div>
            )}

            {/* Footer note */}
            <div className="mt-8 pt-4 border-t border-[#E5E2DD] flex items-center justify-between text-[10px] text-[#6E6E73]">
              <span>{brand}</span>
              <span>{listingUrl}</span>
              <span>HM-{listing.id.slice(0, 6).toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>
    </>
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
    <div className="border border-[#E5E2DD] p-3">
      <div className="text-[#D4B36A] mb-1.5 [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</div>
      <p className="text-[9px] tracking-[0.3em] uppercase text-[#6E6E73] mb-0.5">{label}</p>
      <p className="text-base font-light text-[#14141A]">{value}</p>
    </div>
  );
}

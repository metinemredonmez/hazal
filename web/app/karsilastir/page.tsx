"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  X,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  MapPin,
  Building2,
  Phone,
  Mail,
} from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { useSettings } from "@/lib/use-settings";
import { api } from "@/lib/api";
import type { Listing } from "@/lib/types";

export default function KarsilastirPage() {
  return (
    <Suspense fallback={<KarsilastirLoading />}>
      <KarsilastirContent />
    </Suspense>
  );
}

function KarsilastirLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] py-24 px-6 text-center text-sm text-muted-foreground">
      Yükleniyor...
    </div>
  );
}

function KarsilastirContent() {
  const search = useSearchParams();
  const router = useRouter();
  const [locale] = useLocale();
  const settings = useSettings();
  const idsParam = search.get("ids") ?? "";
  const slugs = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (slugs.length === 0) {
      setLoading(false);
      setListings([]);
      return;
    }
    setLoading(true);
    Promise.all(
      slugs.map((slug) =>
        api<Listing>(`/api/listings/${slug}`, { auth: false }).catch(
          () => null,
        ),
      ),
    )
      .then((results) => {
        setListings(results.filter((l): l is Listing => l !== null));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsParam]);

  function removeListing(slug: string) {
    const next = slugs.filter((s) => s !== slug);
    if (next.length === 0) {
      router.push("/ilanlar");
    } else {
      router.replace(`/karsilastir?ids=${next.join(",")}`);
    }
  }

  if (slugs.length === 0) {
    return <EmptyState />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] py-24 px-6 text-center text-sm text-muted-foreground">
        Karşılaştırma yükleniyor...
      </div>
    );
  }

  if (listings.length === 0) {
    return <EmptyState />;
  }

  const tx = {
    tr: {
      title: "İlan Karşılaştırma",
      subtitle: "Seçtiğiniz ilanları yan yana karşılaştırın",
      back: "Tüm ilanlara dön",
      price: "Fiyat",
      type: "Tür",
      category: "Kategori",
      bedrooms: "Yatak Odası",
      bathrooms: "Banyo",
      area: "Alan",
      year: "Yapım Yılı",
      location: "Konum",
      description: "Açıklama",
      contactCTA: "İlgileniyorum",
      sale: "Satılık",
      rent: "Kiralık",
      remove: "Çıkar",
    },
    en: {
      title: "Listing Comparison",
      subtitle: "Compare your selected listings side-by-side",
      back: "Back to all listings",
      price: "Price",
      type: "Type",
      category: "Category",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      area: "Area",
      year: "Year Built",
      location: "Location",
      description: "Description",
      contactCTA: "I'm Interested",
      sale: "For Sale",
      rent: "For Rent",
      remove: "Remove",
    },
  }[locale];

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Hero */}
      <section className="bg-[#0E0E0E] text-[#F5F2EC] pt-32 lg:pt-40 pb-16 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          <Link
            href="/ilanlar"
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] hover:text-[#F5F2EC] mb-6"
          >
            <ArrowLeft className="h-3 w-3" />
            {tx.back}
          </Link>
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-3">
            {tx.subtitle}
          </p>
          <h1 className="font-display font-light text-4xl lg:text-6xl">
            {tx.title}
          </h1>
        </div>
      </section>

      {/* Comparison Grid */}
      <section className="py-12 lg:py-16 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto overflow-x-auto">
          <div
            className="grid gap-4 min-w-fit"
            style={{
              gridTemplateColumns: `180px repeat(${listings.length}, minmax(280px, 1fr))`,
            }}
          >
            {/* Header column */}
            <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground pt-32" />

            {/* Listing photo + title cards */}
            {listings.map((l) => {
              const cover = l.images?.find((i) => i.isPrimary)?.url ?? l.images?.[0]?.url;
              const title = locale === "tr" ? l.titleTr : l.titleEn;
              return (
                <div
                  key={l.id}
                  className="bg-white rounded-md overflow-hidden border border-border relative"
                >
                  <button
                    onClick={() => removeListing(l.slug)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-foreground/60"
                    title={tx.remove}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <Link href={`/ilanlar/${l.slug}`}>
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt={title}
                        className="w-full h-44 object-cover"
                      />
                    ) : (
                      <div className="w-full h-44 bg-muted flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </Link>
                  <div className="p-3">
                    <Link
                      href={`/ilanlar/${l.slug}`}
                      className="text-sm font-medium leading-tight line-clamp-2 hover:text-[#D4B36A]"
                    >
                      {title}
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Price row */}
            <RowLabel>{tx.price}</RowLabel>
            {listings.map((l) => (
              <Cell key={l.id}>
                <p className="font-display text-2xl text-[#D4B36A]">
                  {Number(l.price).toLocaleString("tr-TR")} {l.currency}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  {l.type === "SALE" ? tx.sale : tx.rent}
                </p>
              </Cell>
            ))}

            {/* Location */}
            <RowLabel>
              <MapPin className="h-3 w-3 inline mr-1" />
              {tx.location}
            </RowLabel>
            {listings.map((l) => (
              <Cell key={l.id}>
                <p className="text-sm">
                  {[l.district, l.city].filter(Boolean).join(", ") || "—"}
                </p>
                {l.address && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {l.address}
                  </p>
                )}
              </Cell>
            ))}

            {/* Bedrooms */}
            <RowLabel>
              <Bed className="h-3 w-3 inline mr-1" />
              {tx.bedrooms}
            </RowLabel>
            {listings.map((l) => (
              <Cell key={l.id}>
                <p className="text-sm">{l.bedrooms ?? "—"}</p>
              </Cell>
            ))}

            {/* Bathrooms */}
            <RowLabel>
              <Bath className="h-3 w-3 inline mr-1" />
              {tx.bathrooms}
            </RowLabel>
            {listings.map((l) => (
              <Cell key={l.id}>
                <p className="text-sm">{l.bathrooms ?? "—"}</p>
              </Cell>
            ))}

            {/* Area */}
            <RowLabel>
              <Maximize2 className="h-3 w-3 inline mr-1" />
              {tx.area}
            </RowLabel>
            {listings.map((l) => (
              <Cell key={l.id}>
                <p className="text-sm">
                  {l.areaM2 ? `${l.areaM2} m²` : "—"}
                </p>
              </Cell>
            ))}

            {/* Year */}
            <RowLabel>
              <Calendar className="h-3 w-3 inline mr-1" />
              {tx.year}
            </RowLabel>
            {listings.map((l) => (
              <Cell key={l.id}>
                <p className="text-sm">{l.yearBuilt ?? "—"}</p>
              </Cell>
            ))}

            {/* Category */}
            <RowLabel>{tx.category}</RowLabel>
            {listings.map((l) => (
              <Cell key={l.id}>
                <p className="text-xs uppercase tracking-wider">{l.category}</p>
              </Cell>
            ))}

            {/* Description */}
            <RowLabel>{tx.description}</RowLabel>
            {listings.map((l) => (
              <Cell key={l.id}>
                <p className="text-xs text-muted-foreground line-clamp-6 leading-relaxed">
                  {locale === "tr" ? l.descriptionTr : l.descriptionEn}
                </p>
              </Cell>
            ))}

            {/* CTA buttons */}
            <RowLabel></RowLabel>
            {listings.map((l) => (
              <Cell key={l.id} className="!py-3 space-y-1.5">
                <Link
                  href={`/ilanlar/${l.slug}`}
                  className="block w-full text-center text-xs px-3 py-2 bg-[#14141A] text-white rounded hover:bg-[#D4B36A] transition-colors"
                >
                  {tx.contactCTA}
                </Link>
                {settings?.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="block w-full text-center text-[11px] px-3 py-1.5 border border-border rounded hover:border-[#D4B36A]"
                  >
                    <Phone className="h-3 w-3 inline mr-1" />
                    {settings.phone}
                  </a>
                )}
              </Cell>
            ))}
          </div>

          {/* Single global contact CTA at bottom */}
          {settings && (
            <div className="mt-12 bg-[#0E0E0E] text-[#F5F2EC] p-8 lg:p-12 rounded-md text-center">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-3">
                {locale === "tr" ? "Karar veremiyor musunuz?" : "Can't decide?"}
              </p>
              <h2 className="font-display text-3xl lg:text-4xl font-light mb-4">
                {locale === "tr"
                  ? "Hazal Muti ile birlikte değerlendirelim"
                  : "Let's evaluate together with Hazal Muti"}
              </h2>
              <p className="text-sm text-[#F5F2EC]/70 max-w-2xl mx-auto mb-6">
                {locale === "tr"
                  ? "Yer gösterimi ve detaylı portföy görüşmesi için iletişime geçin."
                  : "Contact us for a viewing and detailed portfolio consultation."}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {settings.whatsapp && (
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#25D366] text-white rounded text-sm font-medium hover:opacity-90"
                  >
                    💬 WhatsApp
                  </a>
                )}
                {settings.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#D4B36A] text-[#14141A] rounded text-sm font-medium hover:opacity-90"
                  >
                    <Phone className="h-4 w-4" />
                    {settings.phone}
                  </a>
                )}
                <Link
                  href="/iletisim"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-transparent border border-[#D4B36A]/40 text-[#F5F2EC] rounded text-sm font-medium hover:border-[#D4B36A]"
                >
                  <Mail className="h-4 w-4" />
                  {locale === "tr" ? "Mesaj Yaz" : "Send Message"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function RowLabel({ children }: { children?: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-md px-3 py-3 text-[10px] tracking-[0.3em] uppercase text-muted-foreground self-center">
      {children}
    </div>
  );
}

function Cell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-border rounded-md px-3 py-3 ${className}`}
    >
      {children}
    </div>
  );
}

function EmptyState() {
  const [locale] = useLocale();
  return (
    <div className="min-h-screen bg-[#FAF8F4] py-24 px-6">
      <div className="max-w-md mx-auto text-center">
        <Building2 className="h-12 w-12 mx-auto opacity-30 mb-4" />
        <h1 className="font-display text-2xl mb-2">
          {locale === "tr"
            ? "Karşılaştırılacak ilan yok"
            : "No listings to compare"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {locale === "tr"
            ? "İlanlar sayfasında ilgilendiğin ilanları seç ve karşılaştır."
            : "Browse listings and select the ones you want to compare."}
        </p>
        <Link
          href="/ilanlar"
          className="inline-block px-5 py-3 bg-[#14141A] text-white rounded text-sm hover:bg-[#D4B36A]"
        >
          {locale === "tr" ? "İlanlara Git" : "Browse Listings"}
        </Link>
      </div>
    </div>
  );
}

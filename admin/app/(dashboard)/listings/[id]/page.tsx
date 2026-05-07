"use client";

import * as React from "react";
import { use } from "react";
import { Topbar } from "@/components/admin/topbar";
import { ListingForm } from "@/components/admin/listing-form";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Listing } from "@/lib/types";

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [listing, setListing] = React.useState<Listing | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api<Listing>(`/api/admin/listings/${id}`)
      .then(setListing)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <Topbar
        title={loading ? "Yükleniyor..." : listing?.titleTr ?? "İlan"}
        description="İlanı düzenle"
      />
      <main className="flex-1 px-6 py-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : listing ? (
          <ListingForm existing={listing} />
        ) : (
          <p className="text-center text-muted-foreground py-12">İlan bulunamadı.</p>
        )}
      </main>
    </>
  );
}

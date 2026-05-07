"use client";

import { Topbar } from "@/components/admin/topbar";
import { ListingForm } from "@/components/admin/listing-form";

export default function NewListingPage() {
  return (
    <>
      <Topbar title="Yeni İlan" description="Premium gayrimenkul ilanı ekle" />
      <main className="flex-1 px-6 py-8">
        <ListingForm />
      </main>
    </>
  );
}

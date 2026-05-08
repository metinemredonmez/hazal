import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İlanlar",
  description:
    "Hazal Muti'nin İstanbul lüks gayrimenkul portföyü — Bebek, Etiler, Cihangir, Bodrum'da satılık ve kiralık daireler ve villalar.",
  alternates: { canonical: "/ilanlar" },
  openGraph: {
    title: "İlanlar · Hazal Muti",
    description: "Bebek, Etiler, Cihangir, Bodrum — satılık ve kiralık lüks portföy.",
    url: "/ilanlar",
    type: "website",
  },
};

export default function IlanlarLayout({ children }: { children: React.ReactNode }) {
  return children;
}

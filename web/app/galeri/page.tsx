import type { Metadata } from "next";
import { GaleriContent } from "./galeri-content";

export const metadata: Metadata = {
  title: "Galeri · Örnek Daireler / Gallery · Sample Apartments",
  description:
    "Hazal Muti portföyünden iç mekan ve detay fotoğrafları. / Selected interior and detail shots from the portfolio.",
  alternates: { canonical: "/galeri" },
  openGraph: {
    title: "Galeri · Hazal Muti",
    description: "Portföyden iç mekan ve detay fotoğrafları.",
    url: "/galeri",
    type: "website",
  },
};

export default function GaleriPage() {
  return <GaleriContent />;
}

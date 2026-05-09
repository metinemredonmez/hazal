import type { Metadata } from "next";
import { SampleApartments } from "@/components/site/sample-apartments";

export const metadata: Metadata = {
  title: "Galeri · Örnek Daireler",
  description: "Hazal Muti portföyünden iç mekan ve detay fotoğrafları.",
  alternates: { canonical: "/galeri" },
  openGraph: {
    title: "Galeri · Hazal Muti",
    description: "Portföyden iç mekan ve detay fotoğrafları.",
    url: "/galeri",
    type: "website",
  },
};

export default function GaleriPage() {
  return (
    <div className="bg-[#FAF8F4] min-h-screen pt-28 lg:pt-32 pb-0">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-4">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3">
          Galeri
        </p>
        <h1 className="font-display font-light text-4xl lg:text-6xl text-[#14141A]">
          Örnek Daireler
        </h1>
        <p className="mt-4 text-base text-[#6E6E73] max-w-xl">
          Portföyden seçili iç mekan ve detay fotoğrafları. Tıklayarak büyütüp
          inceleyebilirsiniz.
        </p>
      </div>

      <SampleApartments />
    </div>
  );
}

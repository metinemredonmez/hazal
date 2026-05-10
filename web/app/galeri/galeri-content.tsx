"use client";

import { useLocale } from "@/lib/i18n";
import { SampleApartments } from "@/components/site/sample-apartments";

export function GaleriContent() {
  const [locale] = useLocale();
  return (
    <div className="bg-[#FAF8F4] min-h-screen pt-28 lg:pt-32 pb-0">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-4">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3">
          {locale === "tr" ? "Galeri" : "Gallery"}
        </p>
        <h1 className="font-display font-light text-4xl lg:text-6xl text-[#14141A]">
          {locale === "tr" ? "Örnek Daireler" : "Sample Apartments"}
        </h1>
        <p className="mt-4 text-base text-[#6E6E73] max-w-xl">
          {locale === "tr"
            ? "Portföyden seçili iç mekan ve detay fotoğrafları. Tıklayarak büyütüp inceleyebilirsiniz."
            : "Selected interior and detail shots from the portfolio. Click any image to enlarge."}
        </p>
      </div>

      <SampleApartments />
    </div>
  );
}

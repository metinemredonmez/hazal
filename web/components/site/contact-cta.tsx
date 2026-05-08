"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale, t } from "@/lib/i18n";

export function ContactCTA() {
  const [locale] = useLocale();
  const tx = t[locale];

  return (
    <section className="bg-[#FAF8F4] py-24 lg:py-32 px-6 lg:px-10 border-t border-[#E5E2DD]">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-5">
          {tx.contact.heading}
        </p>
        <h2 className="font-display font-light text-4xl lg:text-6xl text-[#14141A] leading-tight mb-6">
          {locale === "tr" ? (
            <>
              Sıradaki ev,
              <br />
              <span className="italic text-[#C9A96E]">birlikte bulunur.</span>
            </>
          ) : (
            <>
              Your next home,
              <br />
              <span className="italic text-[#C9A96E]">found together.</span>
            </>
          )}
        </h2>
        <p className="text-base text-[#6E6E73] max-w-xl mx-auto mb-10">
          {tx.contact.sub}
        </p>
        <Link
          href="/iletisim"
          className="inline-flex items-center gap-3 text-xs tracking-[0.4em] uppercase border border-[#14141A] text-[#14141A] hover:bg-[#14141A] hover:text-[#F5F2EC] px-10 py-4 transition-all group"
        >
          {tx.sections.contactCta}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

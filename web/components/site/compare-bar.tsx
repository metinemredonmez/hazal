"use client";

import * as React from "react";
import Link from "next/link";
import { GitCompare, X, ArrowRight } from "lucide-react";
import { useCompare } from "@/lib/favorites";
import { useLocale } from "@/lib/i18n";

export function CompareBar() {
  const cmp = useCompare();
  const [locale] = useLocale();

  if (cmp.count === 0) return null;

  const url = `/karsilastir?ids=${cmp.compare.join(",")}`;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-2rem)]">
      <div className="bg-[#14141A] text-[#F5F2EC] rounded-full shadow-2xl flex items-center gap-3 pl-5 pr-2 py-2 border border-[#C9A96E]/30">
        <GitCompare className="h-4 w-4 text-[#C9A96E] shrink-0" />
        <span className="text-xs tracking-wider">
          <strong className="text-[#C9A96E]">{cmp.count}</strong>
          <span className="text-[#F5F2EC]/70">/{cmp.max}</span>{" "}
          {locale === "tr" ? "seçili" : "selected"}
        </span>
        <Link
          href={url}
          className="inline-flex items-center gap-1.5 bg-[#C9A96E] text-[#14141A] hover:bg-[#b8965e] px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-colors"
        >
          {locale === "tr" ? "Karşılaştır" : "Compare"}
          <ArrowRight className="h-3 w-3" />
        </Link>
        <button
          onClick={cmp.clear}
          aria-label={locale === "tr" ? "Temizle" : "Clear"}
          className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-[#F5F2EC]/60 hover:text-[#F5F2EC] transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

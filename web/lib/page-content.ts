import type { BilingualText, PageContent, SiteSettings } from "./types";
import type { Locale } from "./i18n";

/**
 * Pick a TR/EN value from a BilingualText, falling back to the other language
 * if the requested one is empty, and finally to a hardcoded default.
 */
export function pick(bi: BilingualText | undefined, locale: Locale, fallback: string): string {
  if (!bi) return fallback;
  const primary = bi[locale]?.trim();
  if (primary) return primary;
  const other = locale === "tr" ? bi.en : bi.tr;
  return other?.trim() || fallback;
}

/** Convenience: pull pageContent off settings safely. */
export function pageContent(settings: SiteSettings | null | undefined): PageContent {
  return (settings?.pageContent as PageContent | null) ?? {};
}

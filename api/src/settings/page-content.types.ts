/**
 * Editable copy for the public-facing site, organized by page.
 * All fields TR + EN. Stored in SiteSettings.pageContent (JSONB).
 *
 * Components on the web side fall back to a hardcoded English/Turkish
 * default when a field is empty, so partial fills are safe.
 */

export interface BilingualText {
  tr: string;
  en: string;
}

export interface PageContent {
  home?: {
    heroEyebrow?: BilingualText;        // small line above hero title
    heroCtaLabel?: BilingualText;       // hero button text
    featuredTitle?: BilingualText;      // "Featured listings" section heading
    featuredSubtitle?: BilingualText;
    aboutHeading?: BilingualText;       // "Every client, a single story." line
    aboutCtaLabel?: BilingualText;
    contactHeading?: BilingualText;     // "Your next home, found together"
    contactSubtitle?: BilingualText;
    contactCtaLabel?: BilingualText;
  };
  about?: {
    heroEyebrow?: BilingualText;
    heroTitle?: BilingualText;          // bigger /hakkimizda hero
    intro?: BilingualText;              // 1-2 line intro paragraph
    bio1?: BilingualText;               // first long paragraph
    bio2?: BilingualText;               // second long paragraph (optional)
    specialties?: BilingualText;        // line break separated list
    portraitUrl?: string;               // single image URL
    quote?: BilingualText;              // pull-quote
    quoteAuthor?: string;
  };
  contact?: {
    heroEyebrow?: BilingualText;
    heroTitle?: BilingualText;
    intro?: BilingualText;              // text below the heading
    workingHours?: BilingualText;       // free text — multiline
    addressLine?: BilingualText;        // override settings.address if set
  };
}

export const EMPTY_PAGE_CONTENT: PageContent = {};

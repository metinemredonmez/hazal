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
    heroMediaUrl?: string;              // hero arkaplan (settings.heroMediaUrl yedek)
    heroCtaLabel?: BilingualText;       // hero button text
    featuredTitle?: BilingualText;      // "Featured listings" section heading
    featuredSubtitle?: BilingualText;
    featuredImageUrl?: string;          // öne çıkan ilanlar bölümü banner
    aboutHeading?: BilingualText;       // "Every client, a single story." line
    aboutImageUrl?: string;             // teaser bölümü ek görsel (yan kart)
    aboutCtaLabel?: BilingualText;
    contactHeading?: BilingualText;     // "Your next home, found together"
    contactSubtitle?: BilingualText;
    contactImageUrl?: string;           // contact CTA arkaplan
    contactCtaLabel?: BilingualText;
    // Video showcase — anasayfa video bölümü (3 slot, opsiyonel)
    showcaseVideo1Url?: string;
    showcaseVideo1Title?: BilingualText;
    showcaseVideo1Date?: string;
    showcaseVideo2Url?: string;
    showcaseVideo2Title?: BilingualText;
    showcaseVideo2Date?: string;
    showcaseVideo3Url?: string;
    showcaseVideo3Title?: BilingualText;
    showcaseVideo3Date?: string;
  };
  about?: {
    heroEyebrow?: BilingualText;
    heroTitle?: BilingualText;          // bigger /hakkimizda hero
    heroImageUrl?: string;              // /hakkimizda hero arkaplan
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
    heroImageUrl?: string;              // /iletisim hero arkaplan
    intro?: BilingualText;              // text below the heading
    workingHours?: BilingualText;       // free text — multiline
    addressLine?: BilingualText;        // override settings.address if set
  };
}

export const EMPTY_PAGE_CONTENT: PageContent = {};

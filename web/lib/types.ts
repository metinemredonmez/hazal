export type ListingStatus = "DRAFT" | "ACTIVE" | "SOLD" | "RENTED" | "PASSIVE";
export type ListingType = "SALE" | "RENT";
export type ListingCategory =
  | "APARTMENT"
  | "VILLA"
  | "HOUSE"
  | "LAND"
  | "OFFICE"
  | "COMMERCIAL"
  | "OTHER";
export type Currency = "TRY" | "USD" | "EUR";
export type InquiryStatus = "NEW" | "CONTACTED" | "HOT" | "CLOSED";

export interface Admin {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  totpEnabled?: boolean;
  hasGoogleLink?: boolean;
  lastLoginAt?: string | null;
}

export interface ListingImage {
  id: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

export interface Listing {
  id: string;
  slug: string;
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  price: string | number;
  currency: Currency;
  type: ListingType;
  category: ListingCategory;
  bedrooms: number | null;
  bathrooms: number | null;
  areaM2: number | null;
  address: string | null;
  city: string | null;
  district: string | null;
  lat: number | null;
  lng: number | null;
  yearBuilt: number | null;
  status: ListingStatus;
  featured: boolean;
  views: number;
  videoUrl: string | null;
  tourUrl: string | null;
  images: ListingImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: InquiryStatus;
  notes: string | null;
  listingId: string | null;
  listing?: { id: string; slug: string; titleTr: string; titleEn: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface InquiriesResponse extends Paginated<Inquiry> {
  unreadCount: number;
}

export interface SiteSettings {
  id: string;
  brandName: string;
  tagline: string | null;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
  facebook: string | null;
  defaultCurrency: Currency;
  defaultLocale: string;
  mapboxToken: string | null;
  gaId: string | null;
  heroTitleTr: string | null;
  heroTitleEn: string | null;
  heroSubtitleTr: string | null;
  heroSubtitleEn: string | null;
  heroMediaUrl: string | null;
  aboutTr: string | null;
  aboutEn: string | null;
  seoTitleTr: string | null;
  seoTitleEn: string | null;
  seoDescTr: string | null;
  seoDescEn: string | null;
  pageContent: PageContent | null;
  updatedAt: string;
}

export interface BilingualText {
  tr: string;
  en: string;
}

export interface PageContent {
  home?: {
    heroEyebrow?: BilingualText;
    heroCtaLabel?: BilingualText;
    heroMediaUrl?: string;
    featuredTitle?: BilingualText;
    featuredSubtitle?: BilingualText;
    featuredImageUrl?: string;
    aboutHeading?: BilingualText;
    aboutCtaLabel?: BilingualText;
    aboutImageUrl?: string;
    contactHeading?: BilingualText;
    contactSubtitle?: BilingualText;
    contactCtaLabel?: BilingualText;
    contactImageUrl?: string;
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
    heroTitle?: BilingualText;
    heroImageUrl?: string;
    intro?: BilingualText;
    bio1?: BilingualText;
    bio2?: BilingualText;
    specialties?: BilingualText;
    portraitUrl?: string;
    quote?: BilingualText;
    quoteAuthor?: string;
  };
  contact?: {
    heroEyebrow?: BilingualText;
    heroTitle?: BilingualText;
    heroImageUrl?: string;
    intro?: BilingualText;
    workingHours?: BilingualText;
    addressLine?: BilingualText;
  };
  collection?: {
    // Homepage "FeaturedCollection" section + /koleksiyon hero
    eyebrow?: BilingualText;
    title?: BilingualText; // supports \n for line break
    description?: BilingualText;
    ctaLabel?: BilingualText;
    // /koleksiyon bottom CTA
    ctaSectionEyebrow?: BilingualText;
    ctaSectionTitle?: BilingualText;
    ctaSectionDescription?: BilingualText;
    ctaSectionButton?: BilingualText;
  };
}

export interface ListingStats {
  total: number;
  active: number;
  draft: number;
  sold: number;
  rented: number;
  featured: number;
  totalViews: number;
  topViewed: Array<{ id: string; slug: string; titleTr: string; titleEn: string; views: number }>;
}

export interface ChatSessionSummary {
  id: string;
  visitorId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  closed: boolean;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  lastMessage: { id: string; sender: "VISITOR" | "ADMIN"; content: string; createdAt: string } | null;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: "VISITOR" | "ADMIN";
  content: string;
  read: boolean;
  createdAt: string;
}

export interface ChatSession extends ChatSessionSummary {
  messages: ChatMessage[];
}

export interface AuditLogEntry {
  id: string;
  action: string;
  success: boolean;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  admin: { id: string; email: string; name: string } | null;
}

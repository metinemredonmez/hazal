"use client";

import * as React from "react";

export type Locale = "tr" | "en";

const KEY = "hazal_locale";

export function useLocale(): [Locale, (l: Locale) => void] {
  const [locale, setLocaleState] = React.useState<Locale>("tr");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(KEY) as Locale | null;
    if (saved === "tr" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, l);
      document.documentElement.lang = l;
    }
  }, []);

  return [locale, setLocale];
}

export const t = {
  tr: {
    nav: {
      home: "Anasayfa",
      listings: "İlanlar",
      listingsAll: "Tüm İlanlar",
      listingsSale: "Satılık",
      listingsRent: "Kiralık",
      listingsFeatured: "Öne Çıkanlar",
      about: "Hakkımda",
      aboutBio: "Biyografi",
      aboutPress: "Basında",
      media: "Medya",
      mediaGallery: "Galeri",
      mediaVideos: "Video Turlar",
      contact: "İletişim",
      explore: "Keşfet",
    },
    hero: {
      eyebrow: "Hazal Muti · Real Estate",
      tagline: "Premium gayrimenkul, kişisel hizmet.",
      ctaListings: "İlanları Keşfet",
      ctaContact: "İletişime Geç",
    },
    sections: {
      featured: "Öne Çıkan İlanlar",
      featuredSub: "Hazal'ın seçtiği öne çıkan portföy",
      about: "Hakkımda",
      aboutCta: "Daha Fazla",
      allListings: "Tüm İlanlar",
      allListingsSub: "Premium portföyü görüntüleyin",
      viewAll: "Tümünü Gör",
      contactCta: "İletişime Geçin",
    },
    listing: {
      forSale: "Satılık",
      forRent: "Kiralık",
      bedrooms: "Yatak Odası",
      bathrooms: "Banyo",
      area: "m²",
      priceOnRequest: "Fiyat: Talep Üzerine",
      filters: "Filtreler",
      type: "Tip",
      category: "Kategori",
      city: "Şehir",
      sortBy: "Sırala",
      newest: "En Yeni",
      priceLow: "Fiyat: Düşükten",
      priceHigh: "Fiyat: Yüksekten",
      noResults: "Sonuç bulunamadı",
      details: "Detaylar",
      yearBuilt: "Yapım Yılı",
      address: "Adres",
      virtualTour: "Sanal Tur",
      video: "Video",
      gallery: "Galeri",
      description: "Açıklama",
      inquiry: "Bilgi Al",
      backToList: "İlanlara Dön",
    },
    inquiry: {
      title: "Bu mülk hakkında bilgi alın",
      name: "Adınız",
      email: "E-posta",
      phone: "Telefon",
      message: "Mesajınız",
      messagePlaceholder: "Bu mülkle ilgili sorularınız...",
      send: "Mesaj Gönder",
      sending: "Gönderiliyor...",
      success: "Mesajınız iletildi. En kısa sürede dönüş yapılacaktır.",
      error: "Mesaj gönderilemedi.",
    },
    contact: {
      heading: "İletişim",
      sub: "Soru, talep ya da görüşme için bana ulaşın",
      form: "Mesaj Gönder",
      directContact: "Doğrudan İletişim",
    },
    about: {
      heading: "Hakkımda",
      title: "Hazal Muti",
      role: "Premium Gayrimenkul Danışmanı",
    },
    footer: {
      rights: "Tüm hakları saklıdır",
      privacy: "Gizlilik",
      kvkk: "KVKK",
      terms: "Kullanım Koşulları",
      cookies: "Çerez",
    },
  },
  en: {
    nav: {
      home: "Home",
      listings: "Listings",
      listingsAll: "All Listings",
      listingsSale: "For Sale",
      listingsRent: "For Rent",
      listingsFeatured: "Featured",
      about: "About",
      aboutBio: "Biography",
      aboutPress: "Press",
      media: "Media",
      mediaGallery: "Gallery",
      mediaVideos: "Video Tours",
      contact: "Contact",
      explore: "Explore",
    },
    hero: {
      eyebrow: "Hazal Muti · Real Estate",
      tagline: "Premium properties, personal service.",
      ctaListings: "Explore Listings",
      ctaContact: "Get in Touch",
    },
    sections: {
      featured: "Featured Listings",
      featuredSub: "Hand-picked properties from Hazal's portfolio",
      about: "About Me",
      aboutCta: "Read More",
      allListings: "All Listings",
      allListingsSub: "Browse the premium portfolio",
      viewAll: "View All",
      contactCta: "Get in Touch",
    },
    listing: {
      forSale: "For Sale",
      forRent: "For Rent",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      area: "m²",
      priceOnRequest: "Price on request",
      filters: "Filters",
      type: "Type",
      category: "Category",
      city: "City",
      sortBy: "Sort",
      newest: "Newest",
      priceLow: "Price: Low",
      priceHigh: "Price: High",
      noResults: "No results found",
      details: "Details",
      yearBuilt: "Year Built",
      address: "Address",
      virtualTour: "Virtual Tour",
      video: "Video",
      gallery: "Gallery",
      description: "Description",
      inquiry: "Inquire",
      backToList: "Back to listings",
    },
    inquiry: {
      title: "Inquire about this property",
      name: "Your Name",
      email: "Email",
      phone: "Phone",
      message: "Your Message",
      messagePlaceholder: "Questions about this property...",
      send: "Send Message",
      sending: "Sending...",
      success: "Your message has been sent. We'll get back to you shortly.",
      error: "Failed to send message.",
    },
    contact: {
      heading: "Contact",
      sub: "Reach out for questions, requests or a private consultation",
      form: "Send a Message",
      directContact: "Direct Contact",
    },
    about: {
      heading: "About",
      title: "Hazal Muti",
      role: "Premium Real Estate Advisor",
    },
    footer: {
      rights: "All rights reserved",
      privacy: "Privacy",
      kvkk: "KVKK",
      terms: "Terms of Use",
      cookies: "Cookies",
    },
  },
};

export const CATEGORY_LABEL: Record<string, { tr: string; en: string }> = {
  APARTMENT: { tr: "Daire", en: "Apartment" },
  VILLA: { tr: "Villa", en: "Villa" },
  HOUSE: { tr: "Ev", en: "House" },
  LAND: { tr: "Arsa", en: "Land" },
  OFFICE: { tr: "Ofis", en: "Office" },
  COMMERCIAL: { tr: "Ticari", en: "Commercial" },
  OTHER: { tr: "Diğer", en: "Other" },
};

import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { OneSignalProvider } from "@/components/onesignal-provider";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hazalmuti.com").replace(/\/$/, "");
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Hazal Muti";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME} · İstanbul lüks gayrimenkul`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Bebek, Etiler, Cihangir, Bodrum — özenle seçilmiş satılık ve kiralık lüks daireler, villalar. Kişisel danışmanlık.",
  keywords: [
    "İstanbul gayrimenkul",
    "lüks daire",
    "Bebek emlak",
    "Etiler villa",
    "Cihangir apartman",
    "Bodrum villa",
    "luxury real estate Istanbul",
    "Hazal Muti",
  ],
  authors: [{ name: "Hazal Muti" }],
  creator: "Hazal Muti",
  publisher: APP_NAME,
  alternates: {
    canonical: "/",
    languages: {
      tr: "/",
      en: "/?lang=en",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} · İstanbul lüks gayrimenkul`,
    description:
      "Bebek, Etiler, Cihangir, Bodrum — özenle seçilmiş satılık ve kiralık lüks daireler, villalar.",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: APP_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} · İstanbul lüks gayrimenkul`,
    description: "Bebek'ten Bodrum'a — şahsen seçilmiş portföy.",
    images: ["/og-default.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: APP_NAME,
  url: SITE_URL,
  image: `${SITE_URL}/og-default.jpg`,
  description:
    "İstanbul lüks gayrimenkul danışmanlığı. Bebek, Etiler, Cihangir, Bodrum'da kişiselleştirilmiş hizmet.",
  areaServed: ["İstanbul", "Bodrum"],
  priceRange: "$$$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "İstanbul",
    addressCountry: "TR",
  },
  telephone: "+90 532 512 76 28",
  sameAs: ["https://instagram.com/hazalmuti", "https://linkedin.com/in/hazalmuti"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${sans.variable} ${display.variable}`}>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
        <OneSignalProvider />
      </body>
    </html>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hazal Muti — Premium Real Estate",
  description:
    "Hazal Muti ile iletişim — telefon, WhatsApp, e-posta. Rehbere kaydet, paylaş.",
  openGraph: {
    title: "Hazal Muti — Premium Real Estate",
    description: "İstanbul ve Bodrum'da premium gayrimenkul danışmanlığı",
    images: ["/og.jpg"],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hazal Muti",
    description: "Premium Real Estate — İstanbul · Bodrum",
  },
};

export default function VCardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

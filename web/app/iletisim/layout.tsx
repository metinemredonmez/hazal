import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Hazal Muti ile iletişime geçin — telefon, e-posta, WhatsApp ve form üzerinden ulaşabilirsiniz. İstanbul lüks gayrimenkul.",
  alternates: { canonical: "/iletisim" },
  openGraph: {
    title: "İletişim · Hazal Muti",
    description: "Telefon, e-posta, WhatsApp ile iletişim.",
    url: "/iletisim",
    type: "website",
  },
};

export default function IletisimLayout({ children }: { children: React.ReactNode }) {
  return children;
}

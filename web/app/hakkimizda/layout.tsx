import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkımda",
  description:
    "Hazal Muti — İstanbul'un en prestijli semtlerinde lüks gayrimenkul danışmanlığı. Kişisel hizmet, diskresyon, doğru ev için doğru rehberlik.",
  alternates: { canonical: "/hakkimizda" },
  openGraph: {
    title: "Hakkımda · Hazal Muti",
    description: "İstanbul lüks gayrimenkul danışmanı. Kişisel hizmet, diskresyon.",
    url: "/hakkimizda",
    type: "profile",
  },
};

export default function HakkimizdaLayout({ children }: { children: React.ReactNode }) {
  return children;
}

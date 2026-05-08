import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { OneSignalProvider } from "@/components/onesignal-provider";

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

export const metadata: Metadata = {
  title: {
    default: "Hazal Muti Real Estate",
    template: "%s · Hazal Muti Real Estate",
  },
  description: "Premium properties, personal service.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${sans.variable} ${display.variable}`}>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
        <OneSignalProvider />
      </body>
    </html>
  );
}

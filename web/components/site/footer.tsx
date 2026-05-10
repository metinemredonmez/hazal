"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLocale, t } from "@/lib/i18n";
import { useSettings } from "@/lib/use-settings";
import { NewsletterSignup } from "./newsletter-signup";

export function Footer() {
  const [locale] = useLocale();
  const tx = t[locale];
  const settings = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0E0E0E] text-[#F5F2EC] mt-24">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand + Newsletter */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <p className="font-display text-2xl tracking-[0.18em] uppercase">
                HAZAL <span className="italic font-light text-[#C9A96E]">MUTİ</span>
              </p>
              <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mt-3">
                Real Estate · İstanbul
              </p>
              <p className="text-sm text-[#F5F2EC]/60 mt-6 max-w-md leading-relaxed">
                {locale === "tr"
                  ? "Premium gayrimenkul, kişisel hizmet. İstanbul'un seçkin lokasyonlarında alım, satım ve danışmanlık."
                  : "Premium properties, personal service. Acquisition, sales and advisory in İstanbul's distinguished neighborhoods."}
              </p>
            </div>
            <div className="max-w-md">
              <NewsletterSignup source="footer" variant="footer" />
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              {tx.contact.heading}
            </p>
            <ul className="space-y-3 text-sm text-[#F5F2EC]/75">
              {settings?.phone && (
                <li>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 hover:text-[#C9A96E] transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" /> {settings.phone}
                  </a>
                </li>
              )}
              {settings?.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="flex items-center gap-2 hover:text-[#C9A96E] transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" /> {settings.email}
                  </a>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 mt-0.5" />
                  <span>{settings.address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Links: İlanlar */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              {tx.nav.listings}
            </p>
            <ul className="space-y-2 text-sm text-[#F5F2EC]/75">
              <li>
                <Link href="/ilanlar" className="hover:text-[#C9A96E]">
                  {tx.nav.listingsAll}
                </Link>
              </li>
              <li>
                <Link href="/ilanlar?type=SALE" className="hover:text-[#C9A96E]">
                  {tx.nav.listingsSale}
                </Link>
              </li>
              <li>
                <Link href="/ilanlar?type=RENT" className="hover:text-[#C9A96E]">
                  {tx.nav.listingsRent}
                </Link>
              </li>
              <li>
                <Link
                  href="/ilanlar?featured=true"
                  className="hover:text-[#C9A96E]"
                >
                  {tx.nav.listingsFeatured}
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Sayfalar */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              {locale === "tr" ? "Sayfalar" : "Pages"}
            </p>
            <ul className="space-y-2 text-sm text-[#F5F2EC]/75">
              <li>
                <Link href="/hakkimizda" className="hover:text-[#C9A96E]">
                  {tx.nav.about}
                </Link>
              </li>
              <li>
                <Link href="/medya" className="hover:text-[#C9A96E]">
                  {tx.nav.media}
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-[#C9A96E]">
                  {tx.nav.contact}
                </Link>
              </li>
              <li>
                <Link href="/favorilerim" className="hover:text-[#C9A96E]">
                  {locale === "tr" ? "Favorilerim" : "My Favorites"}
                </Link>
              </li>
              <li>
                <Link href="/v" className="hover:text-[#C9A96E]">
                  {locale === "tr" ? "Kartvizit" : "Card"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social + bottom */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-5 text-[10px] tracking-[0.3em] uppercase text-[#F5F2EC]/60">
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noreferrer" className="hover:text-[#C9A96E]">
                Instagram
              </a>
            )}
            {settings?.youtube && (
              <a href={settings.youtube} target="_blank" rel="noreferrer" className="hover:text-[#C9A96E]">
                YouTube
              </a>
            )}
            {settings?.facebook && (
              <a href={settings.facebook} target="_blank" rel="noreferrer" className="hover:text-[#C9A96E]">
                Facebook
              </a>
            )}
          </div>

          <p className="text-[10px] tracking-[0.2em] uppercase text-[#F5F2EC]/40">
            © {year} Hazal Muti · {tx.footer.rights}
          </p>

          <nav className="flex flex-wrap gap-x-5 gap-y-1 text-[10px] tracking-[0.2em] uppercase text-[#F5F2EC]/55">
            <Link href="/gizlilik-politikasi" className="hover:text-[#C9A96E]">{tx.footer.privacy}</Link>
            <Link href="/kvkk" className="hover:text-[#C9A96E]">{tx.footer.kvkk}</Link>
            <Link href="/kullanim-kosullari" className="hover:text-[#C9A96E]">{tx.footer.terms}</Link>
            <Link href="/cerez-politikasi" className="hover:text-[#C9A96E]">{tx.footer.cookies}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

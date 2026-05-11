"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale, t } from "@/lib/i18n";

interface NavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

export function Navbar() {
  const [locale, setLocale] = useLocale();
  const tx = t[locale];
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Body scroll lock when mobile menu open
  React.useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  const overHero = !scrolled && (pathname === "/" || pathname.startsWith("/ilanlar/"));

  const leftNav: NavItem[] = [
    {
      label: tx.nav.about,
      href: "/hakkimizda",
    },
    {
      label: tx.nav.listings,
      children: [
        { label: tx.nav.listingsAll, href: "/ilanlar" },
        { label: tx.nav.listingsSale, href: "/ilanlar?type=SALE" },
        { label: tx.nav.listingsRent, href: "/ilanlar?type=RENT" },
        { label: tx.nav.listingsFeatured, href: "/ilanlar?featured=true" },
      ],
    },
    {
      label: locale === "tr" ? "KOLEKSİYON" : "COLLECTION",
      href: "/koleksiyon",
    },
    {
      label: tx.nav.media,
      href: "/medya",
    },
    {
      label: tx.nav.mediaGallery,
      href: "/galeri",
    },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        overHero
          ? "bg-gradient-to-b from-black/70 via-black/40 to-transparent backdrop-blur-sm text-[#F5F2EC]"
          : "bg-[#0E0E0E]/95 backdrop-blur text-[#F5F2EC] border-b border-white/10",
      )}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-3 items-center h-16 lg:h-20">
          {/* Left nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-7">
            {leftNav.map((item) => (
              <DesktopNavItem
                key={item.label}
                item={item}
                open={openDropdown === item.label}
                onOpen={() =>
                  setOpenDropdown((prev) => (prev === item.label ? null : item.label))
                }
                onClose={() => setOpenDropdown(null)}
              />
            ))}
          </nav>

          {/* Mobile menu trigger (left) */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Center wordmark */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="font-display text-xl lg:text-2xl tracking-[0.18em] uppercase select-none"
            >
              HAZAL <span className="italic font-light text-[#D4B36A]">MUTİ</span>
            </Link>
          </div>

          {/* Right (desktop) */}
          <div className="hidden lg:flex items-center justify-end gap-5">
            <Link
              href="/iletisim"
              className="text-[10px] tracking-[0.3em] uppercase hover:text-[#D4B36A] transition-colors"
            >
              {tx.nav.contact}
            </Link>
            <button
              onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
              className="text-[10px] tracking-[0.3em] uppercase hover:text-[#D4B36A] transition-colors"
              aria-label="Switch language"
            >
              {locale === "tr" ? "EN" : "TR"}
            </button>
            <Link
              href="/ilanlar"
              aria-label="Search"
              className="hover:text-[#D4B36A] transition-colors"
            >
              <Search className="h-4 w-4" />
            </Link>
          </div>

          {/* Right (mobile) — sade: sadece dil */}
          <div className="lg:hidden flex items-center justify-end gap-2">
            <button
              onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
              className="text-[10px] tracking-[0.3em] uppercase px-2 py-1.5 hover:text-[#D4B36A]"
              aria-label="Switch language"
            >
              {locale === "tr" ? "EN" : "TR"}
            </button>
            <Link
              href="/ilanlar"
              aria-label="Search"
              className="p-2 hover:text-[#D4B36A]"
            >
              <Search className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        items={leftNav}
        locale={locale}
        onSwitchLocale={() => setLocale(locale === "tr" ? "en" : "tr")}
      />
    </header>
  );
}

function DesktopNavItem({
  item,
  open,
  onOpen,
  onClose,
}: {
  item: NavItem;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onClose]);

  if (!item.children) {
    return (
      <Link
        href={item.href ?? "#"}
        className="text-[10px] tracking-[0.3em] uppercase hover:text-[#D4B36A] transition-colors"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onOpen}
        className="flex items-center gap-1 text-[10px] tracking-[0.3em] uppercase hover:text-[#D4B36A] transition-colors"
      >
        {item.label}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-3 min-w-[180px] bg-[#0E0E0E]/98 backdrop-blur border border-white/10 py-2 shadow-2xl">
          {item.children.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="block px-4 py-2 text-[11px] tracking-[0.15em] uppercase text-[#F5F2EC]/80 hover:text-[#D4B36A] hover:bg-white/5 transition-colors"
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileMenu({
  open,
  onClose,
  items,
  locale,
  onSwitchLocale,
}: {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  locale: "tr" | "en";
  onSwitchLocale: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />
      {/* Drawer — mobilde tam ekran, tabletten itibaren %85 sağdan */}
      <aside
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[88%] sm:max-w-sm bg-[#0E0E0E] text-[#F5F2EC] shadow-[0_0_60px_rgba(0,0,0,0.6)] transition-transform duration-400 ease-out lg:hidden flex flex-col",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Link
            href="/"
            onClick={onClose}
            className="font-display text-lg tracking-[0.18em] uppercase"
          >
            HAZAL <span className="italic font-light text-[#D4B36A]">MUTİ</span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 -mr-2 text-[#F5F2EC]/70 hover:text-[#D4B36A] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-6 py-8">
          <ul className="space-y-5">
            {items.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <div>
                    <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-3">
                      {item.label}
                    </p>
                    <ul className="space-y-1.5 pl-1">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            onClick={onClose}
                            className="block py-1.5 font-display text-xl tracking-wide text-[#F5F2EC] hover:text-[#D4B36A] transition-colors"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link
                    href={item.href ?? "#"}
                    onClick={onClose}
                    className="block font-display text-2xl tracking-wide hover:text-[#D4B36A] transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* CTA + dil */}
          <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
            <Link
              href="/iletisim"
              onClick={onClose}
              className="flex items-center justify-center text-[11px] tracking-[0.4em] uppercase bg-[#D4B36A] text-[#0E0E0E] px-6 py-3.5 hover:bg-[#b8965e] transition-colors"
            >
              {locale === "tr" ? "İletişime Geç" : "Get in Touch"}
            </Link>
            <button
              onClick={() => {
                onSwitchLocale();
                onClose();
              }}
              className="block w-full text-center text-[10px] tracking-[0.4em] uppercase text-[#F5F2EC]/60 hover:text-[#D4B36A] py-2"
            >
              {locale === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-white/10 text-center">
          <p className="text-[9px] tracking-[0.4em] uppercase text-[#F5F2EC]/40">
            İstanbul · Bodrum
          </p>
        </div>
      </aside>
    </>
  );
}

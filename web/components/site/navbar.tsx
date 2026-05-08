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

  const overHero = !scrolled && (pathname === "/" || pathname.startsWith("/ilanlar/"));

  const leftNav: NavItem[] = [
    {
      label: tx.nav.about,
      children: [
        { label: tx.nav.aboutBio, href: "/hakkimizda" },
        { label: tx.nav.aboutPress, href: "/hakkimizda#press" },
      ],
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
      label: tx.nav.media,
      children: [
        { label: tx.nav.mediaGallery, href: "/medya" },
        { label: tx.nav.mediaVideos, href: "/medya#videos" },
      ],
    },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        overHero
          ? "bg-transparent text-[#F5F2EC]"
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
              HAZAL <span className="italic font-light text-[#C9A96E]">MUTİ</span>
            </Link>
          </div>

          {/* Right (desktop) */}
          <div className="hidden lg:flex items-center justify-end gap-5">
            <Link
              href="/iletisim"
              className="text-[10px] tracking-[0.3em] uppercase hover:text-[#C9A96E] transition-colors"
            >
              {tx.nav.contact}
            </Link>
            <button
              onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
              className="text-[10px] tracking-[0.3em] uppercase hover:text-[#C9A96E] transition-colors"
              aria-label="Switch language"
            >
              {locale === "tr" ? "EN" : "TR"}
            </button>
            <Link
              href="/ilanlar"
              aria-label="Search"
              className="hover:text-[#C9A96E] transition-colors"
            >
              <Search className="h-4 w-4" />
            </Link>
          </div>

          {/* Right (mobile) */}
          <div className="lg:hidden flex items-center justify-end gap-3">
            <button
              onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
              className="text-[10px] tracking-[0.3em] uppercase"
            >
              {locale === "tr" ? "EN" : "TR"}
            </button>
            <Link href="/iletisim" className="text-[10px] tracking-[0.3em] uppercase">
              {tx.nav.contact}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} items={leftNav} />
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
        className="text-[10px] tracking-[0.3em] uppercase hover:text-[#C9A96E] transition-colors"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onOpen}
        className="flex items-center gap-1 text-[10px] tracking-[0.3em] uppercase hover:text-[#C9A96E] transition-colors"
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
              className="block px-4 py-2 text-[11px] tracking-[0.15em] uppercase text-[#F5F2EC]/80 hover:text-[#C9A96E] hover:bg-white/5 transition-colors"
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
}: {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-[#0E0E0E] text-[#F5F2EC] transition-transform duration-500 lg:hidden",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex justify-end p-6">
        <button onClick={onClose} aria-label="Close" className="p-2 -mr-2">
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex flex-col items-center gap-6 mt-8 px-8">
        {items.map((item) =>
          item.children ? (
            <div key={item.label} className="text-center w-full">
              <p className="font-display text-2xl tracking-wider mb-3">{item.label}</p>
              <div className="flex flex-col gap-2">
                {item.children.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={onClose}
                    className="text-xs tracking-[0.25em] uppercase text-[#F5F2EC]/70 hover:text-[#C9A96E]"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              key={item.label}
              href={item.href ?? "#"}
              onClick={onClose}
              className="font-display text-2xl tracking-wider"
            >
              {item.label}
            </Link>
          ),
        )}
        <Link
          href="/iletisim"
          onClick={onClose}
          className="mt-6 text-xs tracking-[0.3em] uppercase border border-[#C9A96E] text-[#C9A96E] px-8 py-3"
        >
          İletişim · Contact
        </Link>
      </nav>
    </div>
  );
}

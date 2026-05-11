"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Inbox,
  MessagesSquare,
  Settings,
  History,
  UserCircle2,
  LogOut,
  Sparkles,
  CalendarDays,
  CalendarRange,
  BellRing,
  Mail,
  Newspaper,
  AtSign,
  FolderOpen,
  Landmark,
  Map as MapIcon,
  Users,
  BookOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, useUI } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const NAV: Array<{ label: string; href: string; icon: React.ComponentType<{ className?: string }> }> = [
  { label: "Panel", href: "/", icon: LayoutDashboard },
  { label: "Projeler", href: "/projeler", icon: Landmark },
  { label: "İlanlar", href: "/listings", icon: Building2 },
  { label: "Talepler", href: "/inquiries", icon: Inbox },
  { label: "Müşteriler", href: "/musteriler", icon: Users },
  { label: "Randevular", href: "/appointments", icon: CalendarDays },
  { label: "Takvim", href: "/takvim", icon: CalendarRange },
  { label: "Harita", href: "/harita", icon: MapIcon },
  { label: "Rehber", href: "/rehber", icon: BookOpen },
  { label: "Sohbet", href: "/chat", icon: MessagesSquare },
  { label: "Mail", href: "/mail", icon: AtSign },
  { label: "AI Yardımcı", href: "/ai", icon: Sparkles },
  { label: "Push", href: "/push", icon: BellRing },
  { label: "Bülten", href: "/newsletter", icon: Mail },
  { label: "Blog & Medya", href: "/blog", icon: Newspaper },
  { label: "Belgeler", href: "/belgeler", icon: FolderOpen },
  { label: "Ayarlar", href: "/settings", icon: Settings },
  { label: "Güvenlik", href: "/audit", icon: History },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const admin = useAuth((s) => s.admin);
  const logout = useAuth((s) => s.logout);

  function handleLogout() {
    logout();
    router.push("/login");
    onNavigate?.();
  }

  return (
    <>
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        <Link href="/" onClick={onNavigate} className="block select-none">
          <p className="font-display text-base tracking-[0.18em] uppercase leading-none">
            HAZAL <span className="italic font-light text-[#C9A96E]">MUTİ</span>
          </p>
          <p className="mt-1.5 text-[8px] tracking-[0.4em] uppercase text-sidebar-foreground/45">
            Real Estate · Admin
          </p>
        </Link>
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground border-l-2 border-[#C9A96E] pl-[8px] font-medium"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", active && "text-[#C9A96E]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      <div className="px-2 py-3">
        <Link
          href="/profile"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded px-2.5 py-1.5 transition-colors hover:bg-sidebar-accent/60"
        >
          <Avatar className="h-7 w-7 border border-sidebar-border">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-[10px]">
              {admin?.name
                ?.split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("") ?? "HM"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium truncate leading-tight">{admin?.name ?? "—"}</p>
            <p className="text-[9px] text-sidebar-foreground/50 truncate leading-tight">
              {admin?.email ?? ""}
            </p>
          </div>
          <UserCircle2 className="h-3.5 w-3.5 text-sidebar-foreground/40" />
        </Link>

        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Çıkış</span>
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const open = useUI((s) => s.mobileSidebarOpen);
  const setOpen = useUI((s) => s.setMobileSidebarOpen);

  // Close drawer when route changes (handled by SidebarContent onNavigate)
  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-52 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
          />
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-2xl animate-in slide-in-from-left">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}

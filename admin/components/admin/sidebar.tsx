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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const NAV: Array<{ label: string; href: string; icon: React.ComponentType<{ className?: string }> }> = [
  { label: "Panel", href: "/", icon: LayoutDashboard },
  { label: "İlanlar", href: "/listings", icon: Building2 },
  { label: "Talepler", href: "/inquiries", icon: Inbox },
  { label: "Randevular", href: "/appointments", icon: CalendarDays },
  { label: "Sohbet", href: "/chat", icon: MessagesSquare },
  { label: "AI Yardımcı", href: "/ai", icon: Sparkles },
  { label: "Ayarlar", href: "/settings", icon: Settings },
  { label: "Güvenlik", href: "/audit", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const admin = useAuth((s) => s.admin);
  const logout = useAuth((s) => s.logout);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside className="hidden lg:flex h-screen w-52 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border sticky top-0">
      <div className="px-4 pt-4 pb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Hazal Muti"
          className="h-8 w-auto opacity-95"
          draggable={false}
        />
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
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
    </aside>
  );
}

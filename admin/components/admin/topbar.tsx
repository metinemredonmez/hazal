"use client";

import { Menu, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth, useUI } from "@/lib/store";
import { NotificationCenter } from "./notification-center";

export function Topbar({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  const admin = useAuth((s) => s.admin);
  const toggleSidebar = useUI((s) => s.toggleMobileSidebar);
  const toggleAI = useUI((s) => s.toggleAI);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-11 items-center px-3 sm:px-4 gap-2 sm:gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden h-8 w-8 -ml-1 inline-flex items-center justify-center rounded hover:bg-muted text-foreground/70"
          aria-label="Menü"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-sm font-medium tracking-tight leading-none truncate">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-[11px] text-muted-foreground leading-none truncate hidden sm:block">
              {description}
            </p>
          )}
        </div>
        {actions}
        <button
          onClick={toggleAI}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-[#14141A] text-white text-[11px] hover:bg-[#C9A96E] hover:text-[#14141A] transition-colors group"
          aria-label="AI'a Sor (⌘K)"
          title="AI'a Sor (⌘K)"
        >
          <Sparkles className="h-3 w-3 text-[#C9A96E] group-hover:text-[#14141A]" />
          <span>Sor</span>
          <kbd className="hidden md:inline-flex items-center px-1 py-0.5 text-[9px] bg-white/10 rounded border border-white/20 group-hover:bg-black/10 group-hover:border-black/20">
            ⌘K
          </kbd>
        </button>
        <button
          onClick={toggleAI}
          className="sm:hidden h-7 w-7 inline-flex items-center justify-center rounded-md bg-[#14141A] text-white"
          aria-label="AI'a Sor"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#C9A96E]" />
        </button>
        <NotificationCenter />
        <Avatar className="h-6 w-6 border border-border">
          <AvatarFallback className="text-[10px] bg-secondary">
            {admin?.name
              ?.split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("") ?? "HM"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

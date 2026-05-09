"use client";

import { Menu } from "lucide-react";
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

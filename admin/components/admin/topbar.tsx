"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/store";

export function Topbar({ title, description }: { title: string; description?: string }) {
  const admin = useAuth((s) => s.admin);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-11 items-center px-4 gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-sm font-medium tracking-tight leading-none truncate">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-[11px] text-muted-foreground leading-none truncate">
              {description}
            </p>
          )}
        </div>
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

"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/store";
import { tokenStore } from "@/lib/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const admin = useAuth((s) => s.admin);
  const refresh = useAuth((s) => s.refresh);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!admin) {
      refresh().finally(() => setChecked(true));
    } else {
      setChecked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  React.useEffect(() => {
    if (checked && !admin) {
      router.replace("/login");
    }
  }, [checked, admin, router]);

  if (!checked || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <p className="text-xs uppercase tracking-[0.4em] text-[#C9A96E]">Hazal Mutin</p>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mt-1">
            Yükleniyor…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

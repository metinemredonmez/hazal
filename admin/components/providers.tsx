"use client";

import * as React from "react";
import { Toaster } from "sonner";
import { useAuth } from "@/lib/store";
import { tokenStore } from "@/lib/api";

export function Providers({ children }: { children: React.ReactNode }) {
  const refresh = useAuth((s) => s.refresh);
  const admin = useAuth((s) => s.admin);

  React.useEffect(() => {
    if (tokenStore.get() && !admin) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton theme="light" />
    </>
  );
}

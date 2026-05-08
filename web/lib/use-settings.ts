"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

let cache: SiteSettings | null = null;
let inflight: Promise<SiteSettings> | null = null;

export function useSettings(): SiteSettings | null {
  const [settings, setSettings] = React.useState<SiteSettings | null>(cache);

  React.useEffect(() => {
    if (cache) return;
    if (!inflight) {
      inflight = api<SiteSettings>("/api/settings/public", { auth: false }).then((s) => {
        cache = s;
        return s;
      });
    }
    inflight.then(setSettings).catch(() => {});
  }, []);

  return settings;
}

"use client";

import * as React from "react";

const FAV_KEY = "hazal_favs_v1";
const COMPARE_KEY = "hazal_compare_v1";
const COMPARE_MAX = 4;

type StorageKey = typeof FAV_KEY | typeof COMPARE_KEY;

// Cross-tab sync via storage event + custom event for same-tab
const SAME_TAB_EVENT = "hazal_storage_change";

function readList(key: StorageKey): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeList(key: StorageKey, list: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(list));
  window.dispatchEvent(
    new CustomEvent(SAME_TAB_EVENT, { detail: { key } }),
  );
}

function useStorageList(key: StorageKey): [string[], (next: string[]) => void] {
  const [list, setList] = React.useState<string[]>(() => readList(key));

  React.useEffect(() => {
    function refresh() {
      setList(readList(key));
    }
    function onSameTab(e: Event) {
      const detail = (e as CustomEvent<{ key: StorageKey }>).detail;
      if (detail?.key === key) refresh();
    }
    window.addEventListener("storage", refresh);
    window.addEventListener(SAME_TAB_EVENT, onSameTab);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(SAME_TAB_EVENT, onSameTab);
    };
  }, [key]);

  function set(next: string[]) {
    writeList(key, next);
    setList(next);
  }

  return [list, set];
}

// ─── Public hooks ────────────────────────────────────────────────

export function useFavorites() {
  const [list, set] = useStorageList(FAV_KEY);

  const toggle = React.useCallback(
    (slug: string) => {
      const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
      set(next);
      return next.includes(slug);
    },
    [list, set],
  );

  return {
    favorites: list,
    has: (slug: string) => list.includes(slug),
    toggle,
    clear: () => set([]),
    count: list.length,
  };
}

export function useCompare() {
  const [list, set] = useStorageList(COMPARE_KEY);

  const toggle = React.useCallback(
    (slug: string) => {
      const isIn = list.includes(slug);
      if (isIn) {
        set(list.filter((s) => s !== slug));
        return false;
      }
      if (list.length >= COMPARE_MAX) {
        return false; // limit reached, caller decides UX
      }
      set([...list, slug]);
      return true;
    },
    [list, set],
  );

  return {
    compare: list,
    has: (slug: string) => list.includes(slug),
    toggle,
    clear: () => set([]),
    remove: (slug: string) => set(list.filter((s) => s !== slug)),
    count: list.length,
    max: COMPARE_MAX,
    full: list.length >= COMPARE_MAX,
  };
}

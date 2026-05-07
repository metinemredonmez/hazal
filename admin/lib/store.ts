"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Admin } from "./types";
import { api, tokenStore } from "./api";

interface AuthState {
  admin: Admin | null;
  loading: boolean;
  setAdmin: (admin: Admin | null) => void;
  refresh: () => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      loading: false,
      setAdmin: (admin) => set({ admin }),
      async refresh() {
        try {
          set({ loading: true });
          const me = await api<Admin>("/api/auth/me");
          set({ admin: me, loading: false });
        } catch {
          set({ admin: null, loading: false });
          tokenStore.clear();
        }
      },
      logout() {
        tokenStore.clear();
        set({ admin: null });
      },
    }),
    { name: "hazal_admin_auth" },
  ),
);

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Admin } from "./types";
import { api, tokenStore } from "./api";

interface UIState {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean) => void;
  toggleMobileSidebar: () => void;
  aiOpen: boolean;
  aiSeedPrompt: string | null;
  setAIOpen: (v: boolean) => void;
  toggleAI: () => void;
  askAI: (prompt: string) => void;
  clearAISeed: () => void;
}

export const useUI = create<UIState>((set) => ({
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
  toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  aiOpen: false,
  aiSeedPrompt: null,
  setAIOpen: (v) => set({ aiOpen: v }),
  toggleAI: () => set((s) => ({ aiOpen: !s.aiOpen })),
  askAI: (prompt) => set({ aiOpen: true, aiSeedPrompt: prompt }),
  clearAISeed: () => set({ aiSeedPrompt: null }),
}));

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

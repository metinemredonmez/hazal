"use client";

import * as React from "react";
import { create } from "zustand";
import { AlertTriangle, Trash2, Info, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Variant = "danger" | "warning" | "info";

interface ConfirmRequest {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  resolve: (value: boolean) => void;
}

interface ConfirmStore {
  current: ConfirmRequest | null;
  open: (req: Omit<ConfirmRequest, "resolve">) => Promise<boolean>;
  close: (value: boolean) => void;
}

const useConfirmStore = create<ConfirmStore>((set, get) => ({
  current: null,
  open: (req) =>
    new Promise<boolean>((resolve) => {
      set({ current: { ...req, resolve } });
    }),
  close: (value) => {
    const cur = get().current;
    if (cur) cur.resolve(value);
    set({ current: null });
  },
}));

/**
 * Imperative confirm function for use in async handlers:
 *   if (!(await confirmDialog({ title: "Sil?", variant: "danger" }))) return;
 *   // proceed
 *
 * Replaces native window.confirm() with a styled dialog.
 */
export function confirmDialog(opts: Omit<ConfirmRequest, "resolve">): Promise<boolean> {
  return useConfirmStore.getState().open(opts);
}

const VARIANT_META: Record<
  Variant,
  { icon: React.ComponentType<{ className?: string }>; iconBg: string; iconColor: string; btnClass: string }
> = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    btnClass: "bg-red-600 hover:bg-red-700 text-white",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    btnClass: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    btnClass: "bg-[#14141A] hover:bg-black text-white",
  },
};

/**
 * Mount once at the root layout. Listens to the store and renders
 * the dialog when confirmDialog() is called.
 */
export function ConfirmDialogHost() {
  const current = useConfirmStore((s) => s.current);
  const close = useConfirmStore((s) => s.close);

  // ESC closes (cancel)
  React.useEffect(() => {
    if (!current) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, close]);

  if (!current) return null;

  const variant = current.variant ?? "info";
  const meta = VARIANT_META[variant];
  const Icon = meta.icon;

  return (
    <Dialog open onOpenChange={(o) => !o && close(false)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${meta.iconBg}`}>
              <Icon className={`h-5 w-5 ${meta.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-medium leading-tight">
                {current.title}
              </DialogTitle>
              {current.description && (
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {current.description}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => close(false)} className="gap-1.5">
            <X className="h-3.5 w-3.5" />
            {current.cancelLabel ?? "Vazgeç"}
          </Button>
          <Button onClick={() => close(true)} className={meta.btnClass}>
            {current.confirmLabel ?? "Onayla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

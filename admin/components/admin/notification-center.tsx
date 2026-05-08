"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Check, Inbox, MessagesSquare, Bell as BellIcon } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { getNotificationsSocket } from "@/lib/socket";
import { cn, formatDateTime } from "@/lib/utils";
import type { Notification, NotificationsResponse } from "@/lib/types";

const ICON: Record<Notification["type"], React.ComponentType<{ className?: string }>> = {
  new_inquiry: Inbox,
  new_chat_message: MessagesSquare,
  system: BellIcon,
};

export function NotificationCenter() {
  const [items, setItems] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const refresh = React.useCallback(() => {
    api<NotificationsResponse>("/api/admin/notifications?pageSize=15")
      .then((res) => {
        setItems(res.items);
        setUnreadCount(res.unreadCount);
      })
      .catch(() => {
        // silent — we'll retry on next event
      });
  }, []);

  React.useEffect(() => {
    refresh();

    const socket = getNotificationsSocket();
    const handleNew = (n: Notification) => {
      setItems((prev) => [n, ...prev].slice(0, 15));
      setUnreadCount((c) => c + 1);
      toast(n.title, { description: n.body ?? undefined, duration: 6000 });
    };
    socket.on("notification", handleNew);

    // Periodic refresh fallback
    const interval = setInterval(refresh, 60_000);

    return () => {
      socket.off("notification", handleNew);
      clearInterval(interval);
    };
  }, [refresh]);

  async function markRead(id: string) {
    try {
      await api(`/api/admin/notifications/${id}/read`, { method: "POST" });
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, read: true, readAt: new Date().toISOString() } : it)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  }

  async function markAllRead() {
    try {
      await api(`/api/admin/notifications/read-all`, { method: "POST" });
      setItems((prev) => prev.map((it) => ({ ...it, read: true })));
      setUnreadCount(0);
      toast.success("Tümü okundu olarak işaretlendi");
    } catch {
      toast.error("İşaretlenemedi");
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative h-7 w-7 rounded-full hover:bg-muted/60 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label={`${unreadCount} okunmamış bildirim`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-[3px] rounded-full bg-[#C9A96E] text-[#14141A] text-[9px] font-medium leading-none flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[480px] overflow-auto">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="text-xs px-0">Bildirimler</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] text-[#C9A96E] hover:text-[#B89757] inline-flex items-center gap-1"
            >
              <Check className="h-2.5 w-2.5" />
              Tümünü okundu yap
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="px-3 py-8 text-center text-[11px] text-muted-foreground">
            <Bell className="h-5 w-5 mx-auto opacity-30 mb-2" />
            Bildirim yok
          </div>
        ) : (
          items.map((n) => {
            const Icon = ICON[n.type] ?? BellIcon;
            const inner = (
              <div
                onClick={() => !n.read && markRead(n.id)}
                className={cn(
                  "flex gap-2.5 px-2 py-2 rounded text-left cursor-pointer hover:bg-muted/60 transition-colors",
                  !n.read && "bg-[#C9A96E]/8 border-l-2 border-[#C9A96E] pl-[6px]",
                )}
              >
                <Icon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-[11px] truncate", !n.read && "font-medium")}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                      {n.body}
                    </p>
                  )}
                  <p className="text-[9px] text-muted-foreground/70 mt-1">
                    {formatDateTime(n.createdAt)}
                  </p>
                </div>
                {!n.read && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C9A96E] mt-1.5 shrink-0" />
                )}
              </div>
            );
            return n.link ? (
              <DropdownMenuItem asChild key={n.id} className="p-0 focus:bg-transparent">
                <Link href={n.link} onClick={() => setOpen(false)} className="block">
                  {inner}
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem key={n.id} className="p-0 focus:bg-transparent">
                {inner}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

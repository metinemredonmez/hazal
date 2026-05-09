"use client";

import * as React from "react";
import {
  Send,
  Circle,
  X,
  MessagesSquare,
  Globe,
  Phone,
  Mail as MailIcon,
  Sparkles,
  Camera,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { cn, formatDateTime } from "@/lib/utils";
import { getAdminSocket } from "@/lib/socket";
import type { ChatSession, ChatSessionSummary, ChatMessage, ChatChannel } from "@/lib/types";

const CHANNELS: Array<{
  key: ChatChannel | "ALL";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  { key: "ALL", label: "Tümü", icon: MessagesSquare, color: "text-muted-foreground" },
  { key: "WEB", label: "Web", icon: Globe, color: "text-blue-600" },
  { key: "WHATSAPP", label: "WhatsApp", icon: Phone, color: "text-emerald-600" },
  { key: "INSTAGRAM", label: "Instagram", icon: Camera, color: "text-pink-600" },
  { key: "AI_CONCIERGE", label: "AI", icon: Sparkles, color: "text-amber-600" },
  { key: "EMAIL", label: "E-posta", icon: MailIcon, color: "text-violet-600" },
  { key: "PHONE", label: "Telefon", icon: Phone, color: "text-slate-600" },
  { key: "OTHER", label: "Diğer", icon: Hash, color: "text-gray-500" },
];

const CHANNEL_META: Record<ChatChannel, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> =
  Object.fromEntries(
    CHANNELS.filter((c) => c.key !== "ALL").map((c) => [c.key, { label: c.label, icon: c.icon, color: c.color }]),
  ) as Record<ChatChannel, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }>;

export default function ChatPage() {
  const [sessions, setSessions] = React.useState<ChatSessionSummary[]>([]);
  const [active, setActive] = React.useState<ChatSession | null>(null);
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [channelFilter, setChannelFilter] = React.useState<ChatChannel | "ALL">("ALL");
  const [stats, setStats] = React.useState<Array<{ channel: ChatChannel; count: number }>>([]);
  const messagesRef = React.useRef<HTMLDivElement>(null);

  const loadSessions = React.useCallback(() => {
    const sp = new URLSearchParams();
    if (channelFilter !== "ALL") sp.set("channel", channelFilter);
    const qs = sp.toString();
    api<ChatSessionSummary[]>(`/api/admin/chat/sessions${qs ? `?${qs}` : ""}`)
      .then(setSessions)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [channelFilter]);

  const loadStats = React.useCallback(() => {
    api<Array<{ channel: ChatChannel; count: number }>>("/api/admin/chat/channel-stats")
      .then(setStats)
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    loadSessions();
    loadStats();

    const socket = getAdminSocket();
    socket.on("admin:new-message", () => {
      loadSessions();
      loadStats();
    });
    socket.on("admin:session-updated", () => {
      loadSessions();
      loadStats();
    });

    return () => {
      socket.off("admin:new-message");
      socket.off("admin:session-updated");
    };
  }, [loadSessions, loadStats]);

  React.useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length]);

  async function openSession(s: ChatSessionSummary) {
    try {
      const full = await api<ChatSession>(`/api/admin/chat/sessions/${s.id}`);
      setActive(full);
      const socket = getAdminSocket();
      socket.emit("admin:join-session", { sessionId: s.id });
      // Listen for messages on this session
      socket.off("chat:message");
      socket.on("chat:message", (payload: { sessionId: string; message: ChatMessage }) => {
        if (payload.sessionId !== s.id) return;
        setActive((cur) => (cur ? { ...cur, messages: [...cur.messages, payload.message] } : cur));
      });
      loadSessions();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Yüklenemedi";
      toast.error(message);
    }
  }

  function send() {
    if (!active || !text.trim()) return;
    const socket = getAdminSocket();
    socket.emit("admin:reply", { sessionId: active.id, content: text.trim() });
    setText("");
  }

  async function closeSession() {
    if (!active) return;
    if (!confirm("Bu sohbeti kapatmak istediğine emin misin?")) return;
    try {
      await api(`/api/admin/chat/sessions/${active.id}/close`, { method: "PATCH" });
      setActive(null);
      loadSessions();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Kapatılamadı";
      toast.error(message);
    }
  }

  return (
    <>
      <Topbar
        title="Canlı Sohbet"
        description={
          sessions.length === 0
            ? "Henüz sohbet yok"
            : `${sessions.length} sohbet · ${sessions.reduce((a, s) => a + s.unreadCount, 0)} okunmamış`
        }
      />
      <main className="flex-1 px-4 py-4 animate-fade-up space-y-3">
        {/* Channel chip filter */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            const count =
              c.key === "ALL"
                ? stats.reduce((a, s) => a + s.count, 0)
                : stats.find((s) => s.channel === c.key)?.count ?? 0;
            const active = channelFilter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setChannelFilter(c.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] border transition-colors",
                  active
                    ? "bg-[#14141A] text-white border-[#14141A]"
                    : "bg-white text-foreground/70 border-border hover:bg-muted/50",
                )}
              >
                <Icon className={cn("h-3 w-3", active ? "text-[#C9A96E]" : c.color)} />
                {c.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] leading-none",
                      active ? "bg-[#C9A96E]/20 text-[#C9A96E]" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-[260px_1fr] h-[calc(100vh-160px)]">
          {/* Sessions list */}
          <Card className="overflow-auto">
            {loading ? (
              <div className="p-2 space-y-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessagesSquare className="h-6 w-6 mx-auto opacity-30 mb-2" />
                <p className="text-[11px]">Sohbet yok</p>
              </div>
            ) : (
              sessions.map((s) => {
                const cMeta = s.channel ? CHANNEL_META[s.channel] : undefined;
                const CIcon = cMeta?.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => openSession(s)}
                    className={cn(
                      "w-full text-left p-3 border-b border-border hover:bg-muted/50 transition-colors",
                      active?.id === s.id && "bg-muted/70 border-l-2 border-l-[#C9A96E]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {CIcon && <CIcon className={cn("h-3 w-3 shrink-0", cMeta?.color)} />}
                        <p className="text-[11px] font-medium truncate">
                          {s.visitorName ?? "Anonim Ziyaretçi"}
                        </p>
                      </div>
                      {s.unreadCount > 0 && (
                        <span className="text-[9px] bg-[#C9A96E] text-[#14141A] rounded-full px-1.5 py-0.5 leading-none font-medium">
                          {s.unreadCount}
                        </span>
                      )}
                    </div>
                    {s.visitorEmail && (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {s.visitorEmail}
                      </p>
                    )}
                    {s.visitorPhone && !s.visitorEmail && (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {s.visitorPhone}
                      </p>
                    )}
                    {s.lastMessage && (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {s.lastMessage.sender === "ADMIN" && "↩ "}
                        {s.lastMessage.content}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      {!s.closed && <Circle className="h-1.5 w-1.5 fill-emerald-500 text-emerald-500" />}
                      <p className="text-[9px] text-muted-foreground">
                        {formatDateTime(s.updatedAt)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </Card>

          {/* Conversation */}
          <Card className="flex flex-col overflow-hidden">
            {!active ? (
              <CardContent className="flex-1 flex items-center justify-center text-center">
                <div>
                  <MessagesSquare className="h-8 w-8 mx-auto opacity-30 mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Sohbet seçin</p>
                </div>
              </CardContent>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">
                      {active.visitorName ?? "Anonim"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {active.visitorEmail ?? active.visitorId}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={closeSession} className="gap-1">
                    <X className="h-3 w-3" /> Kapat
                  </Button>
                </div>
                <div ref={messagesRef} className="flex-1 overflow-auto p-4 space-y-3">
                  {active.messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex",
                        m.sender === "ADMIN" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-lg px-3 py-1.5 text-[12px] leading-relaxed",
                          m.sender === "ADMIN"
                            ? "bg-[#14141A] text-white rounded-br-sm"
                            : "bg-muted rounded-bl-sm",
                        )}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p
                          className={cn(
                            "mt-1 text-[9px] opacity-60",
                            m.sender === "ADMIN" ? "text-white" : "text-muted-foreground",
                          )}
                        >
                          {formatDateTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                  className="border-t border-border p-3 flex gap-2"
                >
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Mesaj yaz..."
                  />
                  <Button type="submit" size="icon" className="bg-[#14141A] hover:bg-black text-white">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}

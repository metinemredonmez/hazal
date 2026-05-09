"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Calendar as CalIcon,
  FileText,
  MapPin,
  MessagesSquare,
  Inbox,
  Loader2,
  Sparkles,
  ExternalLink,
  Cake,
} from "lucide-react";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useUI } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";

interface TimelineEvent {
  type: "inquiry" | "appointment" | "email" | "document" | "visit" | "chat";
  at: string;
  title: string;
  summary?: string;
  meta?: Record<string, unknown>;
}

interface CustomerProfile {
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    status: string;
    source: string;
    budget: string | null;
    budgetCurrency: string | null;
    preferences: string | null;
    birthday: string | null;
    interestedIn: string[];
    districts: string[];
    score: number;
    scoreNote: string | null;
    tags: string[];
    notes: string | null;
    createdAt: string;
  };
  counts: {
    inquiries: number;
    appointments: number;
    emails: number;
    documents: number;
    visits: number;
    chats: number;
  };
  events: TimelineEvent[];
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  LEAD: { label: "Yeni Lead", color: "bg-blue-100 text-blue-700" },
  ACTIVE: { label: "Aktif", color: "bg-emerald-100 text-emerald-700" },
  CLIENT: { label: "Müşteri", color: "bg-violet-100 text-violet-700" },
  INACTIVE: { label: "Pasif", color: "bg-gray-100 text-gray-700" },
  LOST: { label: "Kayıp", color: "bg-red-100 text-red-700" },
};

const TYPE_META: Record<TimelineEvent["type"], { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  inquiry: { label: "Talep", icon: Inbox, color: "text-amber-600 bg-amber-50" },
  appointment: { label: "Randevu", icon: CalIcon, color: "text-blue-600 bg-blue-50" },
  email: { label: "E-posta", icon: Mail, color: "text-violet-600 bg-violet-50" },
  document: { label: "Belge", icon: FileText, color: "text-slate-600 bg-slate-50" },
  visit: { label: "Ziyaret", icon: MapPin, color: "text-gray-600 bg-gray-50" },
  chat: { label: "Sohbet", icon: MessagesSquare, color: "text-emerald-600 bg-emerald-50" },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) return "Az önce";
    return `${hours} saat önce`;
  }
  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;
  if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
  if (days < 365) return `${Math.floor(days / 30)} ay önce`;
  return `${Math.floor(days / 365)} yıl önce`;
}

export default function CustomerProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const askAI = useUI((s) => s.askAI);
  const [data, setData] = React.useState<CustomerProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api<CustomerProfile>(`/api/admin/customers/${params.id}/timeline`)
      .then(setData)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  function askAIAbout() {
    if (!data) return;
    const c = data.customer;
    const ctx = `Müşteri: ${c.name}${c.email ? ` (${c.email})` : ""}, ` +
      `${c.status}, son ${data.events.length} aktivite, ` +
      `${data.counts.appointments} randevu, ${data.counts.inquiries} talep, ${data.counts.emails} mail. ` +
      (c.budget ? `Bütçe: ${c.budget} ${c.budgetCurrency}. ` : "") +
      (c.districts.length ? `İlgilendiği bölgeler: ${c.districts.join(", ")}. ` : "");
    askAI(`Bu müşteri için strateji öner: ${ctx}\nNe yapmamalı, ne yapmalı?`);
  }

  if (loading) {
    return (
      <>
        <Topbar title="Müşteri Profili" />
        <main className="flex-1 px-4 py-5 space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
        </main>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Topbar title="Müşteri Bulunamadı" />
        <main className="flex-1 px-4 py-5">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Müşteri bulunamadı veya silinmiş.
              </p>
              <Button variant="link" onClick={() => router.push("/musteriler")}>
                ← Müşteri listesine dön
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const c = data.customer;
  const status = STATUS_META[c.status] ?? STATUS_META.LEAD;
  const cleanPhone = (c.phone ?? "").replace(/[^0-9+]/g, "");
  const waPhone = (c.whatsapp ?? c.phone ?? "")
    .replace(/[^0-9+]/g, "")
    .replace(/^\+/, "");

  return (
    <>
      <Topbar
        title={c.name}
        description={c.email ?? c.phone ?? ""}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={askAIAbout}
            className="gap-1.5"
          >
            <Sparkles className="h-3 w-3 text-[#C9A96E]" />
            AI Strateji
          </Button>
        }
      />
      <main className="flex-1 px-4 py-5 space-y-4 animate-fade-up">
        {/* Back link */}
        <Link
          href="/musteriler"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Müşteri listesine dön
        </Link>

        {/* Header card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-14 h-14 rounded-full bg-[#14141A] text-white flex items-center justify-center text-lg font-medium shrink-0">
                {c.name
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-light">{c.name}</h2>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${status.color}`}
                  >
                    {status.label}
                  </span>
                  {c.score > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      ⭐ {c.score}/100
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                  {c.email && <span>✉️ {c.email}</span>}
                  {c.phone && <span>📞 {c.phone}</span>}
                  {c.budget && (
                    <span>
                      💰 {Number(c.budget).toLocaleString("tr-TR")} {c.budgetCurrency}
                    </span>
                  )}
                  {c.birthday && (
                    <span>
                      <Cake className="h-3 w-3 inline" /> {new Date(c.birthday).toLocaleDateString("tr-TR")}
                    </span>
                  )}
                </div>
                {(c.districts.length > 0 || c.tags.length > 0) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.districts.map((d) => (
                      <span
                        key={d}
                        className="text-[10px] bg-[#C9A96E]/10 text-[#C9A96E] px-1.5 py-0.5 rounded"
                      >
                        📍 {d}
                      </span>
                    ))}
                    {c.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] bg-muted px-1.5 py-0.5 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick action buttons */}
              <div className="flex gap-1.5 flex-wrap">
                {cleanPhone && (
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <a href={`tel:${cleanPhone}`}>
                      <Phone className="h-3 w-3" /> Ara
                    </a>
                  </Button>
                )}
                {waPhone && (
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <a
                      href={`https://wa.me/${waPhone}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="h-3 w-3 text-emerald-600" /> WA
                    </a>
                  </Button>
                )}
                {c.email && (
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <a href={`mailto:${c.email}`}>
                      <Mail className="h-3 w-3" /> Mail
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {c.preferences && (
              <p className="text-xs text-muted-foreground mt-4 pt-3 border-t bg-muted/30 -mx-1 -mb-1 px-3 py-2 rounded">
                💭 {c.preferences}
              </p>
            )}
            {c.notes && (
              <p className="text-xs mt-2 whitespace-pre-line">{c.notes}</p>
            )}
          </CardContent>
        </Card>

        {/* Counts grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {(
            [
              ["inquiries", "Talep", Inbox, "text-amber-600"],
              ["appointments", "Randevu", CalIcon, "text-blue-600"],
              ["emails", "Mail", Mail, "text-violet-600"],
              ["documents", "Belge", FileText, "text-slate-600"],
              ["visits", "Ziyaret", MapPin, "text-gray-600"],
              ["chats", "Sohbet", MessagesSquare, "text-emerald-600"],
            ] as const
          ).map(([key, label, Icon, color]) => (
            <div
              key={key}
              className="bg-white border border-border rounded-md p-3 text-center"
            >
              <Icon className={`h-3.5 w-3.5 mx-auto mb-1 ${color}`} />
              <p className="text-xl font-light">
                {data.counts[key as keyof typeof data.counts]}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                Zaman Çizgisi · {data.events.length} aktivite
              </h3>
            </div>
            {data.events.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Henüz aktivite yok.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data.events.map((e, i) => {
                  const meta = TYPE_META[e.type];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={i}
                      className="flex gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${meta.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate">{e.title}</p>
                          <p className="text-[11px] text-muted-foreground shrink-0">
                            {relativeTime(e.at)}
                          </p>
                        </div>
                        {e.summary && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {e.summary}
                          </p>
                        )}
                        {e.meta?.listing ? (
                          <p className="text-[11px] text-[#C9A96E] mt-0.5">
                            🏠 {String(e.meta.listing)}
                          </p>
                        ) : null}
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDateTime(e.at)}
                        </p>
                      </div>
                      {e.type === "visit" && e.meta?.lat && e.meta?.lng ? (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${e.meta.lat},${e.meta.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground hover:text-[#C9A96E]"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

"use client";

import * as React from "react";
import { Mail, Phone, Loader2, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn, formatDateTime } from "@/lib/utils";
import type { Inquiry, InquiriesResponse, InquiryStatus } from "@/lib/types";

const STATUS_LABEL: Record<InquiryStatus, string> = {
  NEW: "Yeni",
  CONTACTED: "İletişimde",
  HOT: "Sıcak",
  CLOSED: "Kapandı",
};
const STATUS_VARIANT: Record<InquiryStatus, "warning" | "success" | "destructive" | "default"> = {
  NEW: "warning",
  CONTACTED: "success",
  HOT: "destructive",
  CLOSED: "default",
};

export default function InquiriesPage() {
  const [data, setData] = React.useState<InquiriesResponse | null>(null);
  const [selected, setSelected] = React.useState<Inquiry | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [q, setQ] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [reply, setReply] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (q) params.set("q", q);
    params.set("pageSize", "50");
    api<InquiriesResponse>(`/api/admin/inquiries?${params}`)
      .then(setData)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [statusFilter, q]);

  React.useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  React.useEffect(() => {
    if (selected) setNotes(selected.notes ?? "");
  }, [selected]);

  async function updateStatus(status: InquiryStatus) {
    if (!selected) return;
    try {
      const updated = await api<Inquiry>(`/api/admin/inquiries/${selected.id}`, {
        method: "PATCH",
        body: { status },
      });
      setSelected({ ...selected, status: updated.status });
      load();
      toast.success("Durum güncellendi");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Güncellenemedi";
      toast.error(message);
    }
  }

  async function saveNotes() {
    if (!selected) return;
    try {
      await api(`/api/admin/inquiries/${selected.id}`, {
        method: "PATCH",
        body: { notes },
      });
      toast.success("Not kaydedildi");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Kaydedilemedi";
      toast.error(message);
    }
  }

  async function suggestReply() {
    if (!selected) return;
    setAiLoading(true);
    try {
      const res = await api<{ reply: string }>("/api/admin/ai/suggest-reply", {
        method: "POST",
        body: { inquiryId: selected.id, locale: "tr", tone: "friendly" },
      });
      setReply(res.reply);
      toast.success("AI cevap önerisi hazır");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "AI başarısız";
      toast.error(message);
    } finally {
      setAiLoading(false);
    }
  }

  async function deleteInquiry() {
    if (!selected) return;
    if (!confirm("Bu talebi silmek istediğine emin misin?")) return;
    try {
      await api(`/api/admin/inquiries/${selected.id}`, { method: "DELETE" });
      toast.success("Silindi");
      setSelected(null);
      load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Silinemedi";
      toast.error(message);
    }
  }

  return (
    <>
      <Topbar
        title="Müşteri Talepleri"
        description={
          data
            ? `${data.total} toplam · ${data.unreadCount} cevaplanmamış`
            : "Yükleniyor..."
        }
      />
      <main className="flex-1 px-6 py-8 animate-fade-up">
        <div className="grid gap-4 lg:grid-cols-[400px_1fr] h-[calc(100vh-200px)]">
          {/* List */}
          <Card className="overflow-hidden flex flex-col">
            <div className="p-3 border-b border-border space-y-2">
              <Input placeholder="Ara..." value={q} onChange={(e) => setQ(e.target.value)} />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="NEW">Yeni</SelectItem>
                  <SelectItem value="CONTACTED">İletişimde</SelectItem>
                  <SelectItem value="HOT">Sıcak</SelectItem>
                  <SelectItem value="CLOSED">Kapandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : data && data.items.length > 0 ? (
                data.items.map((inq) => (
                  <button
                    key={inq.id}
                    onClick={() => setSelected(inq)}
                    className={cn(
                      "w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors",
                      selected?.id === inq.id && "bg-muted/70 border-l-2 border-l-[#C9A96E]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{inq.name}</p>
                      <Badge variant={STATUS_VARIANT[inq.status]} className="text-[10px] shrink-0">
                        {STATUS_LABEL[inq.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">{inq.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {formatDateTime(inq.createdAt)}
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground p-12">Talep yok</p>
              )}
            </div>
          </Card>

          {/* Detail */}
          <Card className="overflow-auto">
            {!selected ? (
              <CardContent className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Görüntülemek için talep seç</p>
              </CardContent>
            ) : (
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-light">{selected.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                        <Mail className="h-3.5 w-3.5" /> {selected.email}
                      </a>
                      {selected.phone && (
                        <a href={`tel:${selected.phone}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                          <Phone className="h-3.5 w-3.5" /> {selected.phone}
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(selected.createdAt)}
                    </p>
                  </div>
                  <Select value={selected.status} onValueChange={(v) => updateStatus(v as InquiryStatus)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">Yeni</SelectItem>
                      <SelectItem value="CONTACTED">İletişimde</SelectItem>
                      <SelectItem value="HOT">Sıcak</SelectItem>
                      <SelectItem value="CLOSED">Kapandı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selected.listing && (
                  <div className="rounded-md bg-muted/50 p-3 text-sm">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">İlgilendiği ilan</p>
                    <p className="font-medium">{selected.listing.titleTr}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Mesaj</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Cevap Önerisi</p>
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={suggestReply}
                      disabled={aiLoading}
                      className="gap-2"
                    >
                      {aiLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      AI ile Yaz
                    </Button>
                  </div>
                  <Textarea
                    rows={5}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="AI önerisi burada görünecek (veya kendin yaz)..."
                  />
                  {reply && (
                    <Button asChild size="sm" variant="outline" className="mt-2">
                      <a
                        href={`mailto:${selected.email}?subject=Hazal%20Mutin%20Real%20Estate&body=${encodeURIComponent(reply)}`}
                      >
                        <Mail className="h-3 w-3" /> E-posta gönder
                      </a>
                    </Button>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Özel Not</p>
                  <Textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Bu müşteri hakkında not..."
                  />
                  <Button size="sm" variant="outline" onClick={saveNotes} className="mt-2">
                    Notu Kaydet
                  </Button>
                </div>

                <div className="border-t border-border pt-4">
                  <Button variant="ghost" size="sm" onClick={deleteInquiry} className="text-destructive gap-2">
                    <Trash2 className="h-3.5 w-3.5" /> Talebi Sil
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}

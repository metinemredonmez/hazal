"use client";

import * as React from "react";
import { toast } from "sonner";
import { Mail, UserMinus, Trash2, Download, RefreshCcw, Loader2 } from "lucide-react";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { confirmDialog } from "@/components/admin/confirm-dialog";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  locale: string;
  source: string;
  unsubscribed: boolean;
  unsubscribedAt: string | null;
  createdAt: string;
}

interface SubscribersList {
  items: Subscriber[];
  total: number;
  totalPages: number;
}

interface SubscriberStats {
  active: number;
  unsubscribed: number;
  total: number;
  last30dCount: number;
}

export default function NewsletterPage() {
  const [data, setData] = React.useState<SubscribersList | null>(null);
  const [stats, setStats] = React.useState<SubscriberStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [includeUnsubscribed, setIncludeUnsubscribed] = React.useState(false);
  const [actingId, setActingId] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [list, s] = await Promise.all([
        api<SubscribersList>(
          `/api/admin/newsletter?pageSize=100&includeUnsubscribed=${includeUnsubscribed}`,
        ),
        api<SubscriberStats>("/api/admin/newsletter/stats"),
      ]);
      setData(list);
      setStats(s);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Yüklenemedi";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [includeUnsubscribed]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function unsubscribe(id: string) {
    setActingId(id);
    try {
      await api(`/api/admin/newsletter/${id}/unsubscribe`, { method: "PATCH" });
      toast.success("Abonelikten çıkarıldı");
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setActingId(null);
    }
  }

  async function remove(id: string) {
    if (
      !(await confirmDialog({
        title: "Aboneyi sil?",
        description: "Bu e-posta aboneliği tamamen silinecek. Geri alınamaz.",
        confirmLabel: "Sil",
        variant: "danger",
      }))
    )
      return;
    setActingId(id);
    try {
      await api(`/api/admin/newsletter/${id}`, { method: "DELETE" });
      toast.success("Silindi");
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setActingId(null);
    }
  }

  function exportCsv() {
    if (!data) return;
    const rows = [
      ["email", "name", "locale", "source", "unsubscribed", "createdAt"],
      ...data.items.map((s) => [
        s.email,
        s.name ?? "",
        s.locale,
        s.source,
        s.unsubscribed ? "yes" : "no",
        s.createdAt,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Topbar
        title="Bülten Aboneleri"
        description="E-posta abone listesi · web sitesinden katılanlar"
      />
      <main className="flex-1 px-4 py-5 space-y-4 animate-fade-up">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Aktif Abone" value={stats?.active ?? "—"} accent />
          <StatCard label="Son 30 Gün" value={stats?.last30dCount ?? "—"} />
          <StatCard label="Çıkanlar" value={stats?.unsubscribed ?? "—"} />
          <StatCard label="Toplam" value={stats?.total ?? "—"} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={includeUnsubscribed}
                onChange={(e) => setIncludeUnsubscribed(e.target.checked)}
                className="rounded"
              />
              Çıkmış aboneleri de göster
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-1.5">
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCcw className="h-3.5 w-3.5" />
              )}
              Yenile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={!data || data.items.length === 0}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-xs">
              Aboneler {data && `(${data.total})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {loading && !data ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data && data.items.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-3 opacity-30" />
                Henüz abone yok. Web sitesinin footer'ına e-posta giren ziyaretçiler buraya
                düşer.
              </div>
            ) : (
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>E-posta</TableHead>
                    <TableHead>İsim</TableHead>
                    <TableHead>Dil</TableHead>
                    <TableHead>Kaynak</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <a
                          href={`mailto:${s.email}`}
                          className="text-foreground hover:underline"
                        >
                          {s.email}
                        </a>
                        {s.unsubscribed && (
                          <span className="ml-2 inline-block text-[10px] tracking-wider uppercase text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                            Çıkmış
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{s.name ?? "—"}</TableCell>
                      <TableCell className="text-xs uppercase text-muted-foreground">
                        {s.locale}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {s.source}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString("tr-TR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          {!s.unsubscribed && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={actingId === s.id}
                              onClick={() => unsubscribe(s.id)}
                              className="h-7 px-2 text-xs gap-1"
                            >
                              <UserMinus className="h-3 w-3" />
                              Çıkar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actingId === s.id}
                            onClick={() => remove(s.id)}
                            className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-1">
          {label}
        </p>
        <p
          className={
            "text-2xl font-light " + (accent ? "text-[#C9A96E]" : "text-foreground")
          }
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

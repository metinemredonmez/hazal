"use client";

import * as React from "react";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import type { AuditLogEntry } from "@/lib/types";
import { CheckCircle2, XCircle } from "lucide-react";

const ACTION_LABEL: Record<string, string> = {
  "login.success": "Giriş",
  "login.failed": "Giriş başarısız",
  "login.locked": "Hesap kilitlendi",
  "login.google": "Google ile giriş",
  "logout": "Çıkış",
  "password.changed": "Şifre değişti",
  "2fa.setup": "2FA kuruldu",
  "2fa.enabled": "2FA aktif edildi",
  "2fa.disabled": "2FA kapatıldı",
  "2fa.verified": "2FA doğrulandı",
  "2fa.failed": "2FA başarısız",
  "profile.updated": "Profil güncellendi",
};

export default function AuditPage() {
  const [data, setData] = React.useState<{
    items: AuditLogEntry[];
    total: number;
    page: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("action", filter);
    params.set("page", String(page));
    params.set("pageSize", "50");
    api(`/api/auth/audit-log?${params}`)
      .then((d) => setData(d as typeof data))
      .finally(() => setLoading(false));
  }, [filter, page]);

  return (
    <>
      <Topbar
        title="Güvenlik Kayıtları"
        description={data ? `${data.total} kayıt` : "Yükleniyor..."}
      />
      <main className="flex-1 px-4 py-5 space-y-3 animate-fade-up">
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {Object.entries(ACTION_LABEL).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlem</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead className="hidden lg:table-cell">User-Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data && data.items.length > 0 ? (
                  data.items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {formatDateTime(row.createdAt)}
                      </TableCell>
                      <TableCell className="text-[11px]">
                        {ACTION_LABEL[row.action] ?? row.action}
                      </TableCell>
                      <TableCell>
                        {row.success ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="text-[11px]">
                        {row.admin?.email ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">
                        {row.ip ?? "—"}
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground hidden lg:table-cell max-w-xs truncate">
                        {row.userAgent ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Kayıt yok
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              Sayfa {data.page} / {data.totalPages}
            </p>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-[11px] px-2 py-1 rounded border border-border disabled:opacity-30"
              >
                Önceki
              </button>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-[11px] px-2 py-1 rounded border border-border disabled:opacity-30"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

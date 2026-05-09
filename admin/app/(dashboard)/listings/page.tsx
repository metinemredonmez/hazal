"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Star, Edit3, Trash2, ImageOff, Copy, X, Share2, MapPin, Navigation, Upload, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Listing, Paginated } from "@/lib/types";
import { SocialPostDialog } from "@/components/admin/social-post-dialog";

const STATUS_COLOR: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  ACTIVE: "success",
  DRAFT: "warning",
  SOLD: "default",
  RENTED: "default",
  PASSIVE: "secondary",
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Yayında",
  DRAFT: "Taslak",
  SOLD: "Satıldı",
  RENTED: "Kiralandı",
  PASSIVE: "Pasif",
};

export default function ListingsPage() {
  const [data, setData] = React.useState<Paginated<Listing> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");
  const [confirmDelete, setConfirmDelete] = React.useState<Listing | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = React.useState<string>("");
  const [confirmBulkDelete, setConfirmBulkDelete] = React.useState(false);
  const [shareListing, setShareListing] = React.useState<Listing | null>(null);
  const [bulkImportOpen, setBulkImportOpen] = React.useState(false);

  const fetchListings = React.useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    params.set("pageSize", "50");
    api<Paginated<Listing>>(`/api/admin/listings?${params}`)
      .then(setData)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [q, status]);

  React.useEffect(() => {
    const t = setTimeout(fetchListings, 250);
    return () => clearTimeout(t);
  }, [fetchListings]);

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await api(`/api/admin/listings/${confirmDelete.id}`, { method: "DELETE" });
      toast.success("İlan silindi");
      setConfirmDelete(null);
      fetchListings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Silinemedi";
      toast.error(message);
    }
  }

  async function handleDuplicate(listing: Listing) {
    try {
      const created = await api<Listing>(`/api/admin/listings/${listing.id}/duplicate`, {
        method: "POST",
      });
      toast.success(`Klonlandı: ${created.titleTr}`);
      fetchListings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Klonlanamadı";
      toast.error(message);
    }
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (!data) return;
    if (selected.size === data.items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.items.map((l) => l.id)));
    }
  }

  async function applyBulk() {
    if (selected.size === 0 || !bulkAction) return;
    const ids = Array.from(selected);
    try {
      let payload: Record<string, unknown> = { ids };
      if (bulkAction.startsWith("status:")) {
        payload.status = bulkAction.split(":")[1];
      } else if (bulkAction === "feature:on") {
        payload.featured = true;
      } else if (bulkAction === "feature:off") {
        payload.featured = false;
      }
      const res = await api<{ updated: number }>(`/api/admin/listings/bulk/update`, {
        method: "POST",
        body: payload,
      });
      toast.success(`${res.updated} ilan güncellendi`);
      setSelected(new Set());
      setBulkAction("");
      fetchListings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Toplu işlem başarısız";
      toast.error(message);
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    try {
      const res = await api<{ deleted: number }>(`/api/admin/listings/bulk/delete`, {
        method: "POST",
        body: { ids: Array.from(selected) },
      });
      toast.success(`${res.deleted} ilan silindi`);
      setSelected(new Set());
      setConfirmBulkDelete(false);
      fetchListings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Silinemedi";
      toast.error(message);
    }
  }

  return (
    <>
      <Topbar title="İlanlar" description="Tüm gayrimenkul ilanlarını yönetin" />
      <main className="flex-1 px-6 py-8 space-y-6 animate-fade-up">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-1 gap-2 max-w-2xl">
            <Input
              placeholder="Arama (başlık, şehir, ilçe)..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px] h-10">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="ACTIVE">Yayında</SelectItem>
                <SelectItem value="DRAFT">Taslak</SelectItem>
                <SelectItem value="SOLD">Satıldı</SelectItem>
                <SelectItem value="RENTED">Kiralandı</SelectItem>
                <SelectItem value="PASSIVE">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 h-10"
              onClick={() => setBulkImportOpen(true)}
            >
              <Upload className="h-4 w-4" /> Toplu Yükle
            </Button>
            <Button asChild className="bg-[#14141A] hover:bg-black text-white gap-2 h-10">
              <Link href="/listings/new">
                <Plus className="h-4 w-4" /> Yeni İlan
              </Link>
            </Button>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded-md animate-fade-in">
            <span className="text-xs font-medium">{selected.size} seçili</span>
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="h-8 w-44">
                <SelectValue placeholder="İşlem seç..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status:ACTIVE">Yayına al</SelectItem>
                <SelectItem value="status:DRAFT">Taslağa al</SelectItem>
                <SelectItem value="status:SOLD">Satıldı işaretle</SelectItem>
                <SelectItem value="status:RENTED">Kiralandı işaretle</SelectItem>
                <SelectItem value="status:PASSIVE">Pasif yap</SelectItem>
                <SelectItem value="feature:on">Öne çıkar</SelectItem>
                <SelectItem value="feature:off">Öne çıkarmayı kaldır</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={applyBulk} disabled={!bulkAction} className="bg-[#14141A] hover:bg-black text-white">
              Uygula
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setConfirmBulkDelete(true)} className="gap-1">
              <Trash2 className="h-3 w-3" /> Sil
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} className="ml-auto gap-1">
              <X className="h-3 w-3" /> İptal
            </Button>
          </div>
        )}

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      className="cursor-pointer"
                      checked={!!data && data.items.length > 0 && selected.size === data.items.length}
                      onChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="w-16"></TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Konum</TableHead>
                  <TableHead className="text-right">Fiyat</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Görüntülenme</TableHead>
                  <TableHead>Eklendi</TableHead>
                  <TableHead className="w-32"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data && data.items.length > 0 ? (
                  data.items.map((l) => (
                    <ListingRow
                      key={l.id}
                      listing={l}
                      selected={selected.has(l.id)}
                      onToggleSelect={() => toggleSelected(l.id)}
                      onDelete={() => setConfirmDelete(l)}
                      onDuplicate={() => handleDuplicate(l)}
                      onShare={() => setShareListing(l)}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      Henüz ilan yok. <Link href="/listings/new" className="text-[#C9A96E] hover:underline">İlk ilanı ekle</Link>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İlanı sil</DialogTitle>
            <DialogDescription>
              <strong>{confirmDelete?.titleTr}</strong> ilanı kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Evet, sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected.size} ilanı sil</DialogTitle>
            <DialogDescription>
              Seçili <strong>{selected.size}</strong> ilan kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmBulkDelete(false)}>
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Evet, hepsini sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SocialPostDialog
        open={!!shareListing}
        onOpenChange={(o) => !o && setShareListing(null)}
        listing={shareListing}
      />

      <BulkImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        onImported={() => {
          setBulkImportOpen(false);
          fetchListings();
        }}
      />
    </>
  );
}

interface BulkImportResult {
  total: number;
  created: number;
  failed: number;
  results: Array<{
    row: number;
    ok: boolean;
    id?: string;
    slug?: string;
    titleTr?: string;
    error?: string;
  }>;
}

interface BulkTemplateResponse {
  filename: string;
  contentType: string;
  content: string;
  headers: string[];
}

function BulkImportDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImported: () => void;
}) {
  const [csv, setCsv] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<BulkImportResult | null>(null);

  React.useEffect(() => {
    if (!open) {
      setCsv("");
      setResult(null);
    }
  }, [open]);

  const downloadTemplate = async () => {
    try {
      const res = await api<BulkTemplateResponse>(
        `/api/admin/listings/bulk/template`,
      );
      const blob = new Blob([res.content], { type: res.contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Şablon indirilemedi");
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsv(text);
  };

  const submit = async () => {
    if (!csv.trim()) {
      toast.error("CSV boş");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api<BulkImportResult>(`/api/admin/listings/bulk/import`, {
        method: "POST",
        body: { csv },
      });
      setResult(res);
      if (res.failed === 0) {
        toast.success(`${res.created} ilan oluşturuldu`);
      } else {
        toast.warning(`${res.created} oluşturuldu · ${res.failed} hatalı`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İçe aktarım başarısız");
    } finally {
      setSubmitting(false);
    }
  };

  const previewRowCount = csv.trim()
    ? Math.max(0, csv.trim().split(/\r?\n/).length - 1)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Toplu İlan Yükle</DialogTitle>
          <DialogDescription>
            CSV dosyası ile toplu ilan oluşturun. Görsel URL&apos;leri
            <code className="mx-1 px-1 bg-muted rounded text-[11px]">imageUrls</code>
            sütununda noktalı virgülle ayrılır.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="gap-2"
              >
                <Download className="h-3.5 w-3.5" /> Şablon İndir (CSV)
              </Button>
              <label className="inline-flex items-center gap-2 text-xs cursor-pointer border rounded-md px-3 py-2 hover:bg-muted">
                <Upload className="h-3.5 w-3.5" /> Dosya seç
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={onFile}
                  className="hidden"
                />
              </label>
              {previewRowCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {previewRowCount} satır
                </span>
              )}
            </div>

            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              placeholder="Şablonu indirip doldurun, ya da CSV içeriğini buraya yapıştırın…"
              rows={10}
              className="w-full font-mono text-[11px] border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/30"
            />

            <p className="text-[11px] text-muted-foreground">
              Zorunlu sütunlar: <code>titleTr</code>, <code>price</code>. Diğerleri opsiyonel.
              Örnek görsel URL&apos;leri: <code>https://...jpg;https://...jpg</code>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="border rounded-md p-3">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Toplam</p>
                <p className="text-2xl font-medium">{result.total}</p>
              </div>
              <div className="border rounded-md p-3 bg-emerald-50 border-emerald-200">
                <p className="text-[11px] text-emerald-700 uppercase tracking-wider">Oluşturuldu</p>
                <p className="text-2xl font-medium text-emerald-700">{result.created}</p>
              </div>
              <div className="border rounded-md p-3 bg-red-50 border-red-200">
                <p className="text-[11px] text-red-700 uppercase tracking-wider">Hatalı</p>
                <p className="text-2xl font-medium text-red-700">{result.failed}</p>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto border rounded-md">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Satır</th>
                    <th className="px-2 py-1.5 text-left">Durum</th>
                    <th className="px-2 py-1.5 text-left">Detay</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r) => (
                    <tr key={r.row} className="border-t">
                      <td className="px-2 py-1.5 font-mono">{r.row}</td>
                      <td className="px-2 py-1.5">
                        {r.ok ? (
                          <span className="text-emerald-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        {r.ok ? r.titleTr : <span className="text-red-600">{r.error}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          {!result ? (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button
                onClick={submit}
                disabled={submitting || !csv.trim()}
                className="bg-[#14141A] hover:bg-black text-white gap-2"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                İçe Aktar
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setResult(null)}>
                Yeni Yükleme
              </Button>
              <Button
                onClick={onImported}
                className="bg-[#14141A] hover:bg-black text-white"
              >
                Kapat
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ListingRow({
  listing,
  selected,
  onToggleSelect,
  onDelete,
  onDuplicate,
  onShare,
}: {
  listing: Listing;
  selected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onShare: () => void;
}) {
  const router = useRouter();
  const cover = listing.images.find((i) => i.isPrimary)?.url ?? listing.images[0]?.url;
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <TableRow
      data-state={selected ? "selected" : undefined}
      onClick={() => router.push(`/listings/${listing.id}`)}
      className="cursor-pointer hover:bg-muted/40 transition-colors"
    >
      <TableCell onClick={stop}>
        <input
          type="checkbox"
          className="cursor-pointer"
          checked={selected}
          onChange={onToggleSelect}
        />
      </TableCell>
      <TableCell>
        <div className="relative h-14 w-14 shrink-0">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              className="h-14 w-14 rounded object-cover border border-border bg-muted"
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = "none";
                const fb = img.nextElementSibling as HTMLElement | null;
                if (fb) fb.style.display = "flex";
              }}
            />
          )}
          <div
            className="h-14 w-14 rounded border border-dashed border-border items-center justify-center text-muted-foreground"
            style={{ display: cover ? "none" : "flex" }}
          >
            <ImageOff className="h-4 w-4" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {listing.featured && <Star className="h-3.5 w-3.5 fill-[#C9A96E] text-[#C9A96E] shrink-0" />}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate max-w-[280px]">{listing.titleTr}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[280px]">{listing.titleEn}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p className="text-sm">{listing.city ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{listing.district ?? ""}</p>
      </TableCell>
      <TableCell className="text-right">
        <p className="text-sm font-medium">{formatCurrency(listing.price, listing.currency)}</p>
        <p className="text-[10px] uppercase text-muted-foreground">
          {listing.type === "SALE" ? "Satılık" : "Kiralık"}
        </p>
      </TableCell>
      <TableCell>
        <Badge variant={STATUS_COLOR[listing.status] ?? "default"} className="text-[10px]">
          {STATUS_LABEL[listing.status] ?? listing.status}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" /> {listing.views}
        </span>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{formatDate(listing.createdAt)}</TableCell>
      <TableCell className="text-right" onClick={stop}>
        <div className="flex justify-end gap-1">
          <Button asChild size="icon" variant="ghost" title="Düzenle">
            <Link href={`/listings/${listing.id}`}>
              <Edit3 className="h-4 w-4" />
            </Link>
          </Button>
          {listing.lat != null && listing.lng != null ? (
            <Button
              asChild
              size="icon"
              variant="ghost"
              title="Yol tarifi (Google Maps)"
            >
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Navigation className="h-4 w-4 text-emerald-600" />
              </a>
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              title="Konum yok — Düzenle ekranında lat/lng ekle"
              disabled
            >
              <MapPin className="h-4 w-4 text-muted-foreground/40" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            title="Paylaş (AI sosyal medya)"
          >
            <Share2 className="h-4 w-4 text-[#C9A96E]" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Klonla"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Sil"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

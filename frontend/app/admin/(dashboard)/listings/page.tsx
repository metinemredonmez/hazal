"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Eye, Star, Edit3, Trash2, ImageOff } from "lucide-react";
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
          <Button asChild className="bg-[#14141A] hover:bg-black text-white gap-2 h-10">
            <Link href="/admin/listings/new">
              <Plus className="h-4 w-4" /> Yeni İlan
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16"></TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Konum</TableHead>
                  <TableHead className="text-right">Fiyat</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Görüntülenme</TableHead>
                  <TableHead>Eklendi</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data && data.items.length > 0 ? (
                  data.items.map((l) => <ListingRow key={l.id} listing={l} onDelete={() => setConfirmDelete(l)} />)
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      Henüz ilan yok. <Link href="/admin/listings/new" className="text-[#C9A96E] hover:underline">İlk ilanı ekle</Link>
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
    </>
  );
}

function ListingRow({ listing, onDelete }: { listing: Listing; onDelete: () => void }) {
  const cover = listing.images.find((i) => i.isPrimary)?.url ?? listing.images[0]?.url;
  return (
    <TableRow>
      <TableCell>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-12 w-16 rounded object-cover border border-border" />
        ) : (
          <div className="h-12 w-16 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground">
            <ImageOff className="h-4 w-4" />
          </div>
        )}
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
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button asChild size="icon" variant="ghost">
            <Link href={`/admin/listings/${listing.id}`}>
              <Edit3 className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

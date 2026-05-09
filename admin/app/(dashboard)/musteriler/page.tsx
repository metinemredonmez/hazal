"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Edit3,
  Trash2,
  Loader2,
  UserCircle,
  Users,
} from "lucide-react";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { confirmDialog } from "@/components/admin/confirm-dialog";

type Status = "LEAD" | "ACTIVE" | "CLIENT" | "INACTIVE" | "LOST";
type Source = "WEB" | "REFERRAL" | "SOCIAL" | "PHONE" | "WALK_IN" | "PARTNER" | "OTHER";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  status: Status;
  source: Source;
  budget: string | null;
  budgetCurrency: string | null;
  preferences: string | null;
  interestedIn: string[];
  districts: string[];
  score: number;
  tags: string[];
  notes: string | null;
  createdAt: string;
  _count?: { inquiries: number; appointments: number };
}

interface ListResp {
  items: Customer[];
  total: number;
}

interface Stats {
  total: number;
  byStatus: Array<{ status: Status; count: number }>;
}

const STATUS_LABEL: Record<Status, string> = {
  LEAD: "Aday",
  ACTIVE: "Aktif",
  CLIENT: "Müşteri",
  INACTIVE: "Pasif",
  LOST: "Kayıp",
};
const STATUS_COLOR: Record<Status, string> = {
  LEAD: "bg-blue-50 text-blue-700",
  ACTIVE: "bg-amber-50 text-amber-700",
  CLIENT: "bg-emerald-50 text-emerald-700",
  INACTIVE: "bg-gray-50 text-gray-600",
  LOST: "bg-red-50 text-red-700",
};

export default function MusterilerPage() {
  const [data, setData] = React.useState<ListResp | null>(null);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<Status | "ALL">("ALL");
  const [editing, setEditing] = React.useState<Customer | null>(null);
  const [creating, setCreating] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ pageSize: "100" });
      if (filter !== "ALL") sp.set("status", filter);
      if (search.trim()) sp.set("search", search.trim());
      const [list, s] = await Promise.all([
        api<ListResp>(`/api/admin/customers?${sp}`),
        api<Stats>("/api/admin/customers/stats"),
      ]);
      setData(list);
      setStats(s);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function deleteCustomer(id: string) {
    if (
      !(await confirmDialog({
        title: "Müşteriyi sil?",
        description: "Müşterinin tüm bilgileri silinecek. Geri alınamaz.",
        confirmLabel: "Sil",
        variant: "danger",
      }))
    )
      return;
    try {
      await api(`/api/admin/customers/${id}`, { method: "DELETE" });
      toast.success("Silindi");
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata");
    }
  }

  return (
    <>
      <Topbar
        title="Müşteriler"
        description="Müşteri profilleri, geçmiş, skoring"
      />
      <main className="flex-1 px-4 py-5 space-y-4 animate-fade-up">
        {/* Stats */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={
              "text-left p-3 rounded-md border transition-colors " +
              (filter === "ALL"
                ? "border-[#C9A96E] bg-[#C9A96E]/10"
                : "border-border bg-white hover:bg-muted/30")
            }
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Toplam</p>
            <p className="text-2xl font-light">{stats?.total ?? "—"}</p>
          </button>
          {(["LEAD", "ACTIVE", "CLIENT", "INACTIVE", "LOST"] as Status[]).map((s) => {
            const count = stats?.byStatus.find((b) => b.status === s)?.count ?? 0;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={
                  "text-left p-3 rounded-md border transition-colors " +
                  (filter === s
                    ? "border-[#C9A96E] bg-[#C9A96E]/10"
                    : "border-border bg-white hover:bg-muted/30")
                }
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {STATUS_LABEL[s]}
                </p>
                <p className="text-2xl font-light mt-1">{count}</p>
              </button>
            );
          })}
        </div>

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="İsim, telefon, e-posta..."
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button
            onClick={() => setCreating(true)}
            className="bg-[#14141A] hover:bg-black text-white gap-2"
          >
            <Plus className="h-3.5 w-3.5" /> Müşteri Ekle
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-10 w-10 mx-auto opacity-30 mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">Henüz müşteri yok</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setCreating(true)}
                className="text-[#C9A96E]"
              >
                İlk müşteriyi ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {data.items.map((c) => (
              <Card key={c.id} className="hover:border-[#C9A96E] transition-colors">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <UserCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{c.name}</p>
                      <span
                        className={
                          "text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider " +
                          STATUS_COLOR[c.status]
                        }
                      >
                        {STATUS_LABEL[c.status]}
                      </span>
                      {c.score > 0 && (
                        <span className="text-[10px] text-[#C9A96E]">★ {c.score}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="hover:text-[#C9A96E] flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {c.phone}
                        </a>
                      )}
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="hover:text-[#C9A96E] flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {c.email}
                        </a>
                      )}
                      {c._count && (
                        <span className="text-[11px]">
                          {c._count.inquiries} talep · {c._count.appointments} randevu
                        </span>
                      )}
                    </div>
                    {c.preferences && (
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                        💭 {c.preferences}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(c)}
                      className="h-8 px-2"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCustomer(c.id)}
                      className="h-8 px-2 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {(creating || editing) && (
        <CustomerDialog
          existing={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            refresh();
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function CustomerDialog({
  existing,
  onClose,
  onSaved,
}: {
  existing: Customer | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    name: existing?.name ?? "",
    email: existing?.email ?? "",
    phone: existing?.phone ?? "",
    whatsapp: existing?.whatsapp ?? "",
    status: existing?.status ?? ("LEAD" as Status),
    source: existing?.source ?? ("WEB" as Source),
    budget: existing?.budget ?? "",
    budgetCurrency: existing?.budgetCurrency ?? "TRY",
    preferences: existing?.preferences ?? "",
    notes: existing?.notes ?? "",
    tags: existing?.tags?.join(", ") ?? "",
  });
  const [saving, setSaving] = React.useState(false);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("İsim zorunlu");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      whatsapp: form.whatsapp || undefined,
      status: form.status,
      source: form.source,
      budget: form.budget ? parseFloat(form.budget as string) : undefined,
      budgetCurrency: form.budgetCurrency,
      preferences: form.preferences || undefined,
      notes: form.notes || undefined,
      tags: form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };
    try {
      if (existing) {
        await api(`/api/admin/customers/${existing.id}`, { method: "PATCH", body: payload });
        toast.success("Güncellendi");
      } else {
        await api("/api/admin/customers", { method: "POST", body: payload });
        toast.success("Müşteri oluşturuldu");
      }
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Müşteriyi Düzenle" : "Yeni Müşteri"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label className="text-xs">İsim *</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">E-posta</Label>
              <Input value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Telefon</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">WhatsApp</Label>
              <Input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bütçe</Label>
              <Input
                type="number"
                value={form.budget as string}
                onChange={(e) => update("budget", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Durum</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v as Status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Kaynak</Label>
              <Select value={form.source} onValueChange={(v) => update("source", v as Source)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEB">Web</SelectItem>
                  <SelectItem value="REFERRAL">Referans</SelectItem>
                  <SelectItem value="SOCIAL">Sosyal Medya</SelectItem>
                  <SelectItem value="PHONE">Telefon</SelectItem>
                  <SelectItem value="WALK_IN">Walk-in</SelectItem>
                  <SelectItem value="PARTNER">Partner</SelectItem>
                  <SelectItem value="OTHER">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tercihler / İhtiyaç</Label>
            <Textarea
              value={form.preferences}
              onChange={(e) => update("preferences", e.target.value)}
              rows={2}
              placeholder="3+1, deniz manzaralı, Bebek/Etiler"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Etiketler (virgülle)</Label>
            <Input
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              placeholder="vip, sıcak, yatırımcı"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notlar</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#14141A] text-white gap-2">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
  Star,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  altPhone: string | null;
  email: string | null;
  company: string | null;
  role: string | null;
  category: string | null;
  notes: string | null;
  tags: string[];
  favorite: boolean;
}

interface ListResp {
  items: Contact[];
  total: number;
}

const COMMON_CATEGORIES = ["Resmi", "Avukat", "Müteahhit", "Tapu", "Banka", "Bakım", "Hizmet", "Diğer"];

export default function RehberPage() {
  const [data, setData] = React.useState<ListResp | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<string | "ALL" | "FAVORITES">("ALL");
  const [editing, setEditing] = React.useState<Contact | null>(null);
  const [creating, setCreating] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ pageSize: "200" });
      if (filter === "FAVORITES") sp.set("favorite", "true");
      else if (filter !== "ALL") sp.set("category", filter);
      if (search.trim()) sp.set("search", search.trim());
      const list = await api<ListResp>(`/api/admin/contacts?${sp}`);
      setData(list);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function toggleFavorite(c: Contact) {
    try {
      await api(`/api/admin/contacts/${c.id}`, {
        method: "PATCH",
        body: { favorite: !c.favorite },
      });
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata");
    }
  }

  async function deleteContact(id: string) {
    if (!confirm("Sil?")) return;
    try {
      await api(`/api/admin/contacts/${id}`, { method: "DELETE" });
      toast.success("Silindi");
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata");
    }
  }

  return (
    <>
      <Topbar
        title="Rehber"
        description="Avukat, müteahhit, tapu memuru, hizmet sağlayıcılar — hızlı erişim"
      />
      <main className="flex-1 px-4 py-5 space-y-4 animate-fade-up">
        {/* Filter chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter("ALL")}
            className={
              "px-3 py-1.5 text-xs rounded-full border transition-colors " +
              (filter === "ALL"
                ? "bg-[#14141A] text-white border-[#14141A]"
                : "bg-white border-border hover:border-[#C9A96E]")
            }
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter("FAVORITES")}
            className={
              "px-3 py-1.5 text-xs rounded-full border transition-colors flex items-center gap-1 " +
              (filter === "FAVORITES"
                ? "bg-[#C9A96E] text-white border-[#C9A96E]"
                : "bg-white border-border hover:border-[#C9A96E]")
            }
          >
            <Star className="h-3 w-3" /> Favoriler
          </button>
          {COMMON_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={
                "px-3 py-1.5 text-xs rounded-full border transition-colors " +
                (filter === c
                  ? "bg-[#14141A] text-white border-[#14141A]"
                  : "bg-white border-border hover:border-[#C9A96E]")
              }
            >
              {c}
            </button>
          ))}
        </div>

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="İsim, telefon, kurum, görev..."
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button
            onClick={() => setCreating(true)}
            className="bg-[#14141A] hover:bg-black text-white gap-2"
          >
            <Plus className="h-3.5 w-3.5" /> Kişi Ekle
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-10 w-10 mx-auto opacity-30 mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">Rehber boş</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setCreating(true)}
                className="text-[#C9A96E]"
              >
                İlk kişiyi ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.items.map((c) => (
              <Card key={c.id} className="hover:border-[#C9A96E] transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1 flex items-center gap-1.5">
                        {c.favorite && <Star className="h-3 w-3 text-[#C9A96E] fill-current" />}
                        {c.name}
                      </p>
                      {c.role && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{c.role}</p>
                      )}
                      {c.company && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          🏢 {c.company}
                        </p>
                      )}
                    </div>
                    {c.category && (
                      <span className="text-[10px] uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded">
                        {c.category}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="inline-flex items-center gap-1 text-xs bg-[#14141A] text-white px-2.5 py-1 rounded hover:bg-[#C9A96E]"
                      >
                        <Phone className="h-3 w-3" /> Ara
                      </a>
                    )}
                    {c.phone && (
                      <a
                        href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs border border-border px-2.5 py-1 rounded hover:border-[#C9A96E]"
                      >
                        <MessageCircle className="h-3 w-3" /> WA
                      </a>
                    )}
                    {c.email && (
                      <a
                        href={`mailto:${c.email}`}
                        className="inline-flex items-center gap-1 text-xs border border-border px-2.5 py-1 rounded hover:border-[#C9A96E]"
                      >
                        <Mail className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-border">
                    <button
                      onClick={() => toggleFavorite(c)}
                      className="text-[11px] text-muted-foreground hover:text-[#C9A96E]"
                    >
                      {c.favorite ? "★ Çıkar" : "☆ Favorile"}
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditing(c)}
                        className="text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="h-3 w-3 inline" />
                      </button>
                      <button
                        onClick={() => deleteContact(c.id)}
                        className="text-[11px] text-muted-foreground hover:text-destructive ml-1"
                      >
                        <Trash2 className="h-3 w-3 inline" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {(creating || editing) && (
        <ContactDialog
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

function ContactDialog({
  existing,
  onClose,
  onSaved,
}: {
  existing: Contact | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    name: existing?.name ?? "",
    phone: existing?.phone ?? "",
    altPhone: existing?.altPhone ?? "",
    email: existing?.email ?? "",
    company: existing?.company ?? "",
    role: existing?.role ?? "",
    category: existing?.category ?? "",
    tags: existing?.tags?.join(", ") ?? "",
    notes: existing?.notes ?? "",
    favorite: existing?.favorite ?? false,
  });
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("İsim zorunlu");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      phone: form.phone || undefined,
      altPhone: form.altPhone || undefined,
      email: form.email || undefined,
      company: form.company || undefined,
      role: form.role || undefined,
      category: form.category || undefined,
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
        await api(`/api/admin/contacts/${existing.id}`, { method: "PATCH", body: payload });
      } else {
        await api("/api/admin/contacts", { method: "POST", body: payload });
      }
      toast.success("Kaydedildi");
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{existing ? "Kişiyi Düzenle" : "Yeni Kişi"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label className="text-xs">İsim *</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Telefon</Label>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Alt Telefon</Label>
              <Input value={form.altPhone} onChange={(e) => setForm((p) => ({ ...p, altPhone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">E-posta</Label>
              <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Kurum</Label>
              <Input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Görev</Label>
              <Input value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} placeholder="Avukat, müteahhit..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Kategori</Label>
              <Input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Resmi / Hizmet / Bakım" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Etiketler (virgülle)</Label>
            <Input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notlar</Label>
            <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={3} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.favorite}
              onChange={(e) => setForm((p) => ({ ...p, favorite: e.target.checked }))}
            />
            Favori
          </label>
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

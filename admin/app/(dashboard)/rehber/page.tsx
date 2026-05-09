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
  Upload,
  FileText,
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
import { confirmDialog } from "@/components/admin/confirm-dialog";

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
  const [importing, setImporting] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ pageSize: "100" });
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
    if (
      !(await confirmDialog({
        title: "Kişiyi sil?",
        description: "Bu kişi rehberden kalıcı olarak silinecek.",
        confirmLabel: "Sil",
        variant: "danger",
      }))
    )
      return;
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
          <div className="flex gap-2">
            <Button
              onClick={() => setImporting(true)}
              variant="outline"
              className="gap-2"
            >
              <Upload className="h-3.5 w-3.5" /> İçe Aktar
            </Button>
            <Button
              onClick={() => setCreating(true)}
              className="bg-[#14141A] hover:bg-black text-white gap-2"
            >
              <Plus className="h-3.5 w-3.5" /> Kişi Ekle
            </Button>
          </div>
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

      {importing && (
        <ImportDialog
          onClose={() => setImporting(false)}
          onDone={() => {
            setImporting(false);
            refresh();
          }}
        />
      )}
    </>
  );
}

interface ImportResult {
  imported: number;
  skipped: number;
  duplicates: number;
  errors: Array<{ row: number; reason: string }>;
}

function ImportDialog({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [format, setFormat] = React.useState<"csv" | "vcard">("csv");
  const [text, setText] = React.useState("");
  const [importing, setImporting] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setText(content);
      // Auto-detect format
      if (/BEGIN:VCARD/i.test(content)) setFormat("vcard");
      else setFormat("csv");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function runImport() {
    if (!text.trim()) {
      toast.error("İçerik boş");
      return;
    }
    setImporting(true);
    try {
      const r = await api<ImportResult>(
        `/api/admin/contacts/import/${format}`,
        { method: "POST", body: { text } },
      );
      setResult(r);
      if (r.imported > 0) {
        toast.success(`${r.imported} kişi içe aktarıldı`);
      } else {
        toast.warning("Hiç kişi eklenmedi");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📇 Rehbere İçe Aktar</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!result ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormat("csv")}
                  className={
                    "p-3 rounded-md border text-left transition-colors " +
                    (format === "csv"
                      ? "border-[#C9A96E] bg-[#C9A96E]/10"
                      : "border-border hover:bg-muted/30")
                  }
                >
                  <p className="text-xs font-medium">📊 CSV / Excel</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Excel'den dışa aktarılan
                  </p>
                </button>
                <button
                  onClick={() => setFormat("vcard")}
                  className={
                    "p-3 rounded-md border text-left transition-colors " +
                    (format === "vcard"
                      ? "border-[#C9A96E] bg-[#C9A96E]/10"
                      : "border-border hover:bg-muted/30")
                  }
                >
                  <p className="text-xs font-medium">📱 vCard (.vcf)</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    iPhone / Android rehber
                  </p>
                </button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Dosya Yükle</Label>
                <Input
                  type="file"
                  accept={format === "csv" ? ".csv,.txt" : ".vcf,.vcard"}
                  onChange={onFileSelect}
                  className="cursor-pointer"
                />
                <p className="text-[10px] text-muted-foreground">
                  Veya aşağıya doğrudan yapıştır.
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">İçerik</Label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  className="font-mono text-xs"
                  placeholder={
                    format === "csv"
                      ? "name,phone,email,company,role\nAhmet Yılmaz,+90 532 ...,ahmet@x.com,ABC Avukat,Avukat\n..."
                      : "BEGIN:VCARD\nVERSION:3.0\nFN:Ahmet Yılmaz\nTEL:+90...\nEND:VCARD\n..."
                  }
                />
              </div>

              {format === "csv" && (
                <div className="text-[11px] text-muted-foreground bg-muted/50 p-2 rounded">
                  💡 <strong>CSV ipuçları:</strong> İlk satır başlık olabilir
                  (name, phone, email, company, role, category, notes). Türkçe
                  başlık da çalışır (ad, telefon, eposta, şirket, görev).
                  Virgül, noktalı virgül veya tab ayırıcı kullanılabilir.
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-emerald-50 rounded text-center">
                  <p className="text-2xl font-light text-emerald-700">
                    {result.imported}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-emerald-700/70 mt-1">
                    Eklendi
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded text-center">
                  <p className="text-2xl font-light text-amber-700">
                    {result.duplicates}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-amber-700/70 mt-1">
                    Yinelenen
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded text-center">
                  <p className="text-2xl font-light text-red-700">
                    {result.skipped}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-red-700/70 mt-1">
                    Atlandı
                  </p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto p-2 bg-red-50 rounded">
                  <p className="text-[10px] font-medium text-red-700 uppercase tracking-wider">
                    Hatalar
                  </p>
                  {result.errors.slice(0, 20).map((e, i) => (
                    <p key={i} className="text-[11px] text-red-700">
                      Satır {e.row}: {e.reason}
                    </p>
                  ))}
                  {result.errors.length > 20 && (
                    <p className="text-[10px] text-red-700/70 mt-1">
                      ... ve {result.errors.length - 20} tane daha
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {result ? (
            <Button onClick={onDone} className="bg-[#14141A] text-white">
              Tamam
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={importing}>
                İptal
              </Button>
              <Button
                onClick={runImport}
                disabled={importing || !text.trim()}
                className="bg-[#14141A] text-white gap-2"
              >
                {importing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <FileText className="h-3.5 w-3.5" />
                İçe Aktar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

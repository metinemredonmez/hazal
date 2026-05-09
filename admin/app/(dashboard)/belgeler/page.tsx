"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Download,
  ExternalLink,
  Loader2,
  Plus,
  FileBadge,
  Image as ImageIcon,
  Building2,
  ScrollText,
  Receipt,
  FileImage,
  Files,
  Eye,
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
import { api, API_URL } from "@/lib/api";

type Category =
  | "CONTRACT"
  | "IDENTITY"
  | "DEED"
  | "BLUEPRINT"
  | "PHOTO"
  | "INVOICE"
  | "BROCHURE"
  | "OTHER";

interface Document {
  id: string;
  title: string;
  category: Category;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  description: string | null;
  listingId: string | null;
  inquiryId: string | null;
  customerName: string | null;
  tags: string[];
  createdAt: string;
  listing: { slug: string; titleTr: string } | null;
  inquiry: { name: string; email: string } | null;
}

interface DocList {
  items: Document[];
  total: number;
}

interface Stats {
  total: number;
  byCategory: Array<{ category: Category; count: number }>;
}

const CATEGORY_META: Record<
  Category,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  CONTRACT: { label: "Sözleşme", icon: ScrollText, color: "text-amber-600" },
  IDENTITY: { label: "Kimlik", icon: FileBadge, color: "text-blue-600" },
  DEED: { label: "Tapu", icon: Building2, color: "text-emerald-600" },
  BLUEPRINT: { label: "Mimari Plan", icon: FileImage, color: "text-purple-600" },
  PHOTO: { label: "Foto", icon: ImageIcon, color: "text-pink-600" },
  INVOICE: { label: "Fatura", icon: Receipt, color: "text-red-600" },
  BROCHURE: { label: "Brosür", icon: FileText, color: "text-indigo-600" },
  OTHER: { label: "Diğer", icon: Files, color: "text-gray-600" },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BelgelerPage() {
  const [data, setData] = React.useState<DocList | null>(null);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<Category | "ALL">("ALL");
  const [uploading, setUploading] = React.useState(false);
  const [previewing, setPreviewing] = React.useState<Document | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [templateOpen, setTemplateOpen] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ pageSize: "100" });
      if (filter !== "ALL") sp.set("category", filter);
      if (search.trim()) sp.set("search", search.trim());
      const [list, s] = await Promise.all([
        api<DocList>(`/api/admin/documents?${sp}`),
        api<Stats>("/api/admin/documents/stats"),
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

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    e.target.value = "";
  }

  async function deleteDoc(id: string) {
    if (!confirm("Bu belgeyi silmek istediğinden emin misin?")) return;
    try {
      await api(`/api/admin/documents/${id}`, { method: "DELETE" });
      toast.success("Silindi");
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata");
    }
  }

  return (
    <>
      <Topbar
        title="Belgeler"
        description="Sözleşme, tapu, kimlik, brosür, fatura vs. yükle ve organize et"
      />
      <main className="flex-1 px-4 py-5 space-y-4 animate-fade-up">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
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
          {(["CONTRACT", "DEED", "IDENTITY", "OTHER"] as const).map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            const count = stats?.byCategory.find((b) => b.category === cat)?.count ?? 0;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={
                  "text-left p-3 rounded-md border transition-colors " +
                  (filter === cat
                    ? "border-[#C9A96E] bg-[#C9A96E]/10"
                    : "border-border bg-white hover:bg-muted/30")
                }
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {meta.label}
                  </p>
                  <Icon className={"h-3.5 w-3.5 " + meta.color} />
                </div>
                <p className="text-2xl font-light mt-1">{count}</p>
              </button>
            );
          })}
        </div>

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Başlık, müşteri, etiket..."
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as Category | "ALL")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm kategoriler</SelectItem>
                {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_META[c].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx,.xls,.xlsx"
              onChange={handleFileSelect}
            />
            <Button
              onClick={() => setTemplateOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <ScrollText className="h-3.5 w-3.5" />
              Şablondan Oluştur
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-[#14141A] hover:bg-black text-white gap-2"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Belge Yükle
            </Button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-10 w-10 mx-auto opacity-30 mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">Henüz belge yok</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#C9A96E]"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                İlk belgeyi yükle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.items.map((d) => {
              const meta = CATEGORY_META[d.category];
              const Icon = meta.icon;
              const fullUrl = d.fileUrl.startsWith("http")
                ? d.fileUrl
                : `${API_URL}${d.fileUrl}`;
              const isImage = d.mimeType.startsWith("image/");
              return (
                <Card
                  key={d.id}
                  onClick={() => setPreviewing(d)}
                  className="hover:border-[#C9A96E] transition-colors group cursor-pointer"
                >
                  <CardContent className="p-3 flex gap-3">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fullUrl}
                        alt={d.title}
                        className="w-16 h-16 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-muted flex items-center justify-center shrink-0">
                        <Icon className={"h-6 w-6 " + meta.color} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" className="text-[10px]">
                          {meta.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {formatSize(d.fileSize)}
                        </span>
                      </div>
                      <p className="text-sm font-medium line-clamp-1">{d.title}</p>
                      {d.customerName && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          👤 {d.customerName}
                        </p>
                      )}
                      {d.listing && (
                        <p className="text-[11px] text-[#C9A96E] line-clamp-1">
                          🏠 {d.listing.titleTr}
                        </p>
                      )}
                      {d.tags && d.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {d.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] bg-muted px-1.5 py-0.5 rounded"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <button
                          onClick={() => setPreviewing(d)}
                          className="text-xs text-muted-foreground hover:text-[#C9A96E] inline-flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" /> Önizle
                        </button>
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground hover:text-[#C9A96E] inline-flex items-center gap-1 ml-2"
                        >
                          <ExternalLink className="h-3 w-3" /> Aç
                        </a>
                        <a
                          href={fullUrl}
                          download={d.fileName}
                          className="text-xs text-muted-foreground hover:text-[#C9A96E] inline-flex items-center gap-1 ml-2"
                        >
                          <Download className="h-3 w-3" /> İndir
                        </a>
                        <button
                          onClick={() => deleteDoc(d.id)}
                          className="text-xs text-muted-foreground hover:text-destructive ml-auto"
                        >
                          <Trash2 className="h-3 w-3 inline" /> Sil
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {pendingFile && (
        <UploadDialog
          file={pendingFile}
          onClose={() => setPendingFile(null)}
          onSaved={() => {
            setPendingFile(null);
            refresh();
          }}
          uploading={uploading}
          setUploading={setUploading}
        />
      )}

      {previewing && (
        <PreviewDialog
          doc={previewing}
          onClose={() => setPreviewing(null)}
          onSaved={() => {
            setPreviewing(null);
            refresh();
          }}
          onDelete={async () => {
            await deleteDoc(previewing.id);
            setPreviewing(null);
          }}
        />
      )}

      {templateOpen && <TemplatePickerDialog onClose={() => setTemplateOpen(false)} />}
    </>
  );
}

interface DocTemplate {
  id: string;
  name: string;
  category: Category;
  description: string | null;
  variables: Array<{ key: string; label: string; type: string; default?: string }>;
}

function TemplatePickerDialog({ onClose }: { onClose: () => void }) {
  const [templates, setTemplates] = React.useState<DocTemplate[]>([]);
  const [selected, setSelected] = React.useState<DocTemplate | null>(null);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [rendering, setRendering] = React.useState(false);

  React.useEffect(() => {
    api<DocTemplate[]>("/api/admin/documents/templates")
      .then((list) => setTemplates(list))
      .catch(() => toast.error("Şablonlar yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  function selectTemplate(t: DocTemplate) {
    setSelected(t);
    const initial: Record<string, string> = {};
    t.variables?.forEach((v) => {
      initial[v.key] = v.default ?? "";
    });
    setValues(initial);
  }

  async function generate() {
    if (!selected) return;
    setRendering(true);
    try {
      const { html } = await api<{ html: string }>(
        `/api/admin/documents/templates/${selected.id}/render`,
        { method: "POST", body: { values } },
      );
      // Open in new window for printing
      const win = window.open("", "_blank");
      if (!win) {
        toast.error("Pop-up engellendi. Tarayıcı ayarlarından izin ver.");
        return;
      }
      win.document.write(`<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>${selected.name}</title></head><body>${html}<script>setTimeout(()=>window.print(),500);</script></body></html>`);
      win.document.close();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setRendering(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selected ? `Doldur: ${selected.name}` : "Şablondan Belge Oluştur"}
          </DialogTitle>
        </DialogHeader>

        {!selected && (
          <div className="space-y-2 py-2">
            {loading ? (
              <Skeleton className="h-32" />
            ) : templates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Henüz şablon yok. Server'da seed çalıştır:
                <br />
                <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                  npx tsx prisma/seed-document-templates.ts
                </code>
              </p>
            ) : (
              templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTemplate(t)}
                  className="w-full text-left p-3 border border-border hover:border-[#C9A96E] rounded-md transition-colors"
                >
                  <p className="text-sm font-medium">{t.name}</p>
                  {t.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.description}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {t.variables?.length ?? 0} alan dolduracaksın
                  </p>
                </button>
              ))
            )}
          </div>
        )}

        {selected && (
          <div className="space-y-2 py-2">
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Şablon değiştir
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selected.variables?.map((v) => (
                <div key={v.key} className="space-y-1">
                  <Label className="text-xs">{v.label}</Label>
                  {v.type === "date" ? (
                    <Input
                      type="date"
                      value={values[v.key] ?? ""}
                      onChange={(e) =>
                        setValues((p) => ({ ...p, [v.key]: e.target.value }))
                      }
                    />
                  ) : v.type === "number" || v.type === "currency" ? (
                    <Input
                      type="number"
                      value={values[v.key] ?? ""}
                      onChange={(e) =>
                        setValues((p) => ({ ...p, [v.key]: e.target.value }))
                      }
                    />
                  ) : v.type === "address" ? (
                    <Textarea
                      rows={2}
                      value={values[v.key] ?? ""}
                      onChange={(e) =>
                        setValues((p) => ({ ...p, [v.key]: e.target.value }))
                      }
                    />
                  ) : (
                    <Input
                      value={values[v.key] ?? ""}
                      onChange={(e) =>
                        setValues((p) => ({ ...p, [v.key]: e.target.value }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              💡 İpucu: "Oluştur ve Yazdır" butonuna basınca yeni sekmede belge
              açılır, hemen yazdır veya Cmd+P → "PDF olarak kaydet" ile PDF al.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          {selected && (
            <Button
              onClick={generate}
              disabled={rendering}
              className="bg-[#14141A] text-white gap-2"
            >
              {rendering && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Oluştur ve Yazdır
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadDialog({
  file,
  onClose,
  onSaved,
  uploading,
  setUploading,
}: {
  file: File;
  onClose: () => void;
  onSaved: () => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
}) {
  const [title, setTitle] = React.useState(
    file.name.replace(/\.[^/.]+$/, "").slice(0, 100),
  );
  const [category, setCategory] = React.useState<Category>("CONTRACT");
  const [description, setDescription] = React.useState("");
  const [customerName, setCustomerName] = React.useState("");
  const [tags, setTags] = React.useState("");

  async function handleUpload() {
    if (!title.trim()) {
      toast.error("Başlık gerekli");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    fd.append("category", category);
    if (description) fd.append("description", description);
    if (customerName) fd.append("customerName", customerName);
    if (tags) fd.append("tags", tags);
    try {
      await api("/api/admin/documents/upload", { method: "POST", body: fd });
      toast.success("Belge yüklendi");
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Belge Yükle</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
            📎 {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Başlık *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bebek satış sözleşmesi"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Kategori *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_META[c].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Müşteri (opsiyonel)</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ahmet Yılmaz"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Etiketler (virgülle)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="acil, imzasız, 2026"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Açıklama</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            İptal
          </Button>
          <Button onClick={handleUpload} disabled={uploading} className="bg-[#14141A] text-white gap-2">
            {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Yükle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreviewDialog({
  doc,
  onClose,
  onSaved,
  onDelete,
}: {
  doc: Document;
  onClose: () => void;
  onSaved: () => void;
  onDelete: () => void | Promise<void>;
}) {
  const [title, setTitle] = React.useState(doc.title);
  const [category, setCategory] = React.useState<Category>(doc.category);
  const [description, setDescription] = React.useState(doc.description ?? "");
  const [customerName, setCustomerName] = React.useState(doc.customerName ?? "");
  const [tags, setTags] = React.useState((doc.tags ?? []).join(", "));
  const [saving, setSaving] = React.useState(false);
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);
  const [previewError, setPreviewError] = React.useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = React.useState(false);

  const fullUrl = doc.fileUrl.startsWith("http")
    ? doc.fileUrl
    : `${API_URL}${doc.fileUrl}`;
  const mime = doc.mimeType || "";
  const isImage = mime.startsWith("image/");
  const isPdf = mime === "application/pdf" || /\.pdf$/i.test(doc.fileName);
  const isHtml = mime === "text/html" || /\.html?$/i.test(doc.fileName);
  const isOffice = /(officedocument|msword|excel|spreadsheet)/i.test(mime);
  const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;

  // Fetch the file and convert to a blob URL so the iframe is same-origin
  // (avoids X-Frame-Options / CORP / cross-subdomain blocks). Fallback to
  // the "open externally" UI if fetch fails (e.g. server SSL issues).
  React.useEffect(() => {
    if (!isPdf && !isHtml) return;
    let cancelled = false;
    let url: string | null = null;
    setLoadingPreview(true);
    setPreviewError(null);
    fetch(fullUrl, { credentials: "omit" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((b) => {
        if (cancelled) return;
        url = URL.createObjectURL(b);
        setBlobUrl(url);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setPreviewError(err.message || "Önizleme yüklenemedi");
      })
      .finally(() => {
        if (!cancelled) setLoadingPreview(false);
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [fullUrl, isPdf, isHtml]);

  const dirty =
    title !== doc.title ||
    category !== doc.category ||
    (description ?? "") !== (doc.description ?? "") ||
    (customerName ?? "") !== (doc.customerName ?? "") ||
    tags !== (doc.tags ?? []).join(", ");

  async function handleSave() {
    setSaving(true);
    try {
      await api(`/api/admin/documents/${doc.id}`, {
        method: "PATCH",
        body: {
          title,
          category,
          description: description || undefined,
          customerName: customerName || undefined,
          tags: tags
            ? tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
        },
      });
      toast.success("Güncellendi");
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-4 py-3 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4 text-[#C9A96E]" />
            <span className="line-clamp-1">{doc.title}</span>
            <Badge variant="default" className="text-[10px] ml-2">
              {CATEGORY_META[doc.category].label}
            </Badge>
            <span className="text-[10px] text-muted-foreground ml-auto mr-6">
              {formatSize(doc.fileSize)} · {doc.fileName}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] min-h-0">
          {/* Preview */}
          <div className="bg-muted/40 flex items-center justify-center overflow-auto">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fullUrl}
                alt={doc.title}
                className="max-w-full max-h-full object-contain"
              />
            ) : isPdf || isHtml ? (
              loadingPreview ? (
                <div className="text-center text-sm text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#C9A96E]" />
                  Önizleme yükleniyor…
                </div>
              ) : previewError ? (
                <div className="text-center p-8 max-w-md">
                  <FileText className="h-16 w-16 mx-auto opacity-30 mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Önizleme yüklenemedi.
                  </p>
                  <p className="text-[11px] text-muted-foreground mb-4">{previewError}</p>
                  <div className="flex gap-2 justify-center">
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm inline-flex items-center gap-1 px-3 py-2 bg-white border rounded-md hover:bg-muted"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Yeni sekmede aç
                    </a>
                    <a
                      href={fullUrl}
                      download={doc.fileName}
                      className="text-sm inline-flex items-center gap-1 px-3 py-2 bg-white border rounded-md hover:bg-muted"
                    >
                      <Download className="h-3.5 w-3.5" /> İndir
                    </a>
                  </div>
                </div>
              ) : blobUrl ? (
                <iframe
                  src={blobUrl}
                  title={doc.title}
                  className="w-full h-full border-0 bg-white"
                />
              ) : null
            ) : isOffice ? (
              <iframe
                src={officeUrl}
                title={doc.title}
                className="w-full h-full border-0 bg-white"
              />
            ) : (
              <div className="text-center p-8">
                <FileText className="h-16 w-16 mx-auto opacity-30 mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Bu dosya türü için inline önizleme yok.
                </p>
                <div className="flex gap-2 justify-center">
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm inline-flex items-center gap-1 px-3 py-2 bg-white border rounded-md hover:bg-muted"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Yeni sekmede aç
                  </a>
                  <a
                    href={fullUrl}
                    download={doc.fileName}
                    className="text-sm inline-flex items-center gap-1 px-3 py-2 bg-white border rounded-md hover:bg-muted"
                  >
                    <Download className="h-3.5 w-3.5" /> İndir
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Edit sidebar */}
          <div className="border-t lg:border-t-0 lg:border-l border-border bg-white overflow-y-auto">
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  Bilgileri Düzenle
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Başlık</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Kategori</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_META[c].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Müşteri</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ahmet Yılmaz"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Etiketler</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="virgülle ayır"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Açıklama</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {doc.listing && (
                <div className="text-xs text-[#C9A96E] p-2 bg-[#C9A96E]/5 rounded border border-[#C9A96E]/20">
                  🏠 İlan: {doc.listing.titleTr}
                </div>
              )}
              {doc.inquiry && (
                <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                  ✉️ Talep: {doc.inquiry.name} · {doc.inquiry.email}
                </div>
              )}

              <div className="text-[10px] text-muted-foreground pt-2 border-t">
                Yükleme: {new Date(doc.createdAt).toLocaleString("tr-TR")}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-4 py-3 border-t shrink-0 flex-row !justify-between gap-2">
          <div className="flex gap-2">
            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs inline-flex items-center gap-1 px-3 py-2 border rounded-md hover:bg-muted"
            >
              <ExternalLink className="h-3 w-3" /> Aç
            </a>
            <a
              href={fullUrl}
              download={doc.fileName}
              className="text-xs inline-flex items-center gap-1 px-3 py-2 border rounded-md hover:bg-muted"
            >
              <Download className="h-3 w-3" /> İndir
            </a>
            <button
              onClick={onDelete}
              className="text-xs inline-flex items-center gap-1 px-3 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" /> Sil
            </button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} size="sm">
              Kapat
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !dirty}
              size="sm"
              className="bg-[#14141A] text-white gap-2"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {dirty ? "Değişiklikleri Kaydet" : "Kaydedildi"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Loader2,
  FileText,
  Newspaper,
  Video as VideoIcon,
  Sparkles,
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

interface BlogPost {
  id: string;
  slug: string;
  kind: "ARTICLE" | "PRESS" | "VIDEO";
  status: "DRAFT" | "PUBLISHED";
  titleTr: string;
  titleEn: string;
  excerptTr: string | null;
  excerptEn: string | null;
  bodyTr: string;
  bodyEn: string;
  coverImage: string | null;
  externalUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
}

const KIND_ICON = {
  ARTICLE: FileText,
  PRESS: Newspaper,
  VIDEO: VideoIcon,
};
const KIND_LABEL = {
  ARTICLE: "Yazı",
  PRESS: "Basın",
  VIDEO: "Video",
};

export default function BlogPage() {
  const [items, setItems] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<BlogPost | null>(null);
  const [creating, setCreating] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ items: BlogPost[] }>("/api/admin/blog?pageSize=100");
      setItems(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function deletePost(id: string) {
    if (
      !(await confirmDialog({
        title: "Yazıyı sil?",
        description: "Bu yazı kalıcı olarak silinecek. Geri alınamaz.",
        confirmLabel: "Sil",
        variant: "danger",
      }))
    )
      return;
    try {
      await api(`/api/admin/blog/${id}`, { method: "DELETE" });
      toast.success("Silindi");
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Silinemedi");
    }
  }

  return (
    <>
      <Topbar
        title="Blog & Medya"
        description="Yazılar, basın haberleri ve video turlar"
      />
      <main className="flex-1 px-4 py-5 space-y-4 animate-fade-up">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {items.length} kayıt · Web sitesi <code className="text-[11px]">/medya</code>{" "}
            sayfasında yayınlanır
          </p>
          <Button
            onClick={() => setCreating(true)}
            className="bg-[#14141A] hover:bg-black text-white gap-2"
          >
            <Plus className="h-3.5 w-3.5" /> Yeni Yazı
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-8 w-8 mx-auto opacity-30 mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground mb-3">Henüz yazı yok</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setCreating(true)}
                className="text-[#C9A96E]"
              >
                İlk yazıyı oluştur
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {items.map((p) => {
              const Icon = KIND_ICON[p.kind];
              return (
                <Card key={p.id} className="hover:border-[#C9A96E] transition-colors">
                  <CardContent className="p-3 flex items-center gap-3">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.coverImage}
                        alt=""
                        className="w-16 h-16 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={p.status === "PUBLISHED" ? "success" : "default"}>
                          {p.status === "PUBLISHED" ? "Yayında" : "Taslak"}
                        </Badge>
                        <span className="text-[10px] tracking-wider uppercase text-muted-foreground">
                          {KIND_LABEL[p.kind]}
                        </span>
                        {p.externalUrl && (
                          <a
                            href={p.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-[#C9A96E] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Dış link <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {p.titleTr}
                      </p>
                      {p.excerptTr && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {p.excerptTr}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(p)}
                        className="h-8 px-2"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePost(p.id)}
                        className="h-8 px-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {(creating || editing) && (
        <PostDialog
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

function PostDialog({
  existing,
  onClose,
  onSaved,
}: {
  existing: BlogPost | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    titleTr: existing?.titleTr ?? "",
    titleEn: existing?.titleEn ?? "",
    excerptTr: existing?.excerptTr ?? "",
    excerptEn: existing?.excerptEn ?? "",
    bodyTr: existing?.bodyTr ?? "",
    bodyEn: existing?.bodyEn ?? "",
    kind: existing?.kind ?? ("ARTICLE" as const),
    status: existing?.status ?? ("DRAFT" as const),
    coverImage: existing?.coverImage ?? "",
    externalUrl: existing?.externalUrl ?? "",
  });
  const [saving, setSaving] = React.useState(false);
  const [translating, setTranslating] = React.useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function translateField(field: "title" | "excerpt" | "body", from: "tr" | "en") {
    const target = from === "tr" ? "en" : "tr";
    const sourceKey = `${field}${from === "tr" ? "Tr" : "En"}` as keyof typeof form;
    const targetKey = `${field}${target === "tr" ? "Tr" : "En"}` as keyof typeof form;
    const text = (form[sourceKey] as string).trim();
    if (!text) {
      toast.error("Önce metni yaz");
      return;
    }
    setTranslating(`${field}-${from}`);
    try {
      const { text: translated } = await api<{ text: string }>("/api/admin/ai/translate", {
        method: "POST",
        body: { text, source: from, target },
      });
      update(targetKey, translated as never);
      toast.success(`AI çevirdi → ${target.toUpperCase()}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Çeviri başarısız");
    } finally {
      setTranslating(null);
    }
  }

  async function handleSave() {
    if (!form.titleTr || !form.titleEn) {
      toast.error("Başlık (TR + EN) zorunlu");
      return;
    }
    setSaving(true);
    const payload = {
      titleTr: form.titleTr,
      titleEn: form.titleEn,
      excerptTr: form.excerptTr || undefined,
      excerptEn: form.excerptEn || undefined,
      bodyTr: form.bodyTr,
      bodyEn: form.bodyEn,
      kind: form.kind,
      status: form.status,
      coverImage: form.coverImage || undefined,
      externalUrl: form.externalUrl || undefined,
    };
    try {
      if (existing) {
        await api(`/api/admin/blog/${existing.id}`, { method: "PATCH", body: payload });
        toast.success("Güncellendi");
      } else {
        await api("/api/admin/blog", { method: "POST", body: payload });
        toast.success("Oluşturuldu");
      }
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Yazıyı Düzenle" : "Yeni Yazı"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Tür</Label>
              <Select
                value={form.kind}
                onValueChange={(v) =>
                  update("kind", v as typeof form.kind)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARTICLE">Yazı</SelectItem>
                  <SelectItem value="PRESS">Basın</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Durum</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  update("status", v as typeof form.status)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Taslak</SelectItem>
                  <SelectItem value="PUBLISHED">Yayında</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(form.kind === "PRESS" || form.kind === "VIDEO") && (
            <div className="space-y-1">
              <Label className="text-xs">Dış Link</Label>
              <Input
                value={form.externalUrl}
                onChange={(e) => update("externalUrl", e.target.value)}
                placeholder={
                  form.kind === "VIDEO"
                    ? "https://www.youtube.com/watch?v=..."
                    : "https://gazete.com/yazi-url"
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Dış link verilirse web tarafında tıklanan kart direkt buraya yönlendirir.
              </p>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs">Kapak Foto URL</Label>
            <Input
              value={form.coverImage}
              onChange={(e) => update("coverImage", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <BiField
            label="Başlık"
            tr={form.titleTr}
            en={form.titleEn}
            onTr={(v) => update("titleTr", v)}
            onEn={(v) => update("titleEn", v)}
            translating={translating}
            onTranslate={(from) => translateField("title", from)}
            field="title"
            placeholderTr="Bebek'te yeni dönem..."
            placeholderEn="A new era in Bebek..."
          />

          <BiField
            label="Özet"
            tr={form.excerptTr}
            en={form.excerptEn}
            onTr={(v) => update("excerptTr", v)}
            onEn={(v) => update("excerptEn", v)}
            translating={translating}
            onTranslate={(from) => translateField("excerpt", from)}
            field="excerpt"
            multiline
            placeholderTr="2-3 cümlelik özet, listede görünür"
          />

          {form.kind === "ARTICLE" && (
            <BiField
              label="Yazı içeriği"
              tr={form.bodyTr}
              en={form.bodyEn}
              onTr={(v) => update("bodyTr", v)}
              onEn={(v) => update("bodyEn", v)}
              translating={translating}
              onTranslate={(from) => translateField("body", from)}
              field="body"
              multiline
              tall
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#14141A] text-white gap-2">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {existing ? "Güncelle" : "Oluştur"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BiField({
  label,
  tr,
  en,
  onTr,
  onEn,
  translating,
  onTranslate,
  field,
  multiline,
  tall,
  placeholderTr,
  placeholderEn,
}: {
  label: string;
  tr: string;
  en: string;
  onTr: (v: string) => void;
  onEn: (v: string) => void;
  translating: string | null;
  onTranslate: (from: "tr" | "en") => void;
  field: string;
  multiline?: boolean;
  tall?: boolean;
  placeholderTr?: string;
  placeholderEn?: string;
}) {
  const Field = multiline ? Textarea : Input;
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground/60">TR</span>
            <button
              type="button"
              onClick={() => onTranslate("tr")}
              disabled={translating !== null || !tr.trim()}
              className="inline-flex items-center gap-1 text-[10px] text-[#C9A96E] hover:underline disabled:opacity-40"
            >
              {translating === `${field}-tr` ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              EN'e çevir
            </button>
          </div>
          <Field
            value={tr}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onTr(e.target.value)
            }
            rows={tall ? 12 : multiline ? 3 : undefined}
            placeholder={placeholderTr}
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground/60">EN</span>
            <button
              type="button"
              onClick={() => onTranslate("en")}
              disabled={translating !== null || !en.trim()}
              className="inline-flex items-center gap-1 text-[10px] text-[#C9A96E] hover:underline disabled:opacity-40"
            >
              {translating === `${field}-en` ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              TR'ye çevir
            </button>
          </div>
          <Field
            value={en}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onEn(e.target.value)
            }
            rows={tall ? 12 : multiline ? 3 : undefined}
            placeholder={placeholderEn}
          />
        </div>
      </div>
    </div>
  );
}

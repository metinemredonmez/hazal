"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, Sparkles, Trash2, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, uploadFiles } from "@/lib/api";
import type { Listing } from "@/lib/types";
import Link from "next/link";

type FormState = {
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  price: string;
  currency: "TRY" | "USD" | "EUR";
  type: "SALE" | "RENT";
  category: "APARTMENT" | "VILLA" | "HOUSE" | "LAND" | "OFFICE" | "COMMERCIAL" | "OTHER";
  bedrooms: string;
  bathrooms: string;
  areaM2: string;
  city: string;
  district: string;
  address: string;
  yearBuilt: string;
  status: "DRAFT" | "ACTIVE" | "SOLD" | "RENTED" | "PASSIVE";
  featured: boolean;
  videoUrl: string;
  tourUrl: string;
};

const empty: FormState = {
  titleTr: "",
  titleEn: "",
  descriptionTr: "",
  descriptionEn: "",
  price: "",
  currency: "TRY",
  type: "SALE",
  category: "APARTMENT",
  bedrooms: "",
  bathrooms: "",
  areaM2: "",
  city: "",
  district: "",
  address: "",
  yearBuilt: "",
  status: "DRAFT",
  featured: false,
  videoUrl: "",
  tourUrl: "",
};

export function ListingForm({ existing }: { existing?: Listing }) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(() =>
    existing
      ? {
          titleTr: existing.titleTr,
          titleEn: existing.titleEn,
          descriptionTr: existing.descriptionTr,
          descriptionEn: existing.descriptionEn,
          price: String(existing.price ?? ""),
          currency: existing.currency,
          type: existing.type,
          category: existing.category,
          bedrooms: existing.bedrooms?.toString() ?? "",
          bathrooms: existing.bathrooms?.toString() ?? "",
          areaM2: existing.areaM2?.toString() ?? "",
          city: existing.city ?? "",
          district: existing.district ?? "",
          address: existing.address ?? "",
          yearBuilt: existing.yearBuilt?.toString() ?? "",
          status: existing.status,
          featured: existing.featured,
          videoUrl: existing.videoUrl ?? "",
          tourUrl: existing.tourUrl ?? "",
        }
      : empty,
  );
  const [images, setImages] = React.useState(existing?.images ?? []);
  const [submitting, setSubmitting] = React.useState(false);
  const [aiBullets, setAiBullets] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titleTr || !form.titleEn || !form.price) {
      toast.error("Başlık (TR/EN) ve fiyat zorunlu");
      return;
    }
    setSubmitting(true);
    const payload: Record<string, unknown> = {
      titleTr: form.titleTr,
      titleEn: form.titleEn,
      descriptionTr: form.descriptionTr,
      descriptionEn: form.descriptionEn,
      price: parseFloat(form.price),
      currency: form.currency,
      type: form.type,
      category: form.category,
      status: form.status,
      featured: form.featured,
    };
    if (form.bedrooms) payload.bedrooms = parseInt(form.bedrooms, 10);
    if (form.bathrooms) payload.bathrooms = parseInt(form.bathrooms, 10);
    if (form.areaM2) payload.areaM2 = parseFloat(form.areaM2);
    if (form.city) payload.city = form.city;
    if (form.district) payload.district = form.district;
    if (form.address) payload.address = form.address;
    if (form.yearBuilt) payload.yearBuilt = parseInt(form.yearBuilt, 10);
    if (form.videoUrl) payload.videoUrl = form.videoUrl;
    if (form.tourUrl) payload.tourUrl = form.tourUrl;

    try {
      if (existing) {
        await api(`/api/admin/listings/${existing.id}`, { method: "PATCH", body: payload });
        toast.success("İlan güncellendi");
      } else {
        const created = await api<Listing>("/api/admin/listings", {
          method: "POST",
          body: payload,
        });
        toast.success("İlan oluşturuldu");
        router.replace(`/admin/listings/${created.id}`);
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Kaydedilemedi";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAi() {
    const bullets = aiBullets
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (bullets.length === 0) {
      toast.error("AI için 1+ madde yaz");
      return;
    }
    setAiLoading(true);
    try {
      const res = await api<{
        titleTr: string;
        titleEn: string;
        descriptionTr: string;
        descriptionEn: string;
      }>("/api/admin/ai/generate-description", {
        method: "POST",
        body: {
          title: form.titleTr || form.titleEn || bullets[0],
          bullets,
          type: form.type,
          category: form.category,
          bedrooms: form.bedrooms ? parseInt(form.bedrooms, 10) : undefined,
          bathrooms: form.bathrooms ? parseInt(form.bathrooms, 10) : undefined,
          areaM2: form.areaM2 ? parseFloat(form.areaM2) : undefined,
          city: form.city || undefined,
          district: form.district || undefined,
          tone: "premium",
        },
      });
      setForm((prev) => ({
        ...prev,
        titleTr: res.titleTr,
        titleEn: res.titleEn,
        descriptionTr: res.descriptionTr,
        descriptionEn: res.descriptionEn,
      }));
      toast.success("AI içerik dolduruldu");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "AI başarısız";
      toast.error(message);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || !existing) return;
    setUploading(true);
    try {
      const result = await uploadFiles(
        `/api/admin/uploads/listings/${existing.id}/images`,
        Array.from(files),
      );
      const refreshed = await api<Listing>(`/api/admin/listings/${existing.id}`);
      setImages(refreshed.images);
      toast.success(`${result.length} foto yüklendi`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Yükleme başarısız";
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!existing) return;
    try {
      await api(`/api/admin/listings/${existing.id}/images/${imageId}`, { method: "DELETE" });
      setImages(images.filter((i) => i.id !== imageId));
      toast.success("Foto silindi");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Silinemedi";
      toast.error(message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/admin/listings">
            <ArrowLeft className="h-4 w-4" /> İlanlar
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Switch
            checked={form.featured}
            onCheckedChange={(v) => update("featured", v)}
            id="featured"
          />
          <Label htmlFor="featured" className="cursor-pointer flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-[#C9A96E]" />
            Öne çıkar
          </Label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Başlık & Açıklama</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-[#C9A96E]" /> AI yardımcı altta
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Başlık (TR) *</Label>
                  <Input value={form.titleTr} onChange={(e) => update("titleTr", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Başlık (EN) *</Label>
                  <Input value={form.titleEn} onChange={(e) => update("titleEn", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Açıklama (TR)</Label>
                  <Textarea
                    rows={6}
                    value={form.descriptionTr}
                    onChange={(e) => update("descriptionTr", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Açıklama (EN)</Label>
                  <Textarea
                    rows={6}
                    value={form.descriptionEn}
                    onChange={(e) => update("descriptionEn", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#C9A96E]/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#C9A96E]" />
                AI ile yaz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Maddeleri yaz, AI sana TR + EN başlık ve premium açıklama yazsın.
              </p>
              <Textarea
                rows={4}
                placeholder={"Boğaz manzarası\nYeni yapı\n2 banyo\nAkıllı ev sistemi"}
                value={aiBullets}
                onChange={(e) => setAiBullets(e.target.value)}
              />
              <Button
                type="button"
                variant="accent"
                onClick={handleAi}
                disabled={aiLoading}
                className="gap-2"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {aiLoading ? "Üretiliyor..." : "AI ile Doldur"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fotoğraflar</CardTitle>
            </CardHeader>
            <CardContent>
              {existing ? (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="relative aspect-[4/3] rounded-md border border-border overflow-hidden group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                        {img.isPrimary && (
                          <div className="absolute top-2 left-2 bg-[#C9A96E] text-[#14141A] text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded">
                            Ana
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      disabled={uploading}
                      className="aspect-[4/3] rounded-md border border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-[#C9A96E] hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <ImagePlus className="h-5 w-5" />
                      )}
                      <span className="text-xs">Foto ekle</span>
                    </button>
                  </div>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  İlanı kaydettikten sonra fotoğraf ekleyebilirsin.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detaylar</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Tip</Label>
                  <Select value={form.type} onValueChange={(v) => update("type", v as FormState["type"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SALE">Satılık</SelectItem>
                      <SelectItem value="RENT">Kiralık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Select value={form.category} onValueChange={(v) => update("category", v as FormState["category"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APARTMENT">Daire</SelectItem>
                      <SelectItem value="VILLA">Villa</SelectItem>
                      <SelectItem value="HOUSE">Müstakil ev</SelectItem>
                      <SelectItem value="LAND">Arsa</SelectItem>
                      <SelectItem value="OFFICE">Ofis</SelectItem>
                      <SelectItem value="COMMERCIAL">İş yeri</SelectItem>
                      <SelectItem value="OTHER">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-3">
                <div className="space-y-1.5 col-span-2">
                  <Label>Fiyat *</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Para</Label>
                  <Select value={form.currency} onValueChange={(v) => update("currency", v as FormState["currency"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">₺ TRY</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="EUR">€ EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Oda</Label>
                  <Input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Banyo</Label>
                  <Input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>m²</Label>
                  <Input type="number" value={form.areaM2} onChange={(e) => update("areaM2", e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Yapım yılı</Label>
                <Input type="number" value={form.yearBuilt} onChange={(e) => update("yearBuilt", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Konum</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Şehir</Label>
                  <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="İstanbul" />
                </div>
                <div className="space-y-1.5">
                  <Label>İlçe</Label>
                  <Input value={form.district} onChange={(e) => update("district", e.target.value)} placeholder="Beşiktaş" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Adres</Label>
                <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ekstra</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Video URL</Label>
                <Input value={form.videoUrl} onChange={(e) => update("videoUrl", e.target.value)} placeholder="YouTube link" />
              </div>
              <div className="space-y-1.5">
                <Label>3D Tour URL</Label>
                <Input value={form.tourUrl} onChange={(e) => update("tourUrl", e.target.value)} placeholder="Matterport link" />
              </div>
              <div className="space-y-1.5">
                <Label>Durum</Label>
                <Select value={form.status} onValueChange={(v) => update("status", v as FormState["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Taslak</SelectItem>
                    <SelectItem value="ACTIVE">Yayında</SelectItem>
                    <SelectItem value="SOLD">Satıldı</SelectItem>
                    <SelectItem value="RENTED">Kiralandı</SelectItem>
                    <SelectItem value="PASSIVE">Pasif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#14141A] hover:bg-black text-white h-11"
          >
            {submitting ? "Kaydediliyor..." : existing ? "Güncelle" : "Oluştur"}
          </Button>
        </div>
      </div>
    </form>
  );
}

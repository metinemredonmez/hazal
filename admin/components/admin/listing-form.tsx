"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Star, Loader2, Mic, MicOff, Share2, Copy, Check, MessageSquare } from "lucide-react";
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
import { api } from "@/lib/api";
import type { Listing } from "@/lib/types";
import Link from "next/link";
import { ImageManager, type ImageManagerHandle } from "@/components/admin/image-manager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast as sonnerToast } from "sonner";

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
  const [submitting, setSubmitting] = React.useState(false);
  const [aiBullets, setAiBullets] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);
  const imageManagerRef = React.useRef<ImageManagerHandle>(null);

  // Voice recording
  const [recording, setRecording] = React.useState(false);
  const [transcribing, setTranscribing] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  // Social post dialog
  const [socialOpen, setSocialOpen] = React.useState(false);
  const [socialLoading, setSocialLoading] = React.useState(false);
  const [socialPosts, setSocialPosts] = React.useState<{ instagram: string; linkedin: string; whatsapp: string } | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

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
        router.push("/listings");
        return;
      } else {
        const created = await api<Listing>("/api/admin/listings", {
          method: "POST",
          body: payload,
        });
        // Upload pending photos if any
        if (imageManagerRef.current?.hasPending) {
          try {
            const uploaded = await imageManagerRef.current.uploadPending(created.id);
            toast.success(`İlan oluşturuldu · ${uploaded.length} foto yüklendi`);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Foto yüklenemedi";
            toast.error(`İlan oluşturuldu ama foto yüklenemedi: ${message}`);
          }
        } else {
          toast.success("İlan oluşturuldu");
        }
        router.replace(`/listings/${created.id}`);
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Kaydedilemedi";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAndStructure(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Mikrofon erişimi reddedildi");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  async function transcribeAndStructure(blob: Blob) {
    setTranscribing(true);
    try {
      const fd = new FormData();
      fd.append("audio", blob, "voice.webm");
      const transcribed = await api<{ text: string }>("/api/admin/ai/transcribe", {
        method: "POST",
        body: fd,
      });
      if (!transcribed.text?.trim()) {
        toast.error("Ses algılanamadı");
        return;
      }
      const structured = await api<{ bullets: string[] }>("/api/admin/ai/structure-bullets", {
        method: "POST",
        body: { raw: transcribed.text },
      });
      const bullets = (structured.bullets ?? []).join("\n");
      setAiBullets((prev) => (prev ? `${prev}\n${bullets}` : bullets));
      toast.success(`${structured.bullets?.length ?? 0} madde eklendi`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Transcribe başarısız");
    } finally {
      setTranscribing(false);
    }
  }

  async function generateSocial() {
    if (!existing) {
      toast.error("Önce ilanı kaydet");
      return;
    }
    setSocialLoading(true);
    setSocialOpen(true);
    try {
      const res = await api<{ instagram: string; linkedin: string; whatsapp: string }>(
        "/api/admin/ai/social-post",
        { method: "POST", body: { listingId: existing.id, locale: "tr" } },
      );
      setSocialPosts(res);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sosyal post üretilemedi");
      setSocialOpen(false);
    } finally {
      setSocialLoading(false);
    }
  }

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
      sonnerToast.success("Kopyalandı");
    } catch {
      sonnerToast.error("Kopyalanamadı");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/listings">
            <ArrowLeft className="h-4 w-4" /> İlanlar
          </Link>
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          {existing && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={generateSocial}
              className="gap-1.5"
              title="Instagram, LinkedIn, WhatsApp post üret"
            >
              <Share2 className="h-3.5 w-3.5" /> Sosyal Medya Post
            </Button>
          )}
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
              <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#C9A96E]" />
                  AI ile yaz
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant={recording ? "destructive" : "outline"}
                  onClick={recording ? stopRecording : startRecording}
                  disabled={transcribing}
                  className="gap-1.5"
                  title="Sesli not — AI maddeleri çıkarır"
                >
                  {transcribing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Çevriliyor...
                    </>
                  ) : recording ? (
                    <>
                      <MicOff className="h-3.5 w-3.5" /> Durdur
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5" /> Sesli not
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Maddeleri yaz, AI sana TR + EN başlık ve premium açıklama yazsın. Sesli not ile dikte de edebilirsin.
              </p>
              <Textarea
                rows={4}
                placeholder={"Boğaz manzarası\nYeni yapı\n2 banyo\nAkıllı ev sistemi"}
                value={aiBullets}
                onChange={(e) => setAiBullets(e.target.value)}
                disabled={transcribing}
              />
              {recording && (
                <p className="text-xs text-red-600 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  Kaydediliyor... Bittiğinde "Durdur"a bas, AI maddeleri çıkarır.
                </p>
              )}
              <Button
                type="button"
                variant="accent"
                onClick={handleAi}
                disabled={aiLoading || transcribing}
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
              <ImageManager
                ref={imageManagerRef}
                listingId={existing?.id}
                initialImages={existing?.images ?? []}
              />
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

      <Dialog open={socialOpen} onOpenChange={setSocialOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-[#C9A96E]" /> Sosyal Medya Postları
            </DialogTitle>
            <DialogDescription>
              Üç farklı kanal için optimize edilmiş metinler. Kopyala, yapıştır.
            </DialogDescription>
          </DialogHeader>
          {socialLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#C9A96E]" />
            </div>
          ) : socialPosts ? (
            <div className="space-y-4">
              {([
                { key: "instagram" as const, label: "Instagram", desc: "Caption + hashtag" },
                { key: "linkedin" as const, label: "LinkedIn", desc: "Profesyonel duyuru" },
                { key: "whatsapp" as const, label: "WhatsApp", desc: "Müşteriye iletim" },
              ]).map(({ key, label, desc }) => {
                const text = socialPosts[key];
                return (
                  <div key={key} className="rounded-md border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => copyText(`social-${key}`, text)}
                        className="gap-1.5"
                      >
                        {copied === `social-${key}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        Kopyala
                      </Button>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/85 bg-muted/40 p-2.5 rounded">
                      {text}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </form>
  );
}

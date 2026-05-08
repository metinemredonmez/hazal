"use client";

import * as React from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Star, Trash2, ChevronUp, ChevronDown, Info, GripVertical } from "lucide-react";
import { api, uploadFiles } from "@/lib/api";
import type { Listing, ListingImage } from "@/lib/types";

const MAX_SIZE_MB = 10;
const RECOMMENDED = "2400×1600 px";

export interface ImageManagerHandle {
  hasPending: boolean;
  uploadPending: (listingId: string) => Promise<ListingImage[]>;
}

interface Props {
  listingId?: string;
  initialImages?: ListingImage[];
  onChange?: (images: ListingImage[]) => void;
}

interface PendingFile {
  id: string;
  file: File;
  previewUrl: string;
}

export const ImageManager = React.forwardRef<ImageManagerHandle, Props>(function ImageManager(
  { listingId, initialImages = [], onChange },
  ref,
) {
  const [images, setImages] = React.useState<ListingImage[]>(initialImages);
  const [pending, setPending] = React.useState<PendingFile[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = React.useState<number | null>(null);

  async function handleDragReorder(fromIdx: number, toIdx: number) {
    if (!listingId || fromIdx === toIdx) return;
    const next = [...images];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setImages(next);
    try {
      await api(`/api/admin/listings/${listingId}/images/reorder`, {
        method: "PATCH",
        body: { imageIds: next.map((i) => i.id) },
      });
      toast.success("Sıra güncellendi");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sıra güncellenemedi");
      setImages(images);
    }
  }
  const [dragOver, setDragOver] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  React.useEffect(() => {
    onChange?.(images);
  }, [images, onChange]);

  React.useEffect(() => {
    return () => {
      pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [pending]);

  function validateFiles(files: File[]): File[] {
    const valid: File[] = [];
    for (const f of files) {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name}: sadece resim dosyaları kabul edilir`);
        continue;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${f.name}: ${MAX_SIZE_MB}MB üzeri yüklenemez`);
        continue;
      }
      valid.push(f);
    }
    return valid;
  }

  async function handleSelectFiles(files: FileList | File[] | null) {
    if (!files) return;
    const valid = validateFiles(Array.from(files));
    if (valid.length === 0) return;

    if (listingId) {
      // Direct upload to existing listing
      setUploading(true);
      try {
        await uploadFiles(`/api/admin/uploads/listings/${listingId}/images`, valid);
        const refreshed = await api<Listing>(`/api/admin/listings/${listingId}`);
        setImages(refreshed.images);
        toast.success(`${valid.length} foto yüklendi`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Yükleme başarısız");
      } finally {
        setUploading(false);
        if (fileInput.current) fileInput.current.value = "";
      }
    } else {
      // Pending mode (new listing not yet created)
      const newPending: PendingFile[] = valid.map((file) => ({
        id: `pending-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setPending((prev) => [...prev, ...newPending]);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  React.useImperativeHandle(ref, () => ({
    hasPending: pending.length > 0,
    async uploadPending(targetListingId: string) {
      if (pending.length === 0) return [];
      setUploading(true);
      try {
        await uploadFiles(
          `/api/admin/uploads/listings/${targetListingId}/images`,
          pending.map((p) => p.file),
        );
        const refreshed = await api<Listing>(`/api/admin/listings/${targetListingId}`);
        setImages(refreshed.images);
        pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
        setPending([]);
        return refreshed.images;
      } finally {
        setUploading(false);
      }
    },
  }), [pending]);

  function removePending(id: string) {
    setPending((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function handleDeleteImage(imageId: string) {
    if (!listingId) return;
    try {
      await api(`/api/admin/listings/${listingId}/images/${imageId}`, { method: "DELETE" });
      setImages((prev) => prev.filter((i) => i.id !== imageId));
      toast.success("Foto silindi");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Silinemedi");
    }
  }

  async function handleSetPrimary(imageId: string) {
    if (!listingId) return;
    try {
      await api(`/api/admin/listings/${listingId}/images/${imageId}/primary`, { method: "PATCH" });
      setImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.id === imageId })),
      );
      toast.success("Ana foto güncellendi");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Güncellenemedi");
    }
  }

  async function handleReorder(idx: number, dir: -1 | 1) {
    if (!listingId) return;
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[idx], next[target]] = [next[target], next[idx]];
    setImages(next);
    try {
      await api(`/api/admin/listings/${listingId}/images/reorder`, {
        method: "PATCH",
        body: { imageIds: next.map((i) => i.id) },
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sıra güncellenemedi");
      setImages(images);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleSelectFiles(e.dataTransfer.files);
  }

  const totalCount = images.length + pending.length;

  return (
    <div className="space-y-4">
      {/* Guide */}
      <div className="flex items-start gap-2 p-3 bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded-md text-xs">
        <Info className="h-3.5 w-3.5 mt-0.5 text-[#C9A96E] shrink-0" />
        <div className="space-y-0.5 text-foreground/80">
          <p>
            <strong>Önerilen boyut:</strong> {RECOMMENDED} (yatay format) · <strong>max:</strong> {MAX_SIZE_MB}MB · JPG/PNG/WEBP
          </p>
          <p className="text-muted-foreground">
            İlk seçtiğin foto ana foto (kapak) olur. Star ikonuna tıklayarak değiştirebilirsin.
            Sıralamak için fotoyu sürükle-bırak.
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInput.current?.click()}
        className={`relative border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-[#C9A96E] bg-[#C9A96E]/5"
            : "border-border hover:border-[#C9A96E] hover:bg-muted/30"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleSelectFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-[#C9A96E]" />
          ) : (
            <ImagePlus className="h-8 w-8 text-[#C9A96E]" />
          )}
          <p className="text-sm font-medium text-foreground">
            {uploading ? "Yükleniyor..." : "Foto sürükle veya tıkla"}
          </p>
          <p className="text-xs">Aynı anda birden fazla seçebilirsin</p>
        </div>
      </div>

      {/* Pending preview (new listing mode) */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Yüklenmeye hazır ({pending.length})
            </p>
            <p className="text-[10px] text-muted-foreground">
              İlanı oluşturduğunda otomatik yüklenecek
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {pending.map((p, idx) => (
              <div
                key={p.id}
                className="relative aspect-[4/3] rounded-md border border-border overflow-hidden group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.previewUrl} alt="" className="h-full w-full object-cover" />
                {idx === 0 && (
                  <div className="absolute top-2 left-2 bg-[#C9A96E] text-[#14141A] text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" /> Ana
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePending(p.id);
                  }}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Kaldır"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                  {p.file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing images */}
      {images.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Mevcut fotoğraflar ({images.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                draggable
                onDragStart={(e) => {
                  setDraggedIdx(idx);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnter={() => setDragOverIdx(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDragLeave={() => setDragOverIdx((prev) => (prev === idx ? null : prev))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedIdx !== null && draggedIdx !== idx) {
                    handleDragReorder(draggedIdx, idx);
                  }
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                onDragEnd={() => {
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                className={
                  "relative aspect-[4/3] rounded-md border overflow-hidden group cursor-grab active:cursor-grabbing transition-all " +
                  (draggedIdx === idx
                    ? "opacity-30 border-border"
                    : dragOverIdx === idx && draggedIdx !== null
                      ? "border-[#C9A96E] ring-2 ring-[#C9A96E]/40"
                      : "border-border")
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-full w-full object-cover pointer-events-none" />
                {img.isPrimary && (
                  <div className="absolute top-2 left-2 bg-[#C9A96E] text-[#14141A] text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded inline-flex items-center gap-1 pointer-events-none">
                    <Star className="h-3 w-3 fill-current" /> Ana
                  </div>
                )}

                {/* Drag handle indicator */}
                <div className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <GripVertical className="h-3 w-3" />
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(img.id)}
                      className="bg-white/15 hover:bg-[#C9A96E] hover:text-[#14141A] text-white p-2 rounded transition-colors"
                      title="Ana foto yap"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, -1)}
                    disabled={idx === 0}
                    className="bg-white/15 hover:bg-white/30 text-white p-2 rounded disabled:opacity-30 transition-colors"
                    title="Yukarı"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, 1)}
                    disabled={idx === images.length - 1}
                    className="bg-white/15 hover:bg-white/30 text-white p-2 rounded disabled:opacity-30 transition-colors"
                    title="Aşağı"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="bg-white/15 hover:bg-destructive text-white p-2 rounded transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <p className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                  #{idx + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalCount === 0 && (
        <p className="text-center text-xs text-muted-foreground py-6">
          Henüz foto yok. Yukarıdan ekle.
        </p>
      )}
    </div>
  );
});

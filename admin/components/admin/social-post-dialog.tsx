"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Share2,
  Loader2,
  Copy,
  Check,
  Download,
  Camera,
  Briefcase,
  Send,
  Globe2,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Listing } from "@/lib/types";

const PUBLIC_URL = (process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? "https://hazalmuti.com").replace(/\/$/, "");

interface Posts {
  instagram: string;
  linkedin: string;
  whatsapp: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing | null;
}

export function SocialPostDialog({ open, onOpenChange, listing }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [posts, setPosts] = React.useState<Posts | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const cover =
    listing?.images.find((i) => i.isPrimary)?.url ?? listing?.images[0]?.url ?? null;
  const listingUrl = listing ? `${PUBLIC_URL}/ilanlar/${listing.slug}` : "";

  React.useEffect(() => {
    if (!open || !listing) return;
    if (posts && activeId === listing.id) return;
    setLoading(true);
    setPosts(null);
    api<Posts>("/api/admin/ai/social-post", {
      method: "POST",
      body: { listingId: listing.id, locale: "tr" },
    })
      .then((res) => {
        setPosts(res);
        setActiveId(listing.id);
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Sosyal post üretilemedi");
        onOpenChange(false);
      })
      .finally(() => setLoading(false));
  }, [open, listing]); // eslint-disable-line react-hooks/exhaustive-deps

  function fillUrl(text: string) {
    return (text ?? "").replace(/\{url\}/g, listingUrl);
  }

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
      toast.success("Kopyalandı");
    } catch {
      toast.error("Kopyalanamadı");
    }
  }

  async function fetchCoverBlob(): Promise<{ blob: Blob; filename: string } | null> {
    if (!cover || !listing) return null;
    const res = await fetch(cover);
    if (!res.ok) throw new Error("Foto indirilemedi");
    const blob = await res.blob();
    const ext = (cover.split(".").pop() ?? "jpg").split("?")[0].slice(0, 5);
    return { blob, filename: `${listing.slug}-kapak.${ext}` };
  }

  async function downloadCover() {
    try {
      const data = await fetchCoverBlob();
      if (!data) return;
      const url = URL.createObjectURL(data.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Foto indirildi");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "İndirilemedi");
    }
  }

  // Native Web Share API: foto + metin + URL beraber paylaşım panelini açar
  async function nativeShare() {
    if (!listing || !posts) return;
    const caption = fillUrl(posts.instagram);
    const title = listing.titleTr;
    try {
      const data = await fetchCoverBlob();
      const file = data ? new File([data.blob], data.filename, { type: data.blob.type || "image/jpeg" }) : null;

      const shareData: ShareData = { title, text: caption, url: listingUrl };
      if (file && (navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
        (shareData as any).files = [file];
      }

      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Paylaşım paneli açıldı");
      } else {
        // Desktop fallback: download photo + copy text
        if (data) await downloadCover();
        await copyText("native", caption);
        toast.message("Bu tarayıcı doğrudan paylaşımı desteklemiyor — foto indirildi, metin kopyalandı");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("abort")) return;
      toast.error(msg || "Paylaşım başarısız");
    }
  }

  function shareInstagram(caption: string) {
    // Instagram does not accept pre-filled web posts; copy caption + open IG
    copyText("ig-auto", caption);
    // Try app deep-link first, fall back to web
    const w = window.open("instagram://library?LocalIdentifier=", "_blank");
    setTimeout(() => {
      if (!w || w.closed) window.open("https://www.instagram.com/", "_blank");
    }, 600);
    toast.message("Caption kopyalandı · Instagram açıldı, foto seç ve yapıştır");
  }

  function shareLinkedIn() {
    const u = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(listingUrl)}`;
    window.open(u, "_blank", "noopener,noreferrer");
  }

  function shareWhatsapp(text: string) {
    const u = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(u, "_blank", "noopener,noreferrer");
  }

  function shareFacebook() {
    const u = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(listingUrl)}`;
    window.open(u, "_blank", "noopener,noreferrer");
  }

  function shareX(caption: string) {
    const text = caption.split("#")[0].trim().slice(0, 240);
    const u = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(listingUrl)}`;
    window.open(u, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-[#C9A96E]" /> Paylaş — AI Sosyal Medya
          </DialogTitle>
          <DialogDescription>
            AI metin + kapak fotoğrafı hazır. İstediğin platforma tek tık ile paylaş.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#C9A96E]" />
            <p className="text-sm text-muted-foreground">AI metinleri hazırlıyor...</p>
          </div>
        ) : !posts || !listing ? (
          <p className="text-center text-sm text-muted-foreground py-8">İçerik bulunamadı</p>
        ) : (
          <div className="space-y-4">
            {/* Cover preview + native share */}
            {cover && (
              <div className="rounded-md border border-[#C9A96E]/40 bg-gradient-to-br from-[#C9A96E]/8 to-transparent p-3">
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt=""
                    className="h-28 w-36 object-cover rounded border border-border shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <p className="text-sm font-medium truncate">{listing.titleTr}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{listingUrl}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={nativeShare}
                      className="gap-1.5 bg-[#14141A] hover:bg-black text-white w-full sm:w-auto"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Hazır paylaş (foto + metin)
                    </Button>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Tarayıcının paylaşım paneli açılır — Instagram / WhatsApp / Mesajlar / Mail vb.
                      seç, foto + caption otomatik yüklü gelir. (Mobil + modern desktop)
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={downloadCover}
                      className="gap-1.5 h-7 px-2 -ml-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Download className="h-3 w-3" /> ya da sadece kapağı indir
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Instagram */}
            <PlatformBlock
              icon={<Camera className="h-4 w-4" />}
              label="Instagram"
              hint="Caption kopyalanır, IG açılır — masaüstünde foto upload + paste"
              text={fillUrl(posts.instagram)}
              copied={copied === "ig"}
              onCopy={() => copyText("ig", fillUrl(posts.instagram))}
              actions={
                <Button
                  size="sm"
                  className="bg-gradient-to-tr from-[#FF4D6D] via-[#C13584] to-[#5B51D8] text-white gap-1.5 hover:opacity-90"
                  onClick={() => shareInstagram(fillUrl(posts.instagram))}
                >
                  <ExternalLink className="h-3 w-3" /> Instagram'ı aç
                </Button>
              }
            />

            {/* LinkedIn */}
            <PlatformBlock
              icon={<Briefcase className="h-4 w-4" />}
              label="LinkedIn"
              hint="LinkedIn paylaşım sayfası açılır, URL ön-dolu"
              text={fillUrl(posts.linkedin)}
              copied={copied === "li"}
              onCopy={() => copyText("li", fillUrl(posts.linkedin))}
              actions={
                <Button
                  size="sm"
                  className="bg-[#0A66C2] hover:bg-[#0958A8] text-white gap-1.5"
                  onClick={shareLinkedIn}
                >
                  <ExternalLink className="h-3 w-3" /> LinkedIn'de paylaş
                </Button>
              }
            />

            {/* WhatsApp */}
            <PlatformBlock
              icon={<MessageSquare className="h-4 w-4" />}
              label="WhatsApp"
              hint="WhatsApp açılır, mesaj hazır — kişi seç, gönder"
              text={fillUrl(posts.whatsapp)}
              copied={copied === "wa"}
              onCopy={() => copyText("wa", fillUrl(posts.whatsapp))}
              actions={
                <Button
                  size="sm"
                  className="bg-[#25D366] hover:bg-[#1FAE54] text-white gap-1.5"
                  onClick={() => shareWhatsapp(fillUrl(posts.whatsapp))}
                >
                  <Send className="h-3 w-3" /> WhatsApp aç
                </Button>
              }
            />

            {/* Extra share targets */}
            <div className="rounded-md border border-border p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                Hızlı paylaş (sadece link)
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={shareFacebook}
                >
                  <Globe2 className="h-3 w-3" /> Facebook
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => shareX(fillUrl(posts.instagram))}
                >
                  <Send className="h-3 w-3" /> X (Twitter)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => copyText("url", listingUrl)}
                >
                  {copied === "url" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  Linki kopyala
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PlatformBlock({
  icon,
  label,
  hint,
  text,
  copied,
  onCopy,
  actions,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
  actions: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="text-[#C9A96E]">{icon}</div>
          <div>
            <p className="text-sm font-medium leading-none">{label}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button type="button" size="sm" variant="ghost" onClick={onCopy} className="gap-1">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            Kopyala
          </Button>
          {actions}
        </div>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/85 bg-muted/40 p-2.5 rounded">
        {text}
      </p>
    </div>
  );
}

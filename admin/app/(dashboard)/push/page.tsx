"use client";

import * as React from "react";
import { toast } from "sonner";
import { Send, BellRing, AlertCircle } from "lucide-react";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface PushStatus {
  configured: boolean;
}

interface SendResult {
  id: string | null;
  recipients: number;
}

export default function PushPage() {
  const [titleTr, setTitleTr] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [bodyTr, setBodyTr] = React.useState("");
  const [bodyEn, setBodyEn] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [status, setStatus] = React.useState<PushStatus | null>(null);
  const [lastResult, setLastResult] = React.useState<SendResult | null>(null);

  React.useEffect(() => {
    api<PushStatus>("/api/admin/push/status")
      .then(setStatus)
      .catch(() => setStatus({ configured: false }));
  }, []);

  async function handleSend() {
    if (!titleTr || !titleEn || !bodyTr || !bodyEn) {
      toast.error("TR ve EN başlık + içerik zorunlu");
      return;
    }
    setSending(true);
    try {
      const res = await api<SendResult>("/api/admin/push/send", {
        method: "POST",
        body: {
          titleTr,
          titleEn,
          bodyTr,
          bodyEn,
          url: url || undefined,
          imageUrl: imageUrl || undefined,
        },
      });
      setLastResult(res);
      toast.success(`Gönderildi · ${res.recipients} alıcı`);
      setTitleTr("");
      setTitleEn("");
      setBodyTr("");
      setBodyEn("");
      setUrl("");
      setImageUrl("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gönderilemedi";
      toast.error(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Topbar
        title="Push Bildirimler"
        description="Web sitesi abonelerine toplu bildirim gönder"
      />
      <main className="flex-1 px-6 py-8 space-y-6 animate-fade-up">
        {status && !status.configured && (
          <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
            <div>
              <p className="font-medium text-amber-900">OneSignal yapılandırılmamış</p>
              <p className="text-amber-800 text-xs mt-1">
                API tarafında <code>ONESIGNAL_APP_ID</code> ve{" "}
                <code>ONESIGNAL_REST_API_KEY</code> environment değişkenlerini ayarla.
              </p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="h-4 w-4 text-[#C9A96E]" /> Yeni bildirim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="titleTr">Başlık (TR)</Label>
                <Input
                  id="titleTr"
                  value={titleTr}
                  onChange={(e) => setTitleTr(e.target.value)}
                  placeholder="Yeni ilan: Bebek deniz manzaralı..."
                  maxLength={120}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="titleEn">Title (EN)</Label>
                <Input
                  id="titleEn"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="New listing: Bebek seaview..."
                  maxLength={120}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bodyTr">İçerik (TR)</Label>
                <Textarea
                  id="bodyTr"
                  value={bodyTr}
                  onChange={(e) => setBodyTr(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Detayları görmek için tıklayın"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bodyEn">Body (EN)</Label>
                <Textarea
                  id="bodyEn"
                  value={bodyEn}
                  onChange={(e) => setBodyEn(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Click to view details"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="url">Hedef URL (opsiyonel)</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://hazalmuti.com/ilanlar/..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="imageUrl">Görsel URL (opsiyonel)</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Gönderim "Subscribed Users" segmentine yapılır.
              </p>
              <Button
                onClick={handleSend}
                disabled={sending || (status !== null && !status.configured)}
                className="bg-[#14141A] hover:bg-black text-white gap-2"
              >
                <Send className="h-4 w-4" />
                {sending ? "Gönderiliyor..." : "Gönder"}
              </Button>
            </div>

            {lastResult && (
              <div className="text-xs text-muted-foreground border-t pt-3">
                Son gönderim · ID:{" "}
                <code className="text-foreground">{lastResult.id ?? "—"}</code> · Alıcı:{" "}
                <strong className="text-foreground">{lastResult.recipients}</strong>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

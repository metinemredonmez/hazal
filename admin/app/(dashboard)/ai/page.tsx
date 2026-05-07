"use client";

import * as React from "react";
import { Sparkles, Languages, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

export default function AiPage() {
  const [status, setStatus] = React.useState<{ enabled: boolean; model: string | null } | null>(null);

  React.useEffect(() => {
    api<{ enabled: boolean; model: string | null }>("/api/admin/ai/status").then(setStatus);
  }, []);

  return (
    <>
      <Topbar
        title="AI Yardımcı"
        description={status ? (status.enabled ? `${status.model}` : "Yapılandırılmamış") : ""}
      />
      <main className="flex-1 px-4 py-5 space-y-4 animate-fade-up max-w-4xl">
        {!status?.enabled && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 text-xs">
              <strong>Uyarı:</strong> OpenAI key yapılandırılmamış. .env.production'a OPENAI_API_KEY ekle.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <TranslateBox />
          <DescriptionBox />
        </div>
      </main>
    </>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="gap-1.5"
      disabled={!text}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Kopyalandı" : "Kopyala"}
    </Button>
  );
}

function TranslateBox() {
  const [text, setText] = React.useState("");
  const [out, setOut] = React.useState("");
  const [source, setSource] = React.useState<"tr" | "en">("tr");
  const [target, setTarget] = React.useState<"tr" | "en">("en");
  const [loading, setLoading] = React.useState(false);

  async function go() {
    if (!text) return;
    setLoading(true);
    try {
      const res = await api<{ text: string }>("/api/admin/ai/translate", {
        method: "POST",
        body: { text, source, target },
      });
      setOut(res.text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Hata";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="py-3 px-4 border-b border-border">
        <CardTitle className="text-xs flex items-center gap-1.5">
          <Languages className="h-3.5 w-3.5" /> Çeviri
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Kaynak</Label>
            <Select value={source} onValueChange={(v) => setSource(v as "tr" | "en")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tr">Türkçe</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Hedef</Label>
            <Select value={target} onValueChange={(v) => setTarget(v as "tr" | "en")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tr">Türkçe</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Çevrilecek metin..."
        />
        <Button onClick={go} disabled={loading || !text} variant="accent" className="gap-1.5">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Çevir
        </Button>
        {out && (
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
            <p className="text-[12px] leading-relaxed whitespace-pre-wrap">{out}</p>
            <CopyButton text={out} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DescriptionBox() {
  const [bullets, setBullets] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [out, setOut] = React.useState<{
    titleTr: string;
    titleEn: string;
    descriptionTr: string;
    descriptionEn: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function go() {
    const list = bullets.split("\n").map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) return;
    setLoading(true);
    try {
      const res = await api<{
        titleTr: string;
        titleEn: string;
        descriptionTr: string;
        descriptionEn: string;
      }>("/api/admin/ai/generate-description", {
        method: "POST",
        body: {
          title: title || list[0],
          bullets: list,
          type: "SALE",
          category: "APARTMENT",
          tone: "premium",
        },
      });
      setOut(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Hata";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="py-3 px-4 border-b border-border">
        <CardTitle className="text-xs flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#C9A96E]" /> İlan Açıklaması Üret
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Başlık (opsiyonel)</Label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bebek Manzaralı Lüks Daire"
            className="flex h-8 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Maddeler (her satır bir özellik)</Label>
          <Textarea
            rows={5}
            value={bullets}
            onChange={(e) => setBullets(e.target.value)}
            placeholder={"Boğaz manzarası\nYeni yapı\n2 banyo\nAkıllı ev sistemi"}
          />
        </div>
        <Button onClick={go} disabled={loading || !bullets} variant="accent" className="gap-1.5">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Üret
        </Button>
        {out && (
          <div className="space-y-3">
            <Result label="Başlık (TR)" text={out.titleTr} />
            <Result label="Başlık (EN)" text={out.titleEn} />
            <Result label="Açıklama (TR)" text={out.descriptionTr} multiline />
            <Result label="Açıklama (EN)" text={out.descriptionEn} multiline />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Result({ label, text, multiline }: { label: string; text: string; multiline?: boolean }) {
  return (
    <div className="rounded border border-border bg-muted/30 p-2.5">
      <div className="flex items-center justify-between mb-1">
        <Badge variant="outline" className="text-[9px]">
          {label}
        </Badge>
        <CopyButton text={text} />
      </div>
      <p className={`text-[11px] leading-relaxed ${multiline ? "whitespace-pre-wrap" : ""}`}>{text}</p>
    </div>
  );
}

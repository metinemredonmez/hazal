"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Inbox,
  Send,
  RefreshCw,
  Search,
  Mail,
  Loader2,
  AlertCircle,
  Reply as ReplyIcon,
  Trash2,
  PenSquare,
  Paperclip,
  X,
  FileText,
  ChevronDown,
} from "lucide-react";
import { Topbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

interface EmailMessage {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  status: "UNREAD" | "READ" | "DELETED";
  fromAddress: string;
  fromName: string | null;
  toAddresses: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  hasAttachment: boolean;
  receivedAt: string;
}

interface MailList {
  items: EmailMessage[];
  total: number;
}

type Tab = "inbox" | "sent";

export default function MailPage() {
  const [tab, setTab] = React.useState<Tab>("inbox");
  const [items, setItems] = React.useState<EmailMessage[]>([]);
  const [selected, setSelected] = React.useState<EmailMessage | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [imapConfigured, setImapConfigured] = React.useState<boolean | null>(null);
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [replyTo, setReplyTo] = React.useState<EmailMessage | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ pageSize: "100" });
      if (search) sp.set("search", search);
      const data = await api<MailList>(`/api/admin/mail/${tab}?${sp}`);
      setItems(data.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  React.useEffect(() => {
    api<{ imapConfigured: boolean }>("/api/admin/mail/status")
      .then((s) => setImapConfigured(s.imapConfigured))
      .catch(() => setImapConfigured(false));
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleImapRefresh() {
    setRefreshing(true);
    try {
      const res = await api<{ fetched: number; added: number }>("/api/admin/mail/refresh", {
        method: "POST",
      });
      toast.success(`${res.fetched} mail tarandı · ${res.added} yeni`);
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "IMAP hatası");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSelect(msg: EmailMessage) {
    setSelected(msg);
    if (msg.direction === "INBOUND" && msg.status === "UNREAD") {
      try {
        await api(`/api/admin/mail/${msg.id}/read`, { method: "PATCH" });
        setItems((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: "READ" as const } : m)),
        );
      } catch {
        // sessizce yut
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu maili silmek istediğinden emin misin?")) return;
    try {
      await api(`/api/admin/mail/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Silindi");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Silinemedi");
    }
  }

  function startReply(msg: EmailMessage) {
    setReplyTo(msg);
    setComposeOpen(true);
  }

  return (
    <>
      <Topbar
        title="Mail"
        description="Gelen / Gönderilen mailler · IMAP + SMTP"
      />
      <main className="flex-1 px-4 py-5 space-y-3 animate-fade-up">
        {imapConfigured === false && (
          <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
            <div>
              <p className="font-medium text-amber-900">Gelen kutusu henüz aktif değil</p>
              <p className="text-amber-800 text-xs mt-1">
                Şu an yalnızca yeni mail gönderebilirsin. Gelen mailleri buradan görebilmek için sistem yöneticisi tarafından mail bağlantısı kurulduktan sonra "Yenile" butonu ile çekebileceksin.
              </p>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setTab("inbox")}
              className={
                "px-3 py-2 text-xs flex items-center gap-1.5 transition-colors " +
                (tab === "inbox" ? "bg-[#14141A] text-white" : "bg-white hover:bg-muted")
              }
            >
              <Inbox className="h-3.5 w-3.5" /> Gelen
            </button>
            <button
              onClick={() => setTab("sent")}
              className={
                "px-3 py-2 text-xs flex items-center gap-1.5 transition-colors " +
                (tab === "sent" ? "bg-[#14141A] text-white" : "bg-white hover:bg-muted")
              }
            >
              <Send className="h-3.5 w-3.5" /> Gönderilen
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Mail içeriğinde ara..."
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {tab === "inbox" && imapConfigured && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleImapRefresh}
                disabled={refreshing}
                className="gap-1.5"
              >
                {refreshing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Yenile
              </Button>
            )}
            <Button
              onClick={() => {
                setReplyTo(null);
                setComposeOpen(true);
              }}
              className="bg-[#14141A] hover:bg-black text-white gap-1.5"
            >
              <PenSquare className="h-3.5 w-3.5" /> Yeni Mail
            </Button>
          </div>
        </div>

        {/* 2-pane layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-3 h-[calc(100vh-220px)]">
          {/* List */}
          <div className="bg-white border border-border rounded-md overflow-y-auto">
            {loading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-30" />
                {tab === "inbox" ? "Gelen kutusu boş" : "Gönderilen mail yok"}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((msg) => {
                  const isSelected = selected?.id === msg.id;
                  const isUnread = msg.direction === "INBOUND" && msg.status === "UNREAD";
                  const personLine = msg.direction === "INBOUND" ? msg.fromAddress : msg.toAddresses;
                  return (
                    <li
                      key={msg.id}
                      onClick={() => handleSelect(msg)}
                      className={
                        "px-3 py-2.5 cursor-pointer transition-colors " +
                        (isSelected
                          ? "bg-[#C9A96E]/10"
                          : isUnread
                            ? "bg-blue-50/50 hover:bg-blue-50"
                            : "hover:bg-muted/50")
                      }
                    >
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p
                          className={
                            "text-xs truncate flex-1 " + (isUnread ? "font-semibold" : "font-medium")
                          }
                        >
                          {msg.fromName || personLine}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(msg.receivedAt).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p
                        className={
                          "text-sm truncate " + (isUnread ? "text-foreground" : "text-muted-foreground")
                        }
                      >
                        {msg.subject || "(konusuz)"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {msg.bodyText.slice(0, 100)}
                      </p>
                      {msg.hasAttachment && (
                        <div className="text-[10px] text-muted-foreground mt-1 inline-flex items-center gap-1">
                          <Paperclip className="h-2.5 w-2.5" /> ek
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Detail */}
          <div className="bg-white border border-border rounded-md overflow-hidden flex flex-col">
            {selected ? (
              <>
                <div className="px-4 py-3 border-b border-border flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-medium text-base mb-0.5 line-clamp-1">
                      {selected.subject || "(konusuz)"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">
                        {selected.fromName || selected.fromAddress}
                      </span>
                      {" → "}
                      {selected.toAddresses}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(selected.receivedAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {selected.direction === "INBOUND" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startReply(selected)}
                        className="gap-1.5"
                      >
                        <ReplyIcon className="h-3.5 w-3.5" />
                        Cevapla
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(selected.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {selected.bodyHtml ? (
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selected.bodyHtml }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm font-sans">
                      {selected.bodyText}
                    </pre>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Bir mail seç</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {composeOpen && (
        <ComposeDialog
          replyTo={replyTo}
          onClose={() => {
            setComposeOpen(false);
            setReplyTo(null);
          }}
          onSent={() => {
            setComposeOpen(false);
            setReplyTo(null);
            if (tab === "sent") refresh();
          }}
        />
      )}
    </>
  );
}

interface MailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  variables: Array<{ key: string; label: string; type?: string; default?: string }> | null;
}

function ComposeDialog({
  replyTo,
  onClose,
  onSent,
}: {
  replyTo: EmailMessage | null;
  onClose: () => void;
  onSent: () => void;
}) {
  const [to, setTo] = React.useState(replyTo?.fromAddress ?? "");
  const [subject, setSubject] = React.useState(
    replyTo
      ? replyTo.subject.match(/^re:/i)
        ? replyTo.subject
        : `Re: ${replyTo.subject}`
      : "",
  );
  const [body, setBody] = React.useState(
    replyTo
      ? `\n\n----- Orijinal mesaj -----\nKimden: ${replyTo.fromName || replyTo.fromAddress}\nTarih: ${new Date(replyTo.receivedAt).toLocaleString("tr-TR")}\nKonu: ${replyTo.subject}\n\n${replyTo.bodyText}`
      : "",
  );
  const [sending, setSending] = React.useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = React.useState(false);

  async function handleSend() {
    if (!to || !subject) {
      toast.error("Alıcı ve konu zorunlu");
      return;
    }
    setSending(true);
    try {
      await api("/api/admin/mail/send", {
        method: "POST",
        body: { to, subject, bodyText: body },
      });
      toast.success("Mail gönderildi");
      onSent();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gönderilemedi");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>{replyTo ? "Cevapla" : "Yeni Mail"}</DialogTitle>
            {!replyTo && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTemplatePickerOpen(true)}
                className="gap-1.5 mr-6"
              >
                <FileText className="h-3 w-3" /> Şablon Seç
                <ChevronDown className="h-3 w-3" />
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label className="text-xs">Kime</Label>
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="alici@example.com" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Konu</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Mesaj</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-3.5 w-3.5 mr-1.5" />
            Vazgeç
          </Button>
          <Button onClick={handleSend} disabled={sending} className="bg-[#14141A] text-white gap-2">
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Gönder
          </Button>
        </DialogFooter>
      </DialogContent>

      {templatePickerOpen && (
        <MailTemplatePicker
          onClose={() => setTemplatePickerOpen(false)}
          onApply={(rendered) => {
            setSubject(rendered.subject);
            setBody(rendered.text);
            setTemplatePickerOpen(false);
            toast.success("Şablon uygulandı");
          }}
        />
      )}
    </Dialog>
  );
}

const TEMPLATE_CATEGORIES: Record<string, { label: string; color: string }> = {
  PROMOTION: { label: "Tanıtım", color: "bg-blue-100 text-blue-700" },
  APPOINTMENT: { label: "Randevu", color: "bg-emerald-100 text-emerald-700" },
  OFFER: { label: "Teklif", color: "bg-amber-100 text-amber-800" },
  FOLLOWUP: { label: "Takip", color: "bg-violet-100 text-violet-700" },
  CONTRACT: { label: "Sözleşme", color: "bg-slate-100 text-slate-700" },
  THANKYOU: { label: "Teşekkür", color: "bg-pink-100 text-pink-700" },
  OTHER: { label: "Diğer", color: "bg-gray-100 text-gray-700" },
};

function MailTemplatePicker({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (r: { subject: string; text: string; html: string }) => void;
}) {
  const [templates, setTemplates] = React.useState<MailTemplate[]>([]);
  const [selected, setSelected] = React.useState<MailTemplate | null>(null);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [rendering, setRendering] = React.useState(false);

  React.useEffect(() => {
    api<MailTemplate[]>("/api/admin/mail-templates")
      .then(setTemplates)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  function pick(t: MailTemplate) {
    setSelected(t);
    const initial: Record<string, string> = {};
    t.variables?.forEach((v) => {
      initial[v.key] = v.default ?? "";
    });
    setValues(initial);
  }

  async function apply() {
    if (!selected) return;
    setRendering(true);
    try {
      const r = await api<{ subject: string; text: string; html: string }>(
        `/api/admin/mail-templates/${selected.id}/render`,
        { method: "POST", body: { values } },
      );
      onApply(r);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setRendering(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selected ? `Doldur: ${selected.name}` : "📋 Mail Şablonu Seç"}
          </DialogTitle>
        </DialogHeader>

        {!selected && (
          <div className="space-y-2 py-2">
            {loading ? (
              <Skeleton className="h-32" />
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Mail className="h-10 w-10 mx-auto opacity-30 mb-3" />
                <p>Henüz şablon yok.</p>
                <p className="text-[11px] mt-2">
                  Server'da <code className="bg-muted px-2 py-0.5 rounded">npx tsx prisma/seed-mail-templates.ts</code> çalıştır.
                </p>
              </div>
            ) : (
              templates.map((t) => {
                const cat = TEMPLATE_CATEGORIES[t.category] ?? TEMPLATE_CATEGORIES.OTHER;
                return (
                  <button
                    key={t.id}
                    onClick={() => pick(t)}
                    className="w-full text-left p-3 border border-border hover:border-[#C9A96E] hover:bg-muted/30 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider ${cat.color}`}
                      >
                        {cat.label}
                      </span>
                      <p className="text-sm font-medium">{t.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{t.subject}</p>
                    {t.variables && t.variables.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t.variables.length} alan dolduracaksın
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}

        {selected && (
          <div className="space-y-3 py-2">
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Şablon değiştir
            </button>
            {selected.variables && selected.variables.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selected.variables.map((v) => (
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
            ) : (
              <p className="text-xs text-muted-foreground">
                Bu şablonun doldurulacak alanı yok. Direkt uygulayabilirsiniz.
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              💡 İpucu: "Uygula" tıkla → Konu ve Mesaj otomatik dolar.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          {selected && (
            <Button
              onClick={apply}
              disabled={rendering}
              className="bg-[#14141A] text-white gap-2"
            >
              {rendering && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Uygula
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

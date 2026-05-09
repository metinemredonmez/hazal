"use client";

import * as React from "react";
import { Sparkles, X, Send, Loader2, Bot } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  usedTools?: string[];
}

interface AssistantResponse {
  reply: string;
  usedTools: string[];
}

const QUICK_PROMPTS = [
  "Bugün neye odaklanmalıyım?",
  "Bu hafta randevularım",
  "Son 7 günün sıcak talepleri",
  "Bebek'te 5M altı 3+1 satılık var mı?",
  "Aktif kaç ilanım var?",
];

export function AIAssistantWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // Welcome message on first open
  React.useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Merhaba Hazal 👋 Ben senin AI asistanın. İlan, randevu, talep, istatistik — istediğini sor. Aşağıdan hızlı başlayabilirsin veya kendi sorunu yaz.",
        },
      ]);
    }
  }, [open, messages.length]);

  // Auto-scroll
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-focus input when opened
  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Cmd+K keyboard shortcut
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text?: string) {
    const userText = (text ?? input).trim();
    if (!userText || sending) return;

    const newUserMsg: Message = { role: "user", content: userText };
    const history = [...messages, newUserMsg];
    setMessages(history);
    setInput("");
    setSending(true);

    try {
      const res = await api<AssistantResponse>("/api/admin/ai/assistant", {
        method: "POST",
        body: {
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        },
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply, usedTools: res.usedTools },
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Hata oluştu";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ ${message}\n\nTekrar dener misin?`,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setMessages([]);
    setInput("");
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 group flex items-center gap-2 bg-[#14141A] hover:bg-[#C9A96E] text-white rounded-full shadow-lg pl-4 pr-5 py-3 transition-colors"
          aria-label="AI Asistan'ı aç (Cmd+K)"
          title="AI Asistan (⌘K)"
        >
          <Sparkles className="h-4 w-4 text-[#C9A96E] group-hover:text-white transition-colors" />
          <span className="text-xs tracking-[0.2em] uppercase font-medium">
            AI Asistan
          </span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] bg-white/10 rounded border border-white/20">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-4 right-4 lg:bottom-5 lg:right-5 z-50 w-[calc(100vw-2rem)] sm:w-[440px] h-[640px] max-h-[85vh] bg-white shadow-2xl border border-border flex flex-col rounded-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
          role="dialog"
          aria-label="AI Asistan"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#14141A] to-[#1a1a23] text-white">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Bot className="h-5 w-5 text-[#C9A96E]" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full ring-2 ring-[#14141A]" />
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] uppercase font-medium leading-tight">
                  AI Asistan
                </p>
                <p className="text-[10px] text-white/60 leading-tight">
                  Hazal Muti Real Estate
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  onClick={reset}
                  className="text-white/60 hover:text-white text-[10px] uppercase tracking-wider px-2 py-1 hover:bg-white/10 rounded"
                  title="Yeni sohbet"
                >
                  Sıfırla
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white p-1.5 hover:bg-white/10 rounded"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FAF8F4]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div className="max-w-[85%]">
                  <div
                    className={
                      m.role === "user"
                        ? "bg-[#14141A] text-white px-3.5 py-2 rounded-2xl rounded-br-sm text-sm whitespace-pre-line"
                        : "bg-white border border-border px-3.5 py-2 rounded-2xl rounded-bl-sm text-sm text-[#14141A] whitespace-pre-line"
                    }
                  >
                    {m.content}
                  </div>
                  {m.usedTools && m.usedTools.length > 0 && (
                    <p className="mt-1 text-[10px] text-muted-foreground flex flex-wrap gap-1 px-1">
                      {Array.from(new Set(m.usedTools)).map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 bg-[#C9A96E]/10 text-[#C9A96E] px-1.5 py-0.5 rounded"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          {t}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-border px-3.5 py-2 rounded-2xl rounded-bl-sm text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Düşünüyorum...
                </div>
              </div>
            )}

            {/* Quick prompts — only on first turn */}
            {messages.length === 1 && messages[0].role === "assistant" && !sending && (
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-2">
                  Hızlı başla
                </p>
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="block w-full text-left text-xs bg-white border border-border hover:border-[#C9A96E] hover:bg-[#FAF8F4] px-3 py-2 rounded transition-colors text-[#14141A]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-border p-3 bg-white flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Sor: 'bu hafta randevu var mı?', 'Bebek 3+1 listele'..."
              rows={1}
              className="flex-1 px-3 py-2 text-sm border border-border focus:border-[#C9A96E] focus:outline-none resize-none rounded max-h-32"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-[#14141A] hover:bg-[#C9A96E] text-white p-2.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Gönder"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

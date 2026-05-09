"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useLocale } from "@/lib/i18n";
import type { Listing } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  recommended?: Listing[];
  suggestInquiry?: boolean;
}

interface ConciergeResponse {
  reply: string;
  recommendedSlugs: string[];
  suggestInquiry: boolean;
}

const QUICK_STARTERS_TR = [
  "Bebek'te 5M altı 3+1 var mı?",
  "Bodrum'da yazlık villa öner",
  "Cihangir tarihi yapı var mı?",
  "Yatırımlık 1+1",
];

const QUICK_STARTERS_EN = [
  "Any 3+1 under 5M in Bebek?",
  "Recommend a Bodrum summer villa",
  "Cihangir historic building?",
  "1+1 for investment",
];

export function ConciergeWidget() {
  const [locale] = useLocale();
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Welcome message on first open
  React.useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            locale === "tr"
              ? "Merhaba! Ben Hazal'ın sanal danışmanıyım. Aradığınız evi anlatın — bütçe, bölge, oda sayısı? Size en uygun ilanları bulalım."
              : "Hi! I'm Hazal's AI concierge. Tell me what you're looking for — budget, area, bedrooms? Let me find the right match.",
        },
      ]);
    }
  }, [open, locale, messages.length]);

  // Auto-scroll on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage(text?: string) {
    const userText = (text ?? input).trim();
    if (!userText || sending) return;

    const newUserMsg: Message = { role: "user", content: userText };
    const history = [...messages, newUserMsg];
    setMessages(history);
    setInput("");
    setSending(true);

    try {
      const res = await api<ConciergeResponse>("/api/ai/concierge", {
        method: "POST",
        body: {
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          locale,
        },
        auth: false,
      });

      // Fetch recommended listing details (parallel)
      let recommended: Listing[] = [];
      if (res.recommendedSlugs.length > 0) {
        const fetched = await Promise.all(
          res.recommendedSlugs.map((slug) =>
            api<Listing>(`/api/listings/${slug}`, { auth: false }).catch(() => null),
          ),
        );
        recommended = fetched.filter((l): l is Listing => l != null);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
          recommended,
          suggestInquiry: res.suggestInquiry,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            locale === "tr"
              ? "Bir sorun oluştu. Lütfen tekrar deneyin veya iletişim formunu kullanın."
              : "Something went wrong. Please try again or use the contact form.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating button — kompakt, hover'da genişler (haritayı kapatmasın) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="concierge-fab fixed bottom-5 right-5 z-50 group flex items-center justify-center gap-0 hover:gap-2 bg-[#14141A] hover:bg-[#C9A96E] text-white rounded-full shadow-xl w-12 h-12 hover:w-auto hover:h-12 hover:px-5 transition-all overflow-hidden ring-2 ring-[#C9A96E]/40"
          aria-label={locale === "tr" ? "Sanal danışmanı aç" : "Open AI concierge"}
          title={locale === "tr" ? "Sanal Danışman" : "AI Concierge"}
        >
          <span className="concierge-pulse" aria-hidden />
          <Sparkles className="concierge-spark h-4 w-4 text-[#C9A96E] group-hover:text-white transition-colors shrink-0 relative" />
          <span className="hidden group-hover:inline text-xs tracking-[0.2em] uppercase whitespace-nowrap relative">
            {locale === "tr" ? "Sanal Danışman" : "AI Concierge"}
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[600px] max-h-[80vh] bg-white shadow-2xl border border-[#E5E2DD] flex flex-col rounded-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#14141A] text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#C9A96E]" />
              <div>
                <p className="text-xs tracking-[0.2em] uppercase font-medium">
                  {locale === "tr" ? "Sanal Danışman" : "AI Concierge"}
                </p>
                <p className="text-[10px] text-white/60">Hazal Muti Real Estate</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#FAF8F4]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={
                    "max-w-[85%] " +
                    (m.role === "user"
                      ? "bg-[#14141A] text-white px-3.5 py-2 rounded-2xl rounded-br-sm text-sm"
                      : "")
                  }
                >
                  {m.role === "assistant" ? (
                    <div className="space-y-2">
                      <div className="bg-white px-3.5 py-2 rounded-2xl rounded-bl-sm text-sm text-[#14141A] whitespace-pre-line">
                        {m.content}
                      </div>
                      {m.recommended && m.recommended.length > 0 && (
                        <div className="space-y-1.5">
                          {m.recommended.map((l) => (
                            <Link
                              key={l.id}
                              href={`/ilanlar/${l.slug}`}
                              className="flex items-center gap-2.5 bg-white border border-[#E5E2DD] hover:border-[#C9A96E] px-3 py-2 rounded-md transition-colors group"
                            >
                              {l.images?.[0]?.url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={l.images[0].url}
                                  alt=""
                                  className="w-12 h-12 object-cover rounded shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-[#14141A] line-clamp-1">
                                  {locale === "tr" ? l.titleTr : l.titleEn}
                                </p>
                                <p className="text-[11px] text-[#6E6E73]">
                                  {l.district ?? l.city} ·{" "}
                                  {Number(l.price).toLocaleString("tr-TR")} {l.currency}
                                </p>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-[#C9A96E] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          ))}
                        </div>
                      )}
                      {m.suggestInquiry && (
                        <Link
                          href="/iletisim"
                          className="inline-flex items-center gap-1.5 text-[11px] text-[#C9A96E] hover:underline"
                        >
                          <ArrowRight className="h-3 w-3" />
                          {locale === "tr"
                            ? "Hazal'a doğrudan ulaş"
                            : "Reach Hazal directly"}
                        </Link>
                      )}
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white px-3.5 py-2 rounded-2xl rounded-bl-sm text-sm text-[#6E6E73] flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {locale === "tr" ? "Yazıyor..." : "Typing..."}
                </div>
              </div>
            )}

            {/* Quick starters — only show if no user message yet */}
            {messages.length === 1 && messages[0].role === "assistant" && (
              <div className="space-y-1.5">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] mt-4">
                  {locale === "tr" ? "Hızlı başla" : "Quick start"}
                </p>
                {(locale === "tr" ? QUICK_STARTERS_TR : QUICK_STARTERS_EN).map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="block w-full text-left text-xs bg-white border border-[#E5E2DD] hover:border-[#C9A96E] hover:bg-[#FAF8F4] px-3 py-2 rounded transition-colors text-[#14141A]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="border-t border-[#E5E2DD] p-3 bg-white flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                locale === "tr" ? "Aradığınız evi anlatın..." : "Tell me what you're looking for..."
              }
              rows={1}
              className="flex-1 px-3 py-2 text-sm border border-[#E5E2DD] focus:border-[#C9A96E] focus:outline-none resize-none rounded"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-[#14141A] hover:bg-[#C9A96E] text-white p-2.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

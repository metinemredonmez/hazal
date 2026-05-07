"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, tokenStore } from "@/lib/api";
import { useAuth } from "@/lib/store";
import type { Admin } from "@/lib/types";

interface LoginResponse {
  accessToken?: string;
  ticketToken?: string;
  requires2fa?: boolean;
  admin: { id: string; email: string; name: string } | Admin;
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginPageInner />
    </React.Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const setAdmin = useAuth((s) => s.setAdmin);
  const refresh = useAuth((s) => s.refresh);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [step, setStep] = React.useState<"login" | "2fa">("login");
  const [code, setCode] = React.useState("");
  const [ticket, setTicket] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const errorParam = params.get("error");
    if (errorParam === "google") {
      toast.error("Google ile giriş başarısız oldu. Yetkili e-posta gerekli.");
    }
  }, [params]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api<LoginResponse>("/api/auth/login", {
        method: "POST",
        auth: false,
        body: { email, password },
      });
      if (res.requires2fa && res.ticketToken) {
        setTicket(res.ticketToken);
        setStep("2fa");
        toast.success("Doğrulama kodunu girin.");
      } else if (res.accessToken) {
        tokenStore.set(res.accessToken);
        await refresh();
        if ("totpEnabled" in res.admin) setAdmin(res.admin as Admin);
        toast.success("Hoş geldiniz, " + res.admin.name);
        router.push("/");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Giriş başarısız";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!ticket) return;
    setSubmitting(true);
    try {
      const res = await api<{ accessToken: string; admin: Admin }>(
        "/api/auth/2fa/verify",
        { method: "POST", auth: false, body: { ticketToken: ticket, code } },
      );
      tokenStore.set(res.accessToken);
      setAdmin(res.admin);
      toast.success("Hoş geldiniz");
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Kod hatalı";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogleLogin() {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.hazalmuti.com").replace(/\/$/, "");
    window.location.href = `${apiUrl}/api/auth/google`;
  }

  return (
    <main className="relative grid min-h-screen lg:grid-cols-[3fr_2fr]">
      {/* LEFT — image */}
      <section className="relative hidden overflow-hidden bg-[#0E0E0E] lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center animate-zoom-slow"
          style={{
            backgroundImage:
              "url(/login-bg.jpg), linear-gradient(135deg, #1a1a1a 0%, #0E0E0E 100%)",
          }}
        />
        {/* Darken overlay for legibility */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/90" />
        <div className="relative z-10 flex h-full flex-col justify-between p-14 text-[#F5F2EC]">
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Hazal Muti Real Estate"
              className="h-8 w-auto opacity-95 select-none"
              draggable={false}
            />
          </div>

          <div className="animate-fade-up max-w-md" style={{ animationDelay: "300ms" }}>
            <h1 className="font-display text-5xl xl:text-6xl font-light leading-[1.1] tracking-tight">
              Premium properties,
              <br />
              <span className="italic text-[#C9A96E]">personal service.</span>
            </h1>
            <p className="mt-6 text-sm text-[#F5F2EC]/70 leading-relaxed">
              Yönetim paneline erişim için giriş yapın.
            </p>
          </div>

          <div
            className="flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-[#F5F2EC]/50 animate-fade-in"
            style={{ animationDelay: "500ms" }}
          >
            <span>İstanbul</span>
            <span className="h-px w-8 bg-[#C9A96E]/40" />
            <span>Bodrum</span>
            <span className="h-px w-8 bg-[#C9A96E]/40" />
            <span>Çeşme</span>
          </div>
        </div>
      </section>

      {/* RIGHT — form */}
      <section className="flex items-center justify-center bg-background px-6 py-10 lg:px-14 lg:py-0">
        <div className="w-full max-w-sm animate-slide-in-right">
          {/* Mobile brand header */}
          <div className="mb-12 flex justify-center lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-dark.png" alt="Hazal Muti Real Estate" className="h-12 w-auto" draggable={false} />
          </div>

          {step === "login" ? (
            <>
              <div className="mb-10">
                <h2 className="font-display text-4xl font-light tracking-tight text-foreground">
                  Hoş geldin.
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Yönetim paneline erişim için giriş yap.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                    E-posta
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hazalmuti@hotmail.com"
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      Şifre
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[#C9A96E] hover:text-[#B89757] transition-colors"
                    >
                      Şifremi unuttum
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 mt-2 bg-[#14141A] hover:bg-[#000000] text-white tracking-wide"
                >
                  {submitting ? "Giriliyor..." : "Giriş Yap"}
                </Button>
              </form>

              <div className="my-7 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  veya
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full h-11 gap-3 border-border hover:border-[#C9A96E] hover:text-foreground"
              >
                <GoogleIcon className="h-4 w-4" />
                Google ile Giriş
              </Button>

              <p className="mt-10 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Hazal Muti Real Estate
              </p>
            </>
          ) : (
            <>
              <div className="mb-10">
                <ShieldCheck className="h-10 w-10 text-[#C9A96E] mb-4" />
                <h2 className="font-display text-4xl font-light tracking-tight text-foreground">
                  Doğrulama
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Authenticator uygulamasındaki <strong>6 haneli kodu</strong> gir.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="code"
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    Doğrulama Kodu
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    required
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000 000"
                    className="h-14 text-center text-2xl tracking-[0.6em] font-display"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting || code.length !== 6}
                  className="w-full h-11 bg-[#14141A] hover:bg-black text-white"
                >
                  {submitting ? "Doğrulanıyor..." : "Doğrula"}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("login");
                    setCode("");
                    setTicket(null);
                  }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Giriş ekranına dön
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#EA4335"
        d="M5.27 9.76A7.077 7.077 0 0 1 16.86 6.4l3.85-3.85A12 12 0 0 0 1.27 6.5l4 3.27z"
      />
      <path
        fill="#34A853"
        d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.71-4.823l-4.04 3.067A11.96 11.96 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"
      />
      <path
        fill="#4A90E2"
        d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.554-1.166 2.756-2.395 3.558L19.834 21z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.268a7.235 7.235 0 0 1-.038-4.5L1.222 6.6A11.844 11.844 0 0 0 0 12c0 1.92.445 3.73 1.222 5.335l4.068-3.067z"
      />
    </svg>
  );
}

import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Şifremi Unuttum",
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-md text-center animate-fade-up">
        <p className="text-xs uppercase tracking-[0.4em] text-[#C9A96E] mb-2">Hazal Mutin</p>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Real Estate</p>

        <h1 className="font-display text-4xl font-light tracking-tight mt-12">
          Şifre sıfırlama
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Tek admin sistemi olduğu için kendi kendine sıfırlama yok.
          Şifreni unuttuysan ekibinden destek al — VPS'e SSH ile bağlanıp yeniden seed çalıştırılır.
        </p>

        <div className="mt-10 rounded-lg border border-border bg-card p-6 text-left">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-[#C9A96E] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Destek:</p>
              <a
                href="mailto:hazalmuti@hotmail.com"
                className="text-sm text-[#C9A96E] hover:text-[#B89757] transition-colors"
              >
                hazalmuti@hotmail.com
              </a>
            </div>
          </div>
        </div>

        <Button asChild variant="ghost" className="mt-10 gap-2">
          <Link href="/login">
            <ArrowLeft className="h-4 w-4" />
            Giriş ekranına dön
          </Link>
        </Button>
      </div>
    </main>
  );
}

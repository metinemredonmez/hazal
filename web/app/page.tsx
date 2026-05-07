import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0E0E0E] text-[#F5F2EC]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(/login-bg.jpg), linear-gradient(135deg, #1a1a1a, #0E0E0E)",
        }}
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/85" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 text-center animate-fade-up">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.45em] text-[#C9A96E]">
            Hazal Muti · Real Estate
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-light tracking-tight text-[#F5F2EC] max-w-3xl">
            Premium properties.
            <br />
            <span className="italic text-[#C9A96E]">Personal service.</span>
          </h1>
          <p className="max-w-xl text-sm sm:text-base text-[#F5F2EC]/70">
            Site yapım aşamasında. Çok yakında.
          </p>
          <div className="flex gap-3 mt-4">
            <Button asChild variant="accent">
              <a href="https://admin.hazalmuti.com">Admin Girişi</a>
            </Button>
          </div>
        </div>

        <footer className="border-t border-white/10 py-6 px-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#F5F2EC]/55">
            <p>
              © {new Date().getFullYear()} Hazal Muti Real Estate. Tüm hakları saklıdır.
            </p>
            <nav className="flex flex-wrap gap-x-5 gap-y-1">
              <Link href="/gizlilik-politikasi" className="hover:text-[#C9A96E] transition-colors">
                Gizlilik
              </Link>
              <Link href="/kvkk" className="hover:text-[#C9A96E] transition-colors">
                KVKK
              </Link>
              <Link href="/kullanim-kosullari" className="hover:text-[#C9A96E] transition-colors">
                Kullanım Koşulları
              </Link>
              <Link href="/cerez-politikasi" className="hover:text-[#C9A96E] transition-colors">
                Çerez
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}

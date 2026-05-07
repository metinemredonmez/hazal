import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Anasayfa
          </Link>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#C9A96E]">
            Hazal Muti · Real Estate
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-xs text-muted-foreground">
          Son güncelleme: {lastUpdated}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/85 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5 [&_ol]:my-3 [&_strong]:font-medium [&_strong]:text-foreground [&_a]:text-[#C9A96E] [&_a:hover]:text-[#B89757] [&_a]:underline [&_a]:underline-offset-2">
          {children}
        </div>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Hazal Muti Real Estate. Tüm hakları saklıdır.</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/gizlilik-politikasi" className="hover:text-foreground">Gizlilik</Link>
            <Link href="/kvkk" className="hover:text-foreground">KVKK</Link>
            <Link href="/kullanim-kosullari" className="hover:text-foreground">Kullanım</Link>
            <Link href="/cerez-politikasi" className="hover:text-foreground">Çerez</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

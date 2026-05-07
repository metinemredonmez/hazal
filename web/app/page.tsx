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

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center animate-fade-up">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Hazal Muti Real Estate"
          className="h-20 sm:h-24 w-auto"
          draggable={false}
        />
        <h1 className="font-display text-4xl sm:text-6xl font-light tracking-tight text-[#F5F2EC] max-w-3xl mt-2">
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
          <Button asChild variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
            <a href="https://api.hazalmuti.com/docs" target="_blank" rel="noreferrer">API Docs</a>
          </Button>
        </div>
      </div>
    </main>
  );
}

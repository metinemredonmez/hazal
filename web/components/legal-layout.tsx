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
    <div className="bg-background text-foreground pt-28 lg:pt-32">
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-xs text-muted-foreground">
          Son güncelleme: {lastUpdated}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/85 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5 [&_ol]:my-3 [&_strong]:font-medium [&_strong]:text-foreground [&_a]:text-[#C9A96E] [&_a:hover]:text-[#B89757] [&_a]:underline [&_a]:underline-offset-2">
          {children}
        </div>
      </div>
    </div>
  );
}

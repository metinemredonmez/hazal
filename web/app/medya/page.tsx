import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Calendar } from "lucide-react";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hazalmuti.com").replace(/\/$/, "");
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.hazalmuti.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Medya · Yazılar & Basın",
  description: "Hazal Muti yazıları, basın haberleri ve videolar.",
  alternates: { canonical: "/medya" },
  openGraph: {
    title: "Medya · Hazal Muti",
    description: "Yazılar, basın haberleri ve videolar.",
    url: "/medya",
    type: "website",
  },
};

interface BlogPost {
  id: string;
  slug: string;
  kind: "ARTICLE" | "PRESS" | "VIDEO";
  titleTr: string;
  titleEn: string;
  excerptTr: string | null;
  excerptEn: string | null;
  coverImage: string | null;
  externalUrl: string | null;
  publishedAt: string | null;
}

interface BlogList {
  items: BlogPost[];
  totalPages: number;
}

async function fetchPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/api/blog?pageSize=50`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = (await res.json()) as BlogList;
    return data.items;
  } catch {
    return [];
  }
}

const KIND_LABELS = {
  ARTICLE: { tr: "Yazı", en: "Article" },
  PRESS: { tr: "Basın", en: "Press" },
  VIDEO: { tr: "Video", en: "Video" },
};

export default async function MedyaPage() {
  const posts = await fetchPosts();

  return (
    <div className="bg-[#FAF8F4] min-h-screen pt-28 lg:pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="mb-12 lg:mb-16">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3">
            Medya
          </p>
          <h1 className="font-display font-light text-4xl lg:text-6xl text-[#14141A]">
            Yazılar & Basın
          </h1>
          <p className="mt-4 text-base text-[#6E6E73] max-w-xl">
            Sektörde dikkatimi çeken yazılar, basın haberleri ve video turlar.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="py-24 text-center text-sm text-[#6E6E73]">
            Henüz yazı yayınlanmadı. Yakında eklenecek.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const isExternal = !!post.externalUrl;
  const href = isExternal ? post.externalUrl! : `/medya/${post.slug}`;

  const Card = (
    <article className="group">
      <div className="aspect-[4/3] bg-[#1A1A1F] mb-4 overflow-hidden">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.titleTr}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
            Hazal Muti
          </div>
        )}
      </div>
      <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-2 inline-flex items-center gap-2">
        <span>{KIND_LABELS[post.kind].tr}</span>
        {date && (
          <>
            <span className="text-[#6E6E73]/40">·</span>
            <span className="text-[#6E6E73] inline-flex items-center gap-1 normal-case tracking-wider">
              <Calendar className="h-3 w-3" /> {date}
            </span>
          </>
        )}
      </p>
      <h2 className="font-display text-xl lg:text-2xl text-[#14141A] leading-snug mb-2 group-hover:text-[#C9A96E] transition-colors">
        {post.titleTr}
      </h2>
      {post.excerptTr && (
        <p className="text-sm text-[#6E6E73] line-clamp-3 leading-relaxed">{post.excerptTr}</p>
      )}
      {isExternal && (
        <p className="mt-3 inline-flex items-center gap-1 text-xs tracking-[0.2em] uppercase text-[#C9A96E]">
          {post.kind === "PRESS" ? "Kaynakta oku" : "Aç"}
          <ExternalLink className="h-3 w-3" />
        </p>
      )}
    </article>
  );

  return isExternal ? (
    <a href={href} target="_blank" rel="noreferrer">
      {Card}
    </a>
  ) : (
    <Link href={href}>{Card}</Link>
  );
}

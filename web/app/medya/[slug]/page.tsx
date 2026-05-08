import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hazalmuti.com").replace(/\/$/, "");
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.hazalmuti.com").replace(/\/$/, "");

interface BlogPost {
  id: string;
  slug: string;
  kind: "ARTICLE" | "PRESS" | "VIDEO";
  titleTr: string;
  titleEn: string;
  excerptTr: string | null;
  excerptEn: string | null;
  bodyTr: string;
  bodyEn: string;
  coverImage: string | null;
  externalUrl: string | null;
  publishedAt: string | null;
}

async function fetchPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/api/blog/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return (await res.json()) as BlogPost;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) return { title: "Bulunamadı" };
  return {
    title: post.titleTr,
    description: post.excerptTr ?? post.bodyTr.slice(0, 160),
    alternates: { canonical: `/medya/${slug}` },
    openGraph: {
      title: post.titleTr,
      description: post.excerptTr ?? undefined,
      url: `${SITE_URL}/medya/${slug}`,
      type: "article",
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
      publishedTime: post.publishedAt ?? undefined,
    },
  };
}

export default async function MedyaPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) notFound();

  // External link posts (PRESS, VIDEO) — redirect server-side
  if (post.externalUrl) {
    redirect(post.externalUrl);
  }

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <article className="bg-[#FAF8F4] min-h-screen">
      {post.coverImage && (
        <section className="relative bg-[#0E0E0E] pt-16 lg:pt-20">
          <div className="relative aspect-[16/9] max-h-[70vh] w-full bg-[#1A1A1F] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.titleTr}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </section>
      )}

      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <Link
          href="/medya"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#6E6E73] hover:text-[#C9A96E] mb-8"
        >
          <ArrowLeft className="h-3 w-3" /> Tüm yazılar
        </Link>

        <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A96E] mb-3 inline-flex items-center gap-2">
          {post.kind === "ARTICLE" ? "Yazı" : post.kind === "PRESS" ? "Basın" : "Video"}
          {date && (
            <>
              <span className="text-[#6E6E73]/40">·</span>
              <span className="text-[#6E6E73] inline-flex items-center gap-1 normal-case tracking-wider">
                <Calendar className="h-3 w-3" /> {date}
              </span>
            </>
          )}
        </p>

        <h1 className="font-display font-light text-4xl lg:text-5xl text-[#14141A] leading-tight mb-8">
          {post.titleTr}
        </h1>

        {post.excerptTr && (
          <p className="text-lg text-[#14141A]/85 leading-relaxed mb-10 italic">
            {post.excerptTr}
          </p>
        )}

        <div className="prose prose-lg text-[#14141A]/85 leading-relaxed whitespace-pre-line">
          {post.bodyTr}
        </div>
      </section>
    </article>
  );
}

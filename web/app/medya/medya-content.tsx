"use client";

import Link from "next/link";
import { ExternalLink, Calendar } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import type { BlogPost } from "./page";

const KIND_LABELS = {
  ARTICLE: { tr: "Yazı", en: "Article" },
  PRESS: { tr: "Basın", en: "Press" },
  VIDEO: { tr: "Video", en: "Video" },
};

export function MedyaContent({ posts }: { posts: BlogPost[] }) {
  const [locale] = useLocale();

  return (
    <div className="bg-[#FAF8F4] min-h-screen pt-28 lg:pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="mb-12 lg:mb-16">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-3">
            {locale === "tr" ? "Medya" : "Media"}
          </p>
          <h1 className="font-display font-light text-4xl lg:text-6xl text-[#14141A]">
            {locale === "tr" ? "Yazılar & Basın" : "Articles & Press"}
          </h1>
          <p className="mt-4 text-base text-[#6E6E73] max-w-xl">
            {locale === "tr"
              ? "Sektörde dikkatimi çeken yazılar, basın haberleri ve video turlar."
              : "Articles, press features and video tours from the industry."}
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="py-24 text-center text-sm text-[#6E6E73]">
            {locale === "tr"
              ? "Henüz yazı yayınlanmadı. Yakında eklenecek."
              : "No posts yet. Coming soon."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, locale }: { post: BlogPost; locale: "tr" | "en" }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const isExternal = !!post.externalUrl;
  const href = isExternal ? post.externalUrl! : `/medya/${post.slug}`;
  const title = locale === "tr" ? post.titleTr : post.titleEn;
  const excerpt = locale === "tr" ? post.excerptTr : post.excerptEn;

  const Card = (
    <article className="group">
      <div className="aspect-[4/3] bg-[#1A1A1F] mb-4 overflow-hidden">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
            Hazal Muti
          </div>
        )}
      </div>
      <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4B36A] mb-2 inline-flex items-center gap-2">
        <span>{KIND_LABELS[post.kind][locale]}</span>
        {date && (
          <>
            <span className="text-[#6E6E73]/40">·</span>
            <span className="text-[#6E6E73] inline-flex items-center gap-1 normal-case tracking-wider">
              <Calendar className="h-3 w-3" /> {date}
            </span>
          </>
        )}
      </p>
      <h2 className="font-display text-xl lg:text-2xl text-[#14141A] leading-snug mb-2 group-hover:text-[#D4B36A] transition-colors">
        {title}
      </h2>
      {excerpt && (
        <p className="text-sm text-[#6E6E73] line-clamp-3 leading-relaxed">{excerpt}</p>
      )}
      {isExternal && (
        <p className="mt-3 inline-flex items-center gap-1 text-xs tracking-[0.2em] uppercase text-[#D4B36A]">
          {post.kind === "PRESS"
            ? locale === "tr" ? "Kaynakta oku" : "Read source"
            : locale === "tr" ? "Aç" : "Open"}
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

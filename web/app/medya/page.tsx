import type { Metadata } from "next";
import { MedyaContent } from "./medya-content";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.hazalmuti.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Medya · Yazılar & Basın / Media · Articles & Press",
  description:
    "Hazal Muti yazıları, basın haberleri ve videolar. / Hazal Muti articles, press features and videos.",
  alternates: { canonical: "/medya" },
  openGraph: {
    title: "Medya · Hazal Muti",
    description: "Yazılar, basın haberleri ve videolar.",
    url: "/medya",
    type: "website",
  },
};

export interface BlogPost {
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

export default async function MedyaPage() {
  const posts = await fetchPosts();
  return <MedyaContent posts={posts} />;
}

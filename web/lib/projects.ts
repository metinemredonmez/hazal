import { API_URL } from "./api";

export interface ProjectSpec {
  labelTr: string;
  labelEn: string;
  valueTr: string;
  valueEn: string;
}

export interface Project {
  id: string;
  slug: string;
  brandTr: string;
  brandEn: string;
  nameTr: string;
  nameEn: string;
  taglineTr: string;
  taglineEn: string;
  locationTr: string;
  locationEn: string;
  descriptionTr: string;
  descriptionEn: string;
  heroImage: string;
  heroVideo: string | null;
  specs: ProjectSpec[];
  featuresTr: string[];
  featuresEn: string[];
  gallery: string[];
  brochureUrl: string | null;
  statusTr: string;
  statusEn: string;
  statusTone: "live" | "exclusive";
  featured: boolean;
  order: number;
  isPublished: boolean;
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${API_URL}/api/projects`, {
      // ISR: revalidate every 60s on server
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Project[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchFeaturedProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${API_URL}/api/projects/featured`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Project[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

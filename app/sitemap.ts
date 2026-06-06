import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://worldbridge.app";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://worldbridge-backend.onrender.com/api/v1";

async function fetchSlugs(endpoint: string, field: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((item: Record<string, string>) => item[field]).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programSlugs, articleSlugs] = await Promise.all([
    fetchSlugs("/programs?size=500", "slug"),
    fetchSlugs("/articles?size=500", "slug"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), priority: 1.0 },
    { url: `${BASE_URL}/programs`, lastModified: new Date(), priority: 0.9 },
    { url: `${BASE_URL}/countries`, lastModified: new Date(), priority: 0.8 },
    { url: `${BASE_URL}/articles`, lastModified: new Date(), priority: 0.7 },
    { url: `${BASE_URL}/calculator`, lastModified: new Date(), priority: 0.6 },
  ];

  const programRoutes: MetadataRoute.Sitemap = programSlugs.map((slug) => ({
    url: `${BASE_URL}/programs/${slug}`,
    lastModified: new Date(),
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${BASE_URL}/articles/${slug}`,
    lastModified: new Date(),
    priority: 0.6,
  }));

  return [...staticRoutes, ...programRoutes, ...articleRoutes];
}

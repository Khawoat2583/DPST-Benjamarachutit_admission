import type { MetadataRoute } from "next";
import { getNewsPosts } from "@/features/news/actions";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/admission`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  let newsEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await getNewsPosts();
    if (res.success && res.posts) {
      newsEntries = res.posts.map((p) => ({
        url: `${SITE_URL}/news/${p.id}`,
        lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      }));
    }
  } catch {
    // If the DB is unreachable at build/runtime, fall back to static routes only.
  }

  return [...staticEntries, ...newsEntries];
}

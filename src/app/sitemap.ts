import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://kitsune-tales-qwen.vercel.app/", lastModified: new Date("2026-10-01"), changeFrequency: "monthly", priority: 1 }];
}

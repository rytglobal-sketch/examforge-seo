import type { MetadataRoute } from "next";
import { seoPages } from "@/lib/seo-pages";

const siteUrl = "https://examforge.academy";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    ...seoPages.map((page) => ({
      url: `${siteUrl}/${page.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

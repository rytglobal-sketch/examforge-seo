import type { MetadataRoute } from "next";

const siteUrl = "https://researchforge.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    ...["sign-in", "sign-up", "documents", "search", "notes", "billing"].map(
      (path) => ({
        url: `${siteUrl}/${path}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }),
    ),
  ];
}

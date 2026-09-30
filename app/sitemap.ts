import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  return [
    { url: site.url, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/posts`, changeFrequency: "daily", priority: 0.8 },
    { url: `${site.url}/archive`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${site.url}/tags`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${site.url}/categories`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.3 },
    ...posts.map((post) => ({
      url: `${site.url}/posts/${post.slug}`,
      lastModified: post.updated || post.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

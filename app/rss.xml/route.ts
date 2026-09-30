import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";
import { escapeXml } from "@/lib/xml";

export const dynamic = "force-dynamic";

export function GET() {
  const posts = getAllPosts();
  const items = posts
    .map((post) => {
      const link = `${site.url}/posts/${post.slug}`;
      return `<item><title>${escapeXml(post.title)}</title><link>${escapeXml(link)}</link><guid>${escapeXml(link)}</guid><pubDate>${escapeXml(post.date)}</pubDate><description>${escapeXml(post.excerpt)}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(site.name)}</title><link>${escapeXml(site.url)}</link><description>${escapeXml(site.description)}</description>${items}</channel></rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

import { fallbackSlug } from "./slug";
import { todayInShanghai } from "./time";
import type { PostInput } from "./posts";

export function parsePostInput(body: unknown, previousSlug?: string): PostInput | { error: string } {
  if (!body || typeof body !== "object") return { error: "请求格式不正确" };
  const data = body as Record<string, unknown>;
  const title = String(data.title ?? "").trim();
  const content = String(data.content ?? "").trim();
  const date = String(data.date ?? "").trim() || todayInShanghai();
  const category = String(data.category ?? "").trim() || "随笔";
  const excerpt = String(data.excerpt ?? "").trim();
  const requestedSlug = String(data.slug ?? "").trim() || previousSlug || fallbackSlug(date);
  const tags = Array.isArray(data.tags)
    ? data.tags.map((item) => String(item).trim()).filter(Boolean)
    : String(data.tags ?? "")
        .split(/[,，]/)
        .map((item) => item.trim())
        .filter(Boolean);

  if (!title) return { error: "请写下标题" };
  if (title.length > 80) return { error: "标题请控制在 80 字以内" };
  if (!content) return { error: "正文还是空白" };
  if (content.length > 200000) return { error: "正文过长" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "日期格式应为 YYYY-MM-DD" };
  if (category.length > 20) return { error: "分类名称过长" };
  if (tags.length > 8) return { error: "标签最多 8 个" };
  if (tags.some((tag) => tag.length > 20)) return { error: "单个标签请短一些" };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requestedSlug)) {
    return { error: "网址仅允许小写字母、数字与连字符" };
  }

  return {
    slug: requestedSlug,
    title,
    date,
    category,
    tags,
    excerpt,
    content,
    published: data.published !== false && data.published !== "false",
  };
}

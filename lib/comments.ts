import { randomBytes } from "crypto";
import { readJson, writeJson } from "./json-store";
import { assertSlug } from "./slug";

export type Comment = {
  id: string;
  slug: string;
  name: string;
  content: string;
  createdAt: string;
};

const file = "comments.json";

function clean(value: string) {
  return value.replace(/[<>]/g, "").trim();
}

export function validateComment(input: {
  slug?: string;
  name?: string;
  content?: string;
  website?: string;
}) {
  if (input.website && input.website.trim()) return { error: "spam" as const };
  const slug = String(input.slug ?? "").trim();
  const name = clean(String(input.name ?? "")) || "过客";
  const content = clean(String(input.content ?? "")).replace(/\s+/g, " ").trim();
  try {
    assertSlug(slug);
  } catch {
    return { error: "文章不存在" };
  }
  if (!content) return { error: "请写下想说的话" };
  if (name.length > 20) return { error: "名字请短一些" };
  if (content.length > 500) return { error: "留言请控制在 500 字以内" };
  return { slug, name, content };
}

export function listComments(slug?: string): Comment[] {
  const comments = readJson<Comment[]>(file, []);
  const filtered = slug ? comments.filter((item) => item.slug === slug) : comments;
  return filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function commentCounts() {
  const counts: Record<string, number> = {};
  for (const comment of readJson<Comment[]>(file, [])) {
    counts[comment.slug] = (counts[comment.slug] ?? 0) + 1;
  }
  return counts;
}

export function addComment(input: { slug: string; name: string; content: string }) {
  const comments = readJson<Comment[]>(file, []);
  const comment: Comment = {
    id: randomBytes(8).toString("hex"),
    slug: input.slug,
    name: input.name,
    content: input.content,
    createdAt: new Date().toISOString(),
  };
  comments.push(comment);
  writeJson(file, comments);
  return comment;
}

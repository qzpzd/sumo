import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { readJson, writeJson } from "./json-store";
import { assertSlug } from "./slug";
import { makeExcerpt, readingMinutes } from "./toc";
import { todayInShanghai } from "./time";

export type Post = {
  slug: string;
  title: string;
  date: string;
  updated: string;
  category: string;
  tags: string[];
  excerpt: string;
  published: boolean;
  content: string;
  readingMinutes: number;
};

export type PostInput = {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: string;
  published: boolean;
};

const postsDir = path.join(process.cwd(), "content", "posts");

function asString(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value ?? "").trim();
}

function asTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/[,，]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function asPublished(value: unknown) {
  return value !== false && value !== "false";
}

export function postPath(slug: string) {
  assertSlug(slug);
  const root = path.resolve(postsDir);
  const full = path.resolve(postsDir, `${slug}.md`);
  const relative = path.relative(root, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("非法路径");
  }
  return full;
}

function toPost(slug: string, raw: string): Post {
  const parsed = matter(raw);
  const data = parsed.data;
  const content = parsed.content.trim();
  const date = asString(data.date).slice(0, 10);
  return {
    slug,
    title: asString(data.title) || slug,
    date,
    updated: asString(data.updated).slice(0, 10) || date,
    category: asString(data.category) || "随笔",
    tags: asTags(data.tags),
    excerpt: makeExcerpt(content, asString(data.excerpt)),
    published: asPublished(data.published),
    content,
    readingMinutes: readingMinutes(content),
  };
}

export function getAllPosts(options?: { includeDrafts?: boolean }): Post[] {
  if (!fs.existsSync(postsDir)) return [];
  const posts = fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.slice(0, -3);
      return toPost(slug, fs.readFileSync(path.join(postsDir, file), "utf8"));
    });
  const visible = options?.includeDrafts ? posts : posts.filter((post) => post.published);
  return visible.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title, "zh")));
}

export function getPost(slug: string, options?: { includeDrafts?: boolean }) {
  try {
    assertSlug(slug);
  } catch {
    return null;
  }
  const file = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const post = toPost(slug, fs.readFileSync(file, "utf8"));
  if (!post.published && !options?.includeDrafts) return null;
  return post;
}

export function savePost(input: PostInput, previousSlug?: string) {
  fs.mkdirSync(postsDir, { recursive: true });
  assertSlug(input.slug);
  const destination = postPath(input.slug);
  if (previousSlug && previousSlug !== input.slug) {
    const source = postPath(previousSlug);
    if (!fs.existsSync(source)) throw Object.assign(new Error("原文不存在"), { status: 404 });
    if (fs.existsSync(destination)) throw Object.assign(new Error("该网址已存在"), { status: 409 });
    fs.renameSync(source, destination);
  } else if (!previousSlug && fs.existsSync(destination)) {
    throw Object.assign(new Error("该网址已存在"), { status: 409 });
  } else if (previousSlug && !fs.existsSync(destination)) {
    throw Object.assign(new Error("原文不存在"), { status: 404 });
  }

  const content = input.content.replace(/\r\n/g, "\n").trim();
  const file = matter.stringify(`${content}\n`, {
    title: input.title.trim(),
    date: input.date,
    updated: todayInShanghai(),
    category: input.category.trim() || "随笔",
    tags: input.tags,
    excerpt: makeExcerpt(content, input.excerpt),
    published: input.published,
  });
  fs.writeFileSync(destination, file, "utf8");
  return input.slug;
}

export function deletePost(slug: string) {
  const file = postPath(slug);
  if (!fs.existsSync(file)) throw Object.assign(new Error("原文不存在"), { status: 404 });
  fs.unlinkSync(file);
  const comments = readJson<CommentRecord[]>("comments.json", []).filter((item) => item.slug !== slug);
  writeJson("comments.json", comments);
  const views = readJson<Record<string, number>>("views.json", {});
  delete views[slug];
  writeJson("views.json", views);
}

type CommentRecord = { slug: string };

export function relatedPosts(post: Post, limit = 3) {
  const tags = new Set(post.tags);
  return getAllPosts()
    .filter((item) => item.slug !== post.slug)
    .map((item) => ({
      item,
      score: item.tags.filter((tag) => tags.has(tag)).length + (item.category === post.category ? 1 : 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (a.item.date < b.item.date ? 1 : -1))
    .slice(0, limit)
    .map((item) => item.item);
}

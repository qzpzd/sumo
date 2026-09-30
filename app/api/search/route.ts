import { getAllPosts } from "@/lib/posts";
import { searchPosts } from "@/lib/search";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") || "";
  const items = searchPosts(getAllPosts(), q).map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    category: post.category,
    tags: post.tags,
  }));
  return NextResponse.json({ items });
}

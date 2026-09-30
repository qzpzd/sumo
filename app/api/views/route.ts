import { assertSlug } from "@/lib/slug";
import { getPost } from "@/lib/posts";
import { incrementViews } from "@/lib/views";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { slug?: string };
  try {
    body = (await request.json()) as { slug?: string };
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }
  const slug = String(body.slug ?? "");
  try {
    assertSlug(slug);
  } catch {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }
  if (!getPost(slug)) return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  return NextResponse.json({ views: incrementViews(slug) });
}

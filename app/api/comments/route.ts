import { addComment, listComments, validateComment } from "@/lib/comments";
import { getPost } from "@/lib/posts";
import { createRateLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const allow = createRateLimiter(5, 10 * 60 * 1000);

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug") || "";
  if (!getPost(slug)) return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  return NextResponse.json({ comments: listComments(slug) });
}

export async function POST(request: Request) {
  if (!allow(clientKey(request))) {
    return NextResponse.json({ error: "写得太勤，稍后再来" }, { status: 429 });
  }
  let body: { slug?: string; name?: string; content?: string; website?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }
  const parsed = validateComment(body);
  if ("error" in parsed) {
    if (parsed.error === "spam") return NextResponse.json({ ok: true });
    return NextResponse.json(parsed, { status: 400 });
  }
  if (!getPost(parsed.slug)) return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  const comment = addComment(parsed);
  return NextResponse.json({ ok: true, comment });
}

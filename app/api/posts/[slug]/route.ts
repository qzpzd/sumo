import { requireAdmin } from "@/lib/guard";
import { parsePostInput } from "@/lib/post-input";
import { deletePost, savePost } from "@/lib/posts";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ slug: string }> };

export async function PUT(request: Request, context: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { slug } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }
  const parsed = parsePostInput(body, slug);
  if ("error" in parsed) return NextResponse.json(parsed, { status: 400 });
  try {
    const nextSlug = savePost(parsed, slug);
    return NextResponse.json({ ok: true, slug: nextSlug });
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
    const message = error instanceof Error ? error.message : "保存失败";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { slug } = await context.params;
  try {
    deletePost(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
    const message = error instanceof Error ? error.message : "删除失败";
    return NextResponse.json({ error: message }, { status });
  }
}

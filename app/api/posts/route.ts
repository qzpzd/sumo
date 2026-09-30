import { requireAdmin } from "@/lib/guard";
import { parsePostInput } from "@/lib/post-input";
import { savePost } from "@/lib/posts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }
  const parsed = parsePostInput(body);
  if ("error" in parsed) return NextResponse.json(parsed, { status: 400 });
  try {
    const slug = savePost(parsed);
    return NextResponse.json({ ok: true, slug });
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
    const message = error instanceof Error ? error.message : "保存失败";
    return NextResponse.json({ error: message }, { status });
  }
}

import { requireAdmin } from "@/lib/guard";
import { runDailyPush, sendConnectivityPing } from "@/lib/push";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  let body: { mode?: string };
  try {
    body = (await request.json()) as { mode?: string };
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }
  if (body.mode === "ping") return NextResponse.json(await sendConnectivityPing());
  if (body.mode === "latest") return NextResponse.json(await runDailyPush({ mode: "latest", force: true }));
  if (body.mode === "today") return NextResponse.json(await runDailyPush({ mode: "today", force: true }));
  return NextResponse.json({ error: "未知的推送方式" }, { status: 400 });
}

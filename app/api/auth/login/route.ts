import { NextResponse } from "next/server";
import { adminPasswordOk, sessionSecret, signSession } from "@/lib/session";

export async function POST(request: Request) {
  const secret = sessionSecret();
  if (!secret || !process.env.SEAL_KEY) {
    return NextResponse.json({ error: "未配置管理口令" }, { status: 500 });
  }
  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }
  if (!adminPasswordOk(String(body.password ?? ""))) {
    return NextResponse.json({ error: "口令不对" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("ink_session", signSession(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

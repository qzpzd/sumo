import { NextResponse } from "next/server";
import { isAdmin } from "./current-user";

export async function requireAdmin() {
  if (await isAdmin()) return null;
  return NextResponse.json({ error: "未登录" }, { status: 401 });
}

import { createHash, createHmac, timingSafeEqual } from "crypto";
import { unseal } from "./crypto";
import { SEALED_ADMIN_PASSWORD } from "./sealed";

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function sessionSecret() {
  return process.env.SESSION_SECRET || process.env.SEAL_KEY || "";
}

function expectedAdminPassword() {
  return unseal(SEALED_ADMIN_PASSWORD, process.env.SEAL_KEY || "");
}

export function adminPasswordOk(input: string) {
  if (!input || !process.env.SEAL_KEY || !SEALED_ADMIN_PASSWORD) return false;
  try {
    const expected = expectedAdminPassword();
    const actual = createHash("sha256").update(input).digest();
    const wanted = createHash("sha256").update(expected).digest();
    return actual.length === wanted.length && timingSafeEqual(actual, wanted);
  } catch {
    return false;
  }
}

export function signSession(secret: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ role: "admin", exp: now + MAX_AGE_MS })).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined, secret: string, now = Date.now()) {
  if (!token || !secret) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const actualBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length || !timingSafeEqual(actualBuf, expectedBuf)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { role?: string; exp?: number };
    return data.role === "admin" && typeof data.exp === "number" && data.exp > now;
  } catch {
    return false;
  }
}

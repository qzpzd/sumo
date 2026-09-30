import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

export const SEAL_SALT = "moyan-ink-seal-v1";

function deriveKey(secret: string) {
  return scryptSync(secret, SEAL_SALT, 32);
}

export function seal(plain: string, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(secret), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, data]).toString("base64url");
}

export function unseal(payload: string, secret: string): string {
  if (!payload || !secret) {
    throw new Error("缺少密文或密钥");
  }
  const buf = Buffer.from(payload, "base64url");
  if (buf.length < 29) {
    throw new Error("密文格式不正确");
  }
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", deriveKey(secret), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

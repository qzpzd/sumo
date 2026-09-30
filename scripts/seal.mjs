import { createCipheriv, randomBytes, scryptSync } from "crypto";
import fs from "fs";

function loadExisting() {
  if (!fs.existsSync(".env.local")) return;
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 0) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function seal(plain, secret) {
  const iv = randomBytes(12);
  const key = scryptSync(secret, "moyan-ink-seal-v1", 32);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, data]).toString("base64url");
}

loadExisting();

const webhook = process.env.WEBHOOK_URL?.trim();

if (!webhook || !webhook.startsWith("https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=")) {
  console.error("请通过环境变量 WEBHOOK_URL 提供企业微信机器人地址。");
  process.exit(1);
}

const sealKey = process.env.SEAL_KEY?.trim() || randomBytes(32).toString("base64url");
const sessionSecret = process.env.SESSION_SECRET?.trim() || randomBytes(32).toString("base64url");
const cronSecret = process.env.CRON_SECRET?.trim() || randomBytes(24).toString("base64url");
const deskPassword = process.env.DESK_PASSWORD?.trim() || "admin";

const sealedWebhook = seal(webhook, sealKey);
const sealedPassword = seal(deskPassword, sealKey);

fs.mkdirSync("lib", { recursive: true });
fs.writeFileSync(
  "lib/sealed.ts",
  [
    "/** AES-256-GCM ciphertext. Decrypt with SEAL_KEY. */",
    `export const SEALED_WEBHOOK = ${JSON.stringify(sealedWebhook)};`,
    `export const SEALED_ADMIN_PASSWORD = ${JSON.stringify(sealedPassword)};`,
    "",
  ].join("\n"),
  "utf8",
);

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
const envText = [
  `NEXT_PUBLIC_SITE_URL=${siteUrl}`,
  `SEAL_KEY=${sealKey}`,
  `SESSION_SECRET=${sessionSecret}`,
  `CRON_SECRET=${cronSecret}`,
  "ENABLE_SCHEDULER=true",
  "PUSH_CRON=0 8 * * *",
  "PUSH_TZ=Asia/Shanghai",
  "",
].join("\n");

fs.writeFileSync(".env.local", envText, "utf8");
console.log("已写入加密后的 webhook、管理口令与 .env.local。明文不会出现在源码中。");

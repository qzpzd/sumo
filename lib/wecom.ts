import { SEALED_WEBHOOK } from "./sealed";
import { unseal } from "./crypto";

export function webhookUrl() {
  const secret = process.env.SEAL_KEY || "";
  if (!secret || !SEALED_WEBHOOK) {
    throw new Error("推送密钥未配置");
  }
  try {
    return unseal(SEALED_WEBHOOK, secret);
  } catch {
    throw new Error("推送密钥无法解密，请检查 SEAL_KEY");
  }
}

export async function sendWecomPayload(webhook: string, payload: object) {
  let response: Response;
  try {
    response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("无法连接企业微信");
  }

  let data: { errcode?: number; errmsg?: string } = {};
  try {
    data = (await response.json()) as { errcode?: number; errmsg?: string };
  } catch {
    throw new Error("企业微信返回了无法识别的内容");
  }
  if (!response.ok || (typeof data.errcode === "number" && data.errcode !== 0)) {
    throw new Error(data.errmsg ? `企业微信推送失败：${data.errmsg}` : "企业微信推送失败");
  }
  return data;
}

export function sendWecomMarkdown(webhook: string, content: string) {
  return sendWecomPayload(webhook, { msgtype: "markdown", markdown: { content } });
}

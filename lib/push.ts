import { buildDailyMarkdown, buildPingMarkdown, postsNotYetPushed, selectDailyPosts } from "./digest";
import { readJson, writeJson } from "./json-store";
import { getAllPosts } from "./posts";
import { site } from "./site";
import { todayInShanghai } from "./time";
import { sendWecomMarkdown, webhookUrl } from "./wecom";

export type PushLog = {
  date?: string;
  slugs?: string[];
  lastAt?: string;
  lastResult?: string;
  lastError?: string;
};

export type PushResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  count?: number;
  titles?: string[];
  error?: string;
};

const logFile = "push-log.json";

export function getPushLog() {
  return readJson<PushLog>(logFile, {});
}

function remember(patch: PushLog) {
  writeJson(logFile, { ...getPushLog(), ...patch, lastAt: new Date().toISOString() });
}

async function deliver(content: string): Promise<PushResult> {
  try {
    await sendWecomMarkdown(webhookUrl(), content);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "推送失败";
    remember({ lastResult: "失败", lastError: message });
    return { ok: false, error: message };
  }
}

export async function sendConnectivityPing(): Promise<PushResult> {
  const result = await deliver(buildPingMarkdown(site.url));
  if (result.ok) {
    remember({ lastResult: "连通性测试已发送", lastError: "" });
    return { ok: true, count: 0, reason: "连通性测试已发送" };
  }
  return result;
}

export async function runDailyPush(options?: { force?: boolean; mode?: "today" | "latest" }): Promise<PushResult> {
  const mode = options?.mode ?? "today";
  const posts = getAllPosts();
  const today = todayInShanghai();
  let chosen = mode === "latest" ? posts.slice(0, 1) : selectDailyPosts(posts, today);

  if (mode === "today" && !options?.force) {
    const pending = new Set(postsNotYetPushed(chosen.map((post) => post.slug), getPushLog(), today));
    chosen = chosen.filter((post) => pending.has(post.slug));
  }

  if (!chosen.length) {
    const reason = mode === "latest" ? "还没有已发布的文章" : "今日无新文章";
    remember({ lastResult: reason, lastError: "" });
    return { ok: true, skipped: true, reason, count: 0 };
  }

  const result = await deliver(buildDailyMarkdown(chosen, site.url));
  if (!result.ok) return result;

  const previous = getPushLog();
  const patch: PushLog = { lastResult: `已发送 ${chosen.length} 篇`, lastError: "" };
  if (mode === "today") {
    patch.date = today;
    patch.slugs = [...new Set([...(previous.date === today ? previous.slugs ?? [] : []), ...chosen.map((post) => post.slug)])];
  }
  remember(patch);
  return { ok: true, count: chosen.length, titles: chosen.map((post) => post.title) };
}

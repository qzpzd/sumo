"use client";

import type { PushLog } from "@/lib/push";
import { useState } from "react";

export function PushPanel({ log }: { log: PushLog }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function run(mode: "today" | "latest" | "ping") {
    setPending(true);
    setMessage("正在送往企业微信…");
    const response = await fetch("/api/admin/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    const result = (await response.json()) as { ok?: boolean; skipped?: boolean; reason?: string; error?: string; count?: number; titles?: string[] };
    setPending(false);
    if (!result.ok) {
      setMessage(result.error || "没有送出");
      return;
    }
    if (result.skipped || result.reason) {
      setMessage(result.reason || "已完成");
      return;
    }
    setMessage(`已发送 ${result.count ?? 0} 篇${result.titles?.length ? `：${result.titles.join("、")}` : ""}`);
  }

  const lastAt = log.lastAt
    ? new Date(log.lastAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })
    : "尚无";

  return (
    <section className="border border-line p-5">
      <h2 className="text-xl">企业微信</h2>
      <p className="mt-2 text-sm leading-loose text-mist">
        每天 8:00（上海）自动发送当日新文章。机器人地址以 AES-256-GCM 密文存放，不明文出现在代码里。
      </p>
      <p className="mt-3 text-sm text-ink-soft">
        最近一次：{log.lastResult || "尚未推送"} · {lastAt}
      </p>
      {log.lastError ? <p className="mt-1 text-sm text-cinnabar">{log.lastError}</p> : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn-seal" disabled={pending} onClick={() => run("today")}>
          推送今日
        </button>
        <button type="button" className="btn-ink" disabled={pending} onClick={() => run("latest")}>
          推送最新一篇
        </button>
        <button type="button" className="btn-ink" disabled={pending} onClick={() => run("ping")}>
          连通性测试
        </button>
      </div>
      {message ? <p className="mt-4 text-sm">{message}</p> : null}
    </section>
  );
}

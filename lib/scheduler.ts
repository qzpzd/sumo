import cron from "node-cron";
import { runDailyPush } from "./push";

export function startScheduler() {
  const globalState = globalThis as typeof globalThis & { __inkSchedulerStarted?: boolean };
  if (globalState.__inkSchedulerStarted) return;
  if (process.env.ENABLE_SCHEDULER === "false") return;

  const expression = process.env.PUSH_CRON || "0 8 * * *";
  const timezone = process.env.PUSH_TZ || "Asia/Shanghai";
  if (!cron.validate(expression)) {
    console.error("[素墨] 推送 cron 表达式无效");
    return;
  }

  globalState.__inkSchedulerStarted = true;
  cron.schedule(
    expression,
    () => {
      runDailyPush()
        .then((result) => {
          if (result.ok && result.skipped) console.log(`[素墨] 每日推送：${result.reason}`);
          else if (result.ok) console.log(`[素墨] 每日推送已发送 ${result.count} 篇`);
          else console.error(`[素墨] 每日推送失败：${result.error}`);
        })
        .catch((error: unknown) => {
          console.error("[素墨] 每日推送失败", error instanceof Error ? error.message : error);
        });
    },
    { timezone },
  );
  console.log(`[素墨] 已设定每日推送 ${expression}（${timezone}）`);
}

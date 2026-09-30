import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const stash = path.join(root, ".pages-stash");
const liveNext = path.join(root, ".next");
const backupNext = path.join(root, ".next-live");
const hidden = ["app/api", "app/rss.xml", "app/admin"];
const layoutPath = path.join(root, "app", "layout.tsx");
const dynamicLine = 'export const dynamic = "force-dynamic";';
const staticLine = 'export const dynamic = "force-static";';

function hideDynamicRoutes() {
  fs.rmSync(stash, { recursive: true, force: true });
  fs.mkdirSync(stash, { recursive: true });
  for (const rel of hidden) {
    const from = path.join(root, rel);
    if (!fs.existsSync(from)) continue;
    const to = path.join(stash, rel);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.cpSync(from, to, { recursive: true });
    fs.rmSync(from, { recursive: true, force: true });
  }
}

function backupLiveBuild() {
  if (!fs.existsSync(liveNext)) return;
  fs.rmSync(backupNext, { recursive: true, force: true });
  fs.cpSync(liveNext, backupNext, { recursive: true });
}

function restoreLiveBuild() {
  if (!fs.existsSync(backupNext)) return;
  fs.rmSync(liveNext, { recursive: true, force: true });
  fs.cpSync(backupNext, liveNext, { recursive: true });
  fs.rmSync(backupNext, { recursive: true, force: true });
}

function restoreDynamicRoutes() {
  for (const rel of hidden) {
    const from = path.join(stash, rel);
    if (!fs.existsSync(from)) continue;
    const to = path.join(root, rel);
    fs.rmSync(to, { recursive: true, force: true });
    fs.cpSync(from, to, { recursive: true });
  }
  fs.rmSync(stash, { recursive: true, force: true });
}

function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildRss() {
  const site = "https://qzpzd.github.io/sumo";
  const dir = path.join(root, "content", "posts");
  const items = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      if (/published:\s*false/.test(raw)) return "";
      const title = /title:\s*"?([^"\n]+)"?/.exec(raw)?.[1] ?? file;
      const excerpt = /excerpt:\s*(?:"([^"]*)"|([^\n]+))/.exec(raw);
      const slug = file.slice(0, -3);
      const link = `${site}/posts/${slug}/`;
      return `<item><title>${escapeXml(title)}</title><link>${link}</link><guid>${link}</guid><description>${escapeXml(excerpt?.[1] || excerpt?.[2] || "")}</description></item>`;
    })
    .filter(Boolean)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>素墨</title><link>${site}/</link><description>极简水墨个人博客</description>${items}</channel></rss>`;
}

const originalLayout = fs.readFileSync(layoutPath, "utf8");
if (!originalLayout.includes(dynamicLine)) {
  console.error("app/layout.tsx 里没有预期的 dynamic 配置，已停止导出。");
  process.exit(1);
}

let status = 1;
try {
  backupLiveBuild();
  hideDynamicRoutes();
  fs.writeFileSync(layoutPath, originalLayout.replace(dynamicLine, staticLine));
  const result = spawnSync("npx", ["next", "build"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      GITHUB_PAGES: "1",
      NEXT_PUBLIC_SITE_URL: "https://qzpzd.github.io/sumo",
      ENABLE_SCHEDULER: "false",
    },
  });
  status = result.status ?? 1;
  if (status === 0) {
    const out = path.join(root, "out");
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, ".nojekyll"), "");
    fs.writeFileSync(path.join(out, "rss.xml"), buildRss());
  }
} finally {
  fs.writeFileSync(layoutPath, originalLayout);
  restoreDynamicRoutes();
  restoreLiveBuild();
}

process.exit(status);

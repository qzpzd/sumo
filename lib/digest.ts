export type DigestPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  published: boolean;
  content?: string;
};

export function selectDailyPosts<T extends { date: string; published: boolean }>(posts: T[], today: string) {
  return posts.filter((post) => post.published && post.date === today);
}

export function postsNotYetPushed(slugs: string[], log: { date?: string; slugs?: string[] } | null, today: string) {
  if (!log || log.date !== today) return slugs;
  const sent = new Set(log.slugs ?? []);
  return slugs.filter((slug) => !sent.has(slug));
}

function siteBase(siteUrl: string) {
  return siteUrl.replace(/\/$/, "");
}

export function articleUrl(siteUrl: string, slug: string) {
  return `${siteBase(siteUrl)}/posts/${slug}`;
}

/** WeCom in-app browser generally cannot open localhost or private LAN addresses. */
export function isPublicSiteUrl(siteUrl: string) {
  try {
    const url = new URL(siteUrl);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local")) return false;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      const [a, b] = host.split(".").map(Number);
      if (a === 10 || a === 127 || a === 0) return false;
      if (a === 192 && b === 168) return false;
      if (a === 172 && b >= 16 && b <= 31) return false;
      if (a === 169 && b === 254) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Reduce Markdown to the subset WeCom robots actually render. */
export function toWecomBody(markdown: string) {
  const lines: string[] = [];
  let inFence = false;
  for (const raw of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      lines.push(line ? `\`${line}\`` : "");
      continue;
    }
    if (/^\|/.test(line.trim())) continue;
    if (/^[-*_]{3,}$/.test(line.trim())) continue;
    const heading = /^(#{1,6})\s+(.+)$/.exec(line.trim());
    if (heading) {
      lines.push(`**${heading[2].trim()}**`);
      continue;
    }
    const list = /^[-*+]\s+(.+)$/.exec(line.trim());
    if (list) {
      lines.push(`• ${list[1]}`);
      continue;
    }
    const ordered = /^\d+\.\s+(.+)$/.exec(line.trim());
    if (ordered) {
      lines.push(`• ${ordered[1]}`);
      continue;
    }
    lines.push(line);
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function clipUtf8(text: string, maxBytes: number) {
  if (Buffer.byteLength(text, "utf8") <= maxBytes) return text;
  let end = text.length;
  while (end > 0 && Buffer.byteLength(text.slice(0, end), "utf8") > maxBytes - 12) end -= 1;
  return `${text.slice(0, end).trimEnd()}\n\n…`;
}

export function buildDailyMarkdown(posts: DigestPost[], siteUrl: string) {
  const publicUrl = isPublicSiteUrl(siteUrl);
  const blocks: string[] = [];

  for (const post of posts) {
    const parts = [
      "### 素墨 · 每日一文",
      "",
      `**${post.title}**`,
      `> 分类：<font color="comment">${post.category}</font>`,
      `> 日期：<font color="comment">${post.date}</font>`,
      `> ${post.excerpt}`,
      "",
    ];

    const body = toWecomBody(post.content || "");
    if (body) {
      parts.push(body, "");
    }

    if (publicUrl) {
      parts.push(`[阅读全文](${articleUrl(siteUrl, post.slug)})`);
    }

    blocks.push(parts.join("\n").trim());
  }

  return clipUtf8(blocks.join("\n\n"), 3900);
}

export function buildPingMarkdown(siteUrl: string) {
  const lines = ["### 素墨", "", "博客推送通道已接通。", "这是一条连通性测试。"];
  if (isPublicSiteUrl(siteUrl)) {
    lines.push("", `[打开博客](${siteBase(siteUrl)})`);
  } else {
    lines.push("", "当前站点尚未配置公网地址，正文会直接显示在推送里。");
  }
  return lines.join("\n");
}

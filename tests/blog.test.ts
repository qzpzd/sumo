import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { seal, unseal } from "../lib/crypto";
import { validateComment } from "../lib/comments";
import { buildDailyMarkdown, buildPingMarkdown, isPublicSiteUrl, postsNotYetPushed, selectDailyPosts, toWecomBody } from "../lib/digest";
import { loadEnvFile } from "../lib/env";
import { categoryCounts, groupByYear, paginate, tagCounts } from "../lib/group";
import { parsePostInput } from "../lib/post-input";
import { getAllPosts, getPost } from "../lib/posts";
import { createRateLimiter } from "../lib/rate-limit";
import { searchPosts } from "../lib/search";
import { SEALED_WEBHOOK } from "../lib/sealed";
import { adminPasswordOk, signSession, verifySession } from "../lib/session";
import { todayInShanghai } from "../lib/time";
import { extractToc, readingMinutes } from "../lib/toc";
import { escapeXml } from "../lib/xml";

test("加解密可以来回还原，并且错误密钥会失败", () => {
  const secret = "test-seal-key";
  const payload = seal("https://example.com/hook", secret);
  assert.equal(unseal(payload, secret), "https://example.com/hook");
  assert.throws(() => unseal(payload, "other-key"));
});

test("源码中的 webhook 是密文", () => {
  loadEnvFile();
  const source = fs.readFileSync("lib/sealed.ts", "utf8");
  assert.equal(source.includes("qyapi.weixin.qq.com"), false);
  assert.equal(source.includes("admin"), false);
  assert.equal(source.includes("SEALED_ADMIN_PASSWORD"), true);
  assert.equal(source.includes(SEALED_WEBHOOK) || source.includes("SEALED_WEBHOOK"), true);
  const secret = process.env.SEAL_KEY || "";
  let sealedOk = false;
  try {
    const url = new URL(unseal(SEALED_WEBHOOK, secret));
    sealedOk =
      url.origin === "https://qyapi.weixin.qq.com" &&
      url.pathname === "/cgi-bin/webhook/send" &&
      (url.searchParams.get("key")?.length ?? 0) === 36;
  } catch {
    sealedOk = false;
  }
  assert.equal(sealedOk, true);
});

test("上海时区的日期边界", () => {
  assert.equal(todayInShanghai(new Date("2026-09-28T16:30:00Z")), "2026-09-29");
  assert.equal(todayInShanghai(new Date("2026-09-28T15:30:00Z")), "2026-09-28");
});

test("只选择当天已发布且尚未推送的文章", () => {
  const posts = [
    { slug: "a", date: "2026-09-29", published: true },
    { slug: "b", date: "2026-09-28", published: true },
    { slug: "c", date: "2026-09-29", published: false },
  ];
  assert.deepEqual(
    selectDailyPosts(posts, "2026-09-29").map((post) => post.slug),
    ["a"],
  );
  assert.deepEqual(postsNotYetPushed(["a", "b"], { date: "2026-09-29", slugs: ["a"] }, "2026-09-29"), ["b"]);
  assert.deepEqual(postsNotYetPushed(["a"], { date: "2026-09-28", slugs: ["a"] }, "2026-09-29"), ["a"]);
});

test("每日推送包含正文，本地地址不生成失效链接", () => {
  const local = buildDailyMarkdown(
    [
      {
        slug: "yu-hou-zhu",
        title: "雨后的竹",
        excerpt: "雨停之后",
        date: "2026-09-29",
        category: "随笔",
        published: true,
        content: "夜里下过一场小雨。\n\n## 看见的顺序\n\n先看见颜色。",
      },
    ],
    "http://localhost:3000/",
  );
  assert.match(local, /雨后的竹/);
  assert.match(local, /夜里下过一场小雨/);
  assert.match(local, /\*\*看见的顺序\*\*/);
  assert.equal(local.includes("[阅读全文]"), false);
  assert.equal(local.includes("qyapi.weixin.qq.com"), false);

  const publicMsg = buildDailyMarkdown(
    [
      {
        slug: "yu-hou-zhu",
        title: "雨后的竹",
        excerpt: "雨停之后",
        date: "2026-09-29",
        category: "随笔",
        published: true,
        content: "正文一句。",
      },
    ],
    "https://blog.example.com",
  );
  assert.match(publicMsg, /\[阅读全文\]\(https:\/\/blog\.example\.com\/posts\/yu-hou-zhu\)/);
  assert.equal(isPublicSiteUrl("http://192.168.0.2:3000"), false);
  assert.equal(isPublicSiteUrl("https://blog.example.com"), true);
  assert.match(toWecomBody("- 一项\n\n| a | b |\n| --- | --- |\n"), /• 一项/);
  assert.match(buildPingMarkdown("http://localhost:3000"), /连通性测试/);
  assert.equal(buildPingMarkdown("http://localhost:3000").includes("[打开博客]"), false);
});

test("会话签名会过期，错误密钥无法通过", () => {
  const token = signSession("secret", 1_000);
  assert.equal(verifySession(token, "secret", 1_000 + 1000), true);
  assert.equal(verifySession(token, "secret", 1_000 + 8 * 24 * 60 * 60 * 1000), false);
  assert.equal(verifySession(token, "other", 1_000 + 1000), false);
  assert.equal(verifySession("bad", "secret"), false);
});

test("管理口令从密文还原后再比较", () => {
  loadEnvFile();
  assert.match(fs.readFileSync("lib/session.ts", "utf8"), /SEALED_ADMIN_PASSWORD/);
  assert.equal(adminPasswordOk("admin"), true);
  assert.equal(adminPasswordOk("nope"), false);
  assert.equal(adminPasswordOk(""), false);
});

test("留言校验与频率限制", () => {
  assert.equal("error" in validateComment({ slug: "yu-hou-zhu", content: "  好  ", website: "https://spam" }), true);
  const valid = validateComment({ slug: "yu-hou-zhu", name: "<墨客>", content: "一句也好" });
  assert.equal("content" in valid && valid.name === "墨客", true);
  const empty = validateComment({ slug: "yu-hou-zhu", content: "   " });
  assert.equal("error" in empty, true);

  const allow = createRateLimiter(2, 1000);
  assert.equal(allow("ip", 0), true);
  assert.equal(allow("ip", 10), true);
  assert.equal(allow("ip", 20), false);
  assert.equal(allow("ip", 1001), true);
});

test("目录、阅读时间、搜索、分页与归档", () => {
  const toc = extractToc("## 看见的顺序\n\n正文\n\n### 更细\n\n```\n## 不要收录\n```\n");
  assert.equal(toc.length, 2);
  assert.equal(toc[0].text, "看见的顺序");
  assert.equal(readingMinutes("字".repeat(800)), 2);

  const posts = [
    { title: "纸上的留白", excerpt: "雾", category: "随笔", tags: ["水墨"], content: "空白" },
    { title: "代码", excerpt: "函数", category: "技术", tags: ["代码"], content: "留白不是这里的重点" },
  ];
  assert.equal(searchPosts(posts, "留白")[0].title, "纸上的留白");
  assert.equal(searchPosts(posts, "没有").length, 0);

  const page = paginate([1, 2, 3, 4, 5], 2, 2);
  assert.deepEqual(page.items, [3, 4]);
  assert.equal(page.totalPages, 3);
  assert.deepEqual(tagCounts([{ tags: ["水墨"] }, { tags: ["水墨", "茶"] }]), [
    ["水墨", 2],
    ["茶", 1],
  ]);
  assert.equal(categoryCounts([{ category: "随笔" }, { category: "随笔" }])[0][1], 2);
  assert.equal(groupByYear([{ date: "2026-01-01" }, { date: "2025-01-01" }])[0][0], "2026");
});

test("文章输入校验", () => {
  const bad = parsePostInput({ title: "题", content: "文", slug: "Bad Slug" });
  assert.equal("error" in bad, true);
  const good = parsePostInput({ title: "雨", content: "正文", slug: "yu", date: "2026-09-29", tags: "竹，雨" });
  assert.equal("slug" in good && good.tags.join(","), "竹,雨");
});

test("示例文章可读，草稿不公开", () => {
  const posts = getAllPosts();
  assert.equal(posts.some((post) => post.slug === "wei-wan-cheng"), false);
  assert.equal(getAllPosts({ includeDrafts: true }).some((post) => post.slug === "wei-wan-cheng"), true);
  const post = getPost("yu-hou-zhu");
  assert.ok(post);
  assert.equal(post?.title, "雨后的竹");
  assert.equal(getPost("wei-wan-cheng"), null);
  assert.equal(escapeXml(`<雨>&"'`), "&lt;雨&gt;&amp;&quot;&apos;");
});

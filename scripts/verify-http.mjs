const base = "http://localhost:3000";
const failures = [];

function ok(condition, message) {
  if (condition) {
    console.log(`OK  ${message}`);
    return;
  }
  failures.push(message);
  console.error(`FAIL  ${message}`);
}

async function get(path, cookie) {
  const response = await fetch(base + path, {
    redirect: "manual",
    headers: cookie ? { cookie } : undefined,
  });
  const body = await response.text();
  return { status: response.status, body, headers: response.headers };
}

function cookiesFrom(response) {
  const list = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  return list.map((item) => item.split(";")[0]).join("; ");
}

const home = await get("/");
ok(home.status === 200 && home.body.includes("素墨") && home.body.includes("雨后的竹"), "首页有站名与今日文章");
ok(home.body.includes("目录"), "导航包含移动端目录");

const posts = await get("/posts");
ok(posts.status === 200 && posts.body.includes("纸上的留白") && posts.body.includes("冬日的书"), "文录列出已发布文章");
ok(!posts.body.includes("未完成的句子"), "草稿不出现在文录");

const article = await get("/posts/yu-hou-zhu");
ok(article.status === 200 && article.body.includes("雨已经停了") && article.body.includes("看见的顺序"), "文章详情含正文与目录");
ok(article.body.includes("纸边留言"), "文章页有留言区");

const draft = await get("/posts/wei-wan-cheng");
ok(draft.status === 404, "草稿地址返回 404");

const archive = await get("/archive");
ok(archive.status === 200 && archive.body.includes("2025") && archive.body.includes("2026"), "归档跨年");

const category = await get("/categories/" + encodeURIComponent("随笔"));
ok(category.status === 200 && category.body.includes("纸上的留白") && !category.body.includes("代码里的墨色"), "分类筛选正确");

const tags = await get("/tags");
ok(tags.status === 200 && tags.body.includes("水墨"), "标签页");

const about = await get("/about");
ok(about.status === 200 && about.body.includes("慢慢写"), "关于页");

const search = await get("/search?q=" + encodeURIComponent("留白"));
ok(search.status === 200 && search.body.includes("纸上的留白"), "搜索留白");

const missing = await get("/search?q=" + encodeURIComponent("没有这句"));
ok(missing.status === 200 && missing.body.includes("没有寻到"), "搜索空结果");

const code = await get("/posts/mo-se-dai-ma");
ok(code.status === 200 && code.body.includes("leaveBlank"), "技术文代码块");

const rss = await get("/rss.xml");
ok(rss.status === 200 && rss.body.includes("yu-hou-zhu") && !rss.body.includes("wei-wan-cheng"), "RSS 只含公开文章");

const sitemap = await get("/sitemap.xml");
ok(sitemap.status === 200 && sitemap.body.includes("/posts/liu-bai"), "站点地图");

const robots = await get("/robots.txt");
ok(robots.status === 200 && robots.body.includes("Disallow: /admin"), "robots 屏蔽后台");

const admin = await get("/admin");
ok(admin.status >= 300 && admin.status < 400 && (admin.headers.get("location") || "").includes("/admin/login"), "未登录后台会跳到登录");

const loginPage = await get("/admin/login");
ok(loginPage.status === 200 && loginPage.body.includes("入室"), "登录页");

const searchApi = await get("/api/search?q=" + encodeURIComponent("茶"));
const searchJson = JSON.parse(searchApi.body);
ok(searchApi.status === 200 && searchJson.items.some((item) => item.slug === "yi-zhan-cha"), "搜索接口");

const comment = await fetch(base + "/api/comments", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ slug: "yu-hou-zhu", name: "验证读者", content: "纸边一句，测完即删。" }),
});
const commentJson = await comment.json();
ok(comment.status === 200 && commentJson.comment?.name === "验证读者", "发表留言");
const afterComment = await get("/posts/yu-hou-zhu");
ok(afterComment.body.includes("纸边一句，测完即删。"), "留言出现在文章页");

const views = await fetch(base + "/api/views", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ slug: "yu-hou-zhu" }),
});
const viewsJson = await views.json();
ok(views.status === 200 && viewsJson.views >= 1, "阅读计数");

const denied = await fetch(base + "/api/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "x", content: "y", slug: "nope" }),
});
ok(denied.status === 401, "未登录不能写文章");

const env = Object.fromEntries(
  (await import("node:fs")).readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const badLogin = await fetch(base + "/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: "wrong-password" }),
});
ok(badLogin.status === 401, "错误口令被拒绝");

const login = await fetch(base + "/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: "admin" }),
});
const cookie = cookiesFrom(login);
ok(login.status === 200 && cookie.includes("ink_session"), "正确口令登录");

const created = await fetch(base + "/api/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json", cookie },
  body: JSON.stringify({
    slug: "verify-temp-note",
    title: "验证用短笺",
    date: "2026-09-29",
    category: "随笔",
    tags: "验证",
    content: "这是自动测试写下的一句，测完即删。",
    published: false,
  }),
});
ok(created.status === 200, "后台保存草稿");
const hidden = await get("/posts");
ok(!hidden.body.includes("验证用短笺"), "新草稿仍不公开");
const desk = await get("/admin", cookie);
ok(desk.status === 200 && desk.body.includes("验证用短笺") && desk.body.includes("草稿"), "书案能看到草稿");

const removed = await fetch(base + "/api/posts/verify-temp-note", { method: "DELETE", headers: { cookie } });
ok(removed.status === 200, "删除测试草稿");

const cronDenied = await fetch(base + "/api/cron/daily", { method: "POST" });
ok(cronDenied.status === 401, "定时接口拒绝匿名调用");

if (process.env.SKIP_PUSH === "1") {
  console.log("跳过重复推送");
} else {
  const cron = await fetch(base + "/api/cron/daily?force=1", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
  });
  const cronJson = await cron.json();
  ok(cron.status === 200 && cronJson.ok === true && cronJson.count >= 1, "定时接口送出今日文章");
  if (!cronJson.ok) console.error(cronJson.error || "推送失败");
  else console.log(`推送结果：${cronJson.titles?.join("、") || cronJson.reason || cronJson.count}`);
}

const fs = await import("node:fs");
const comments = JSON.parse(fs.readFileSync("data/comments.json", "utf8")).filter((item) => item.name !== "验证读者");
fs.writeFileSync("data/comments.json", JSON.stringify(comments, null, 2), "utf8");

if (failures.length) {
  console.error(`失败 ${failures.length} 项`);
  process.exit(1);
}
console.log("页面与接口验证通过");

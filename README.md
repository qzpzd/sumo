# 素墨

极简水墨风格的个人博客。文章、分类、标签、归档、搜索、评论、RSS，以及加密后的企业微信每日推送。

你提供的地址是企业微信群机器人，推送直接调用该接口。

## 启动

```powershell
npm install
$env:WEBHOOK_URL="你的企业微信机器人地址"
npm run seal
npm run dev
```

浏览器打开 <http://localhost:3000>。后台地址是 `/admin`。登录口令以 AES-256-GCM 密文写在 `lib/sealed.ts`，用 `SEAL_KEY` 解密后核对，源码里没有明文。

`npm run seal` 会把机器人地址和管理口令一并封进 `lib/sealed.ts`，密钥写入 `.env.local` 的 `SEAL_KEY`。默认口令为 `admin`；若要更换，先设 `DESK_PASSWORD` 再执行 `npm run seal`。

## 每日推送

开发或 `npm start` 长期运行时，默认每天 8:00（`Asia/Shanghai`）发送当天新文章。没有新文章则跳过。时间由 `PUSH_CRON` 与 `PUSH_TZ` 控制。

也可以交给系统计划任务：

```powershell
curl.exe -X POST http://localhost:3000/api/cron/daily -H "Authorization: Bearer 你的CRON_SECRET"
```

推送使用 Markdown，正文会直接写进企业微信消息，无需跳转也能阅读。只有当 `NEXT_PUBLIC_SITE_URL` 是公网 `https` 地址时，才会附上「阅读全文」链接；`localhost` 与局域网地址在企业微信里通常打不开，因此不会生成这类链接。

后台可以手动推送今日文章、最新一篇，或做连通性测试。

## 测试

```powershell
npm test
```

## 写文章

后台「新篇」使用 Markdown。也可以直接在 `content/posts` 增加 `.md`，在文首写标题、日期、分类、标签和 `published`。友链写在 `content/links.json`。

## GitHub Pages

仓库根目录的 `index.html` 供 [qzpzd.github.io/sumo](https://qzpzd.github.io/sumo/) 静态访问（Actions 会部署整仓）。同时保留了 `.nojekyll`、`about.html` 与 `posts/*.html`。本地完整功能仍用 `npm run dev` / `npm start`。

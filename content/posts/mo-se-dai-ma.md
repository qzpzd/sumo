---
title: 代码里的墨色
date: "2026-08-02"
category: 技术
tags:
  - 代码
  - 水墨
excerpt: 函数写清楚，比注释写得多更接近一幅完成的画。
published: true
---

写程序久了，会把页面也看成纸。背景是纸色，文字是墨，提醒用一点朱砂就够，再多就喧宾夺主。

## 名字要像落款

一个函数的名字应当让人知道它做什么，而不是它曾经打算做什么。短，并且落在实处。

```ts
export function leaveBlank(lines: string[]) {
  return lines.map((line) => line.trim()).filter(Boolean);
}
```

`leaveBlank` 只做一件事：去掉空行。它不排序，不翻译，也不顺便发通知。

## 改动要能单独看懂

提交之前看一遍差异，像退远了看一幅画。若某一块墨色太重，多半是这个改动里塞进了第二件事。拆开，各自落款。

> 能单独阅读的改动，以后也能单独撤回。

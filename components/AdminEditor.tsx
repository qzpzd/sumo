"use client";

import { MarkdownBody } from "./MarkdownBody";
import { FormEvent, useState } from "react";

export type EditorValue = {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string;
  excerpt: string;
  content: string;
  published: boolean;
};

export function AdminEditor({ initial, mode }: { initial: EditorValue; mode: "create" | "edit" }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function patch(partial: Partial<EditorValue>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch(mode === "create" ? "/api/posts" : `/api/posts/${initial.slug}`, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, published: form.published }),
    });
    const result = (await response.json()) as { error?: string; slug?: string };
    setPending(false);
    if (!response.ok) {
      setError(result.error || "没有保存");
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_220px]">
      <div className="space-y-5">
        <label className="field">
          <span>标题</span>
          <input value={form.title} onChange={(event) => patch({ title: event.target.value })} required maxLength={80} />
        </label>
        <label className="field">
          <span>摘要</span>
          <input value={form.excerpt} onChange={(event) => patch({ excerpt: event.target.value })} placeholder="留空则从正文截取" />
        </label>
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <span className="text-sm tracking-[0.12em] text-mist">正文 · Markdown</span>
            <span className="text-xs tracking-[0.08em] text-mist">左侧书写，右侧即时成文</span>
          </div>
          <div className="editor-split">
            <label className="editor-write">
              <span className="sr-only">Markdown 正文</span>
              <textarea
                value={form.content}
                onChange={(event) => patch({ content: event.target.value })}
                required
                spellCheck={false}
                placeholder={"## 小标题\n\n一段正文，**加重** 或 [链接](/posts/liu-bai)。"}
              />
            </label>
            <div className="editor-preview" aria-live="polite">
              <p className="mb-3 text-xs tracking-[0.18em] text-mist">预览</p>
              {form.content.trim() ? <MarkdownBody content={form.content} /> : <p className="text-mist">墨色还未落下。</p>}
            </div>
          </div>
        </div>
        {error ? <p className="text-sm text-cinnabar">{error}</p> : null}
        <button className="btn-seal" type="submit" disabled={pending}>
          {pending ? "落纸…" : form.published ? "发布" : "保存草稿"}
        </button>
      </div>
      <aside className="space-y-5">
        <label className="field">
          <span>网址</span>
          <input value={form.slug} onChange={(event) => patch({ slug: event.target.value })} placeholder="yu-hou-zhu" />
        </label>
        <label className="field">
          <span>日期</span>
          <input type="date" value={form.date} onChange={(event) => patch({ date: event.target.value })} required />
        </label>
        <label className="field">
          <span>分类</span>
          <input value={form.category} onChange={(event) => patch({ category: event.target.value })} />
        </label>
        <label className="field">
          <span>标签</span>
          <input value={form.tags} onChange={(event) => patch({ tags: event.target.value })} placeholder="水墨, 日常" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(event) => patch({ published: event.target.checked })}
          />
          公开
        </label>
      </aside>
    </form>
  );
}

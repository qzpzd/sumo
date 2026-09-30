"use client";

import type { Comment } from "@/lib/comments";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CommentSection({ slug, initial }: { slug: string; initial: Comment[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setError("");
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        name: data.get("name"),
        content: data.get("content"),
        website: data.get("website"),
      }),
    });
    const result = (await response.json()) as { error?: string; comment?: Comment };
    setPending(false);
    if (!response.ok) {
      setError(result.error || "没有送出");
      return;
    }
    if (result.comment) setItems((current) => [result.comment as Comment, ...current]);
    form.reset();
    router.refresh();
  }

  return (
    <section className="mt-16 border-t border-line pt-8">
      <h2 className="font-brush text-4xl">纸边留言</h2>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="field max-w-xs">
          <span>名字</span>
          <input name="name" maxLength={20} placeholder="过客" />
        </label>
        <label className="field">
          <span>留言</span>
          <textarea name="content" required maxLength={500} className="min-h-32" placeholder="一句也好" />
        </label>
        <label className="absolute -left-[9999px]" aria-hidden>
          网站
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        {error ? <p className="text-sm text-cinnabar">{error}</p> : null}
        <button className="btn-ink" type="submit" disabled={pending}>
          {pending ? "落下…" : "留下"}
        </button>
      </form>
      <div className="mt-8 space-y-6">
        {items.length === 0 ? <p className="text-mist">还没有人在纸边写字。</p> : null}
        {items.map((item) => (
          <article key={item.id} className="border-b border-line pb-5">
            <div className="flex items-baseline justify-between gap-4 text-sm text-mist">
              <strong className="font-medium text-ink">{item.name}</strong>
              <time dateTime={item.createdAt}>
                {new Date(item.createdAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })}
              </time>
            </div>
            <p className="mt-2 whitespace-pre-wrap leading-loose text-ink-soft">{item.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

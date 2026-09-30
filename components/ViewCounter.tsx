"use client";

import { useEffect, useState } from "react";

export function ViewCounter({ slug, initial }: { slug: string; initial: number }) {
  const [views, setViews] = useState(initial);

  useEffect(() => {
    const key = `ink-viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
      .then((response) => response.json())
      .then((data: { views?: number }) => {
        if (typeof data.views === "number") setViews(data.views);
      })
      .catch(() => undefined);
  }, [slug]);

  return <span>阅 {views}</span>;
}

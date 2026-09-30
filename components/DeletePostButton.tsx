"use client";

import { useState } from "react";

export function DeletePostButton({ slug }: { slug: string }) {
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!window.confirm("确定撕掉这一篇？")) return;
    setPending(true);
    const response = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
    if (!response.ok) {
      setPending(false);
      window.alert("没有删掉");
      return;
    }
    window.location.reload();
  }

  return (
    <button type="button" className="btn-ghost" onClick={onClick} disabled={pending}>
      删除
    </button>
  );
}

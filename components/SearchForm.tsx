"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function SearchForm({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-4">
      <label className="field flex-1">
        <span>搜寻</span>
        <input
          className="search-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="篇名、标签或正文里的句子"
          name="q"
        />
      </label>
      <button className="btn-ink" type="submit">
        寻
      </button>
    </form>
  );
}

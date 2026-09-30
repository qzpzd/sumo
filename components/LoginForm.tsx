"use client";

import { FormEvent, useState } from "react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const password = new FormData(event.currentTarget).get("password");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setPending(false);
    if (!response.ok) {
      setError("口令不对");
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-6 py-16">
      <header>
        <p className="text-xs tracking-[0.35em] text-cinnabar">ADMIN</p>
        <h1 className="mt-2 font-brush text-5xl">入室</h1>
      </header>
      <label className="field">
        <span>口令</span>
        <input name="password" type="password" required autoFocus />
      </label>
      {error ? <p className="text-sm text-cinnabar">{error}</p> : null}
      <button className="btn-seal" type="submit" disabled={pending}>
        {pending ? "核对…" : "进入"}
      </button>
    </form>
  );
}

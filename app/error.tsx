"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap py-24">
      <h1 className="font-brush text-5xl">纸页皱了</h1>
      <p className="mt-4 text-ink-soft">这一页没有展开。可以再试一次。</p>
      <button className="btn-ink mt-8" type="button" onClick={() => reset()}>
        再试一次
      </button>
    </div>
  );
}

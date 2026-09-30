import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-24">
      <p className="text-xs tracking-[0.35em] text-cinnabar">404</p>
      <h1 className="mt-3 font-brush text-6xl">这一页还未落笔</h1>
      <p className="mt-4 text-ink-soft">纸还是白的。回到有字的地方吧。</p>
      <Link href="/" className="btn-ink mt-8">
        回首页
      </Link>
    </div>
  );
}

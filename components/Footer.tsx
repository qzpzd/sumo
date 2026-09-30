import Link from "next/link";

export function Footer() {
  return (
    <footer className="no-print mt-16 border-t border-line">
      <div className="wrap flex flex-wrap items-center justify-between gap-3 py-8 text-sm text-mist">
        <p>© {new Date().getFullYear()} 素墨 · 纸上留白</p>
        <div className="flex gap-4">
          <Link href="/links" className="hover:text-ink">
            墨缘
          </Link>
          <Link href="/rss.xml" className="hover:text-ink">
            RSS
          </Link>
          <Link href="/admin" className="hover:text-ink">
            管理
          </Link>
        </div>
      </div>
    </footer>
  );
}

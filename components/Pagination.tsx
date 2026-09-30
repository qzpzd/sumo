import Link from "next/link";

export function Pagination({ current, totalPages, path }: { current: number; totalPages: number; path: string }) {
  if (totalPages <= 1) return null;
  const href = (page: number) => (page <= 1 ? path : `${path}?page=${page}`);
  return (
    <nav className="mt-10 flex items-center justify-between text-sm tracking-[0.14em]" aria-label="分页">
      {current > 1 ? (
        <Link href={href(current - 1)} className="btn-ink">
          上一页
        </Link>
      ) : (
        <span />
      )}
      <span className="text-mist">
        {current} / {totalPages}
      </span>
      {current < totalPages ? (
        <Link href={href(current + 1)} className="btn-ink">
          下一页
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

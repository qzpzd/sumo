"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/", "首页"],
  ["/posts", "文录"],
  ["/archive", "归档"],
  ["/categories", "分类"],
  ["/tags", "标签"],
  ["/about", "关于"],
];

function Item({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={active ? "text-cinnabar" : "text-ink-soft hover:text-ink"}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();
  return (
    <>
      <nav className="hidden items-center gap-5 text-sm tracking-[0.18em] md:flex">
        {links.map(([href, label]) => (
          <Item key={href} href={href} label={label} pathname={pathname} />
        ))}
        <Link href="/search" className="text-ink-soft hover:text-ink" aria-label="搜索">
          搜索
        </Link>
      </nav>
      <details className="no-print relative md:hidden">
        <summary className="cursor-pointer list-none tracking-[0.2em] text-ink-soft">目录</summary>
        <div className="absolute right-0 z-30 mt-3 flex w-36 flex-col gap-2 border border-line bg-paper p-4 text-sm tracking-[0.16em]">
          {links.map(([href, label]) => (
            <Item key={href} href={href} label={label} pathname={pathname} />
          ))}
          <Link href="/search">搜索</Link>
        </div>
      </details>
    </>
  );
}

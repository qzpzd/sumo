import { isAdmin } from "@/lib/current-user";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "管理", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div className="wrap py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <p className="font-brush text-4xl">书案</p>
        <nav className="flex flex-wrap items-center gap-4 text-sm tracking-[0.14em]">
          <Link href="/admin" className="hover:text-cinnabar">
            篇目
          </Link>
          <Link href="/admin/new" className="hover:text-cinnabar">
            新篇
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="btn-ghost" type="submit">
              退出
            </button>
          </form>
        </nav>
      </div>
      {children}
    </div>
  );
}

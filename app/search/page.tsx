import { PageTitle } from "@/components/PageTitle";
import { SearchScreen } from "@/components/SearchScreen";
import { commentCounts } from "@/lib/comments";
import { getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "搜索" };

export default function SearchPage() {
  const posts = getAllPosts();
  const counts = commentCounts();

  return (
    <div className="wrap py-12">
      <PageTitle kicker="SEARCH" title="搜索" desc="在标题、标签和正文里找一句旧话。" />
      <Suspense fallback={<p className="text-mist">墨色正在晕开…</p>}>
        <SearchScreen posts={posts} counts={counts} />
      </Suspense>
    </div>
  );
}

import { PageTitle } from "@/components/PageTitle";
import { PostCard } from "@/components/PostCard";
import { SearchForm } from "@/components/SearchForm";
import { commentCounts } from "@/lib/comments";
import { getAllPosts } from "@/lib/posts";
import { searchPosts } from "@/lib/search";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "搜索" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? searchPosts(getAllPosts(), query) : [];
  const counts = commentCounts();

  return (
    <div className="wrap py-12">
      <PageTitle kicker="SEARCH" title="搜索" desc="在标题、标签和正文里找一句旧话。" />
      <SearchForm initial={query} />
      <div className="mt-8">
        {query && results.length === 0 ? <p className="text-mist">没有寻到「{query}」。</p> : null}
        {results.map((post) => (
          <PostCard key={post.slug} post={post} comments={counts[post.slug] ?? 0} />
        ))}
      </div>
    </div>
  );
}

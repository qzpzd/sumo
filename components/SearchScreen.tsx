"use client";

import type { Post } from "@/lib/posts";
import { searchPosts } from "@/lib/search";
import { useSearchParams } from "next/navigation";
import { PostCard } from "./PostCard";
import { SearchForm } from "./SearchForm";

export function SearchScreen({ posts, counts }: { posts: Post[]; counts: Record<string, number> }) {
  const params = useSearchParams();
  const query = (params.get("q") || "").trim();
  const results = query ? searchPosts(posts, query) : [];

  return (
    <>
      <SearchForm initial={query} />
      <div className="mt-8">
        {query && results.length === 0 ? <p className="text-mist">没有寻到「{query}」。</p> : null}
        {results.map((post) => (
          <PostCard key={post.slug} post={post} comments={counts[post.slug] ?? 0} />
        ))}
      </div>
    </>
  );
}

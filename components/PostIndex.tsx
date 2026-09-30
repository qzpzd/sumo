"use client";

import type { Post } from "@/lib/posts";
import { paginate } from "@/lib/group";
import { pageSize } from "@/lib/site";
import { useSearchParams } from "next/navigation";
import { Pagination } from "./Pagination";
import { PostCard } from "./PostCard";

export function PostIndex({ posts, counts }: { posts: Post[]; counts: Record<string, number> }) {
  const params = useSearchParams();
  const page = Number(params.get("page") || "1");
  const view = paginate(posts, Number.isFinite(page) ? page : 1, pageSize);

  return (
    <>
      {view.items.map((post) => (
        <PostCard key={post.slug} post={post} comments={counts[post.slug] ?? 0} />
      ))}
      {view.total === 0 ? <p className="text-mist">这里还是一片留白。</p> : null}
      <Pagination current={view.current} totalPages={view.totalPages} path="/posts" />
    </>
  );
}

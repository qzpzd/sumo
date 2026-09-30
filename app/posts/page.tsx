import { PageTitle } from "@/components/PageTitle";
import { PostIndex } from "@/components/PostIndex";
import { commentCounts } from "@/lib/comments";
import { getAllPosts } from "@/lib/posts";
import { Suspense } from "react";

export default function PostsPage() {
  const posts = getAllPosts();
  const counts = commentCounts();

  return (
    <div className="wrap py-12">
      <PageTitle kicker="POSTS" title="文录" desc="按时间排开的短章。草稿不会出现在这里。" />
      <Suspense fallback={<p className="text-mist">墨色正在晕开…</p>}>
        <PostIndex posts={posts} counts={counts} />
      </Suspense>
    </div>
  );
}

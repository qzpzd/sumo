import { PageTitle } from "@/components/PageTitle";
import { Pagination } from "@/components/Pagination";
import { PostCard } from "@/components/PostCard";
import { commentCounts } from "@/lib/comments";
import { paginate } from "@/lib/group";
import { getAllPosts } from "@/lib/posts";
import { pageSize } from "@/lib/site";

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageText } = await searchParams;
  const page = Number(pageText || "1");
  const posts = getAllPosts();
  const view = paginate(posts, Number.isFinite(page) ? page : 1, pageSize);
  const counts = commentCounts();

  return (
    <div className="wrap py-12">
      <PageTitle kicker="POSTS" title="文录" desc="按时间排开的短章。草稿不会出现在这里。" />
      {view.items.map((post) => (
        <PostCard key={post.slug} post={post} comments={counts[post.slug] ?? 0} />
      ))}
      {view.total === 0 ? <p className="text-mist">这里还是一片留白。</p> : null}
      <Pagination current={view.current} totalPages={view.totalPages} path="/posts" />
    </div>
  );
}

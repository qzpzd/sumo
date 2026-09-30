import { InkLandscape, Seal } from "@/components/InkDecor";
import { PostCard } from "@/components/PostCard";
import Link from "next/link";
import { commentCounts } from "@/lib/comments";
import { categoryCounts, tagCounts } from "@/lib/group";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts();
  const latest = posts.slice(0, 4);
  const counts = commentCounts();
  const categories = categoryCounts(posts);
  const tags = tagCounts(posts);

  return (
    <>
      <section className="border-b border-line">
        <div className="wrap grid items-end gap-6 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
          <div>
            <Seal />
            <p className="mt-6 text-xs tracking-[0.42em] text-mist">INK AND PAPER</p>
            <h1 className="mt-3 font-brush text-7xl leading-none md:text-8xl">素墨</h1>
            <p className="mt-6 max-w-xl text-lg leading-loose text-ink-soft">
              墨淡情浓，字少意长。把日子写成短章，把留白留给风。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/posts" className="btn-ink">
                读文录
              </Link>
              <Link href="/about" className="btn-seal">
                关于
              </Link>
            </div>
          </div>
          <InkLandscape />
        </div>
      </section>
      <section className="wrap py-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-brush text-4xl">近作</h2>
          <p className="text-sm text-mist">
            {posts.length} 篇 · {tags.length} 个标签
          </p>
        </div>
        <div>
          {latest.map((post) => (
            <PostCard key={post.slug} post={post} comments={counts[post.slug] ?? 0} />
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          {categories.map(([name, count]) => (
            <Link key={name} href={`/categories/${encodeURIComponent(name)}`} className="border border-line px-3 py-1 text-sm hover:border-ink">
              {name}
              <span className="ml-2 text-mist">{count}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

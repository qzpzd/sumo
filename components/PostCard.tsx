import Link from "next/link";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/lib/time";

export function PostCard({ post, comments = 0 }: { post: Post; comments?: number }) {
  return (
    <article className="border-b border-line py-8">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <time dateTime={post.date} className="tracking-[0.14em] text-mist">
          {formatDate(post.date)}
        </time>
        <Link href={`/categories/${encodeURIComponent(post.category)}`} className="text-cinnabar">
          {post.category}
        </Link>
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-wide">
        <Link href={`/posts/${post.slug}`} className="hover:text-cinnabar">
          {post.title}
        </Link>
      </h2>
      <p className="mt-3 max-w-3xl leading-loose text-ink-soft">{post.excerpt}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-mist">
        {post.tags.map((tag) => (
          <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="hover:text-ink">
            #{tag}
          </Link>
        ))}
        <span>{post.readingMinutes} 分钟</span>
        {comments > 0 ? <span>{comments} 则留言</span> : null}
      </div>
    </article>
  );
}

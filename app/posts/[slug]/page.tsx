import { CommentSection } from "@/components/CommentSection";
import { MarkdownBody } from "@/components/MarkdownBody";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ViewCounter } from "@/components/ViewCounter";
import { listComments } from "@/lib/comments";
import { getPost, relatedPosts } from "@/lib/posts";
import { site } from "@/lib/site";
import { extractToc } from "@/lib/toc";
import { formatDate } from "@/lib/time";
import { getViews } from "@/lib/views";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "未找到" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", title: post.title, description: post.excerpt },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const toc = extractToc(post.content);
  const related = relatedPosts(post);
  const comments = listComments(post.slug);
  const views = getViews(post.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: { "@type": "Person", name: site.author },
    description: post.excerpt,
    mainEntityOfPage: `${site.url}/posts/${post.slug}`,
  };

  return (
    <article>
      <ReadingProgress />
      <div className="wrap py-12">
        <header className="max-w-3xl">
          <p className="text-xs tracking-[0.28em] text-cinnabar">{post.category}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">{post.title}</h1>
          <p className="mt-4 text-sm text-mist">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="mx-2">·</span>
            <span>{post.readingMinutes} 分钟</span>
            <span className="mx-2">·</span>
            <ViewCounter slug={post.slug} initial={views} />
          </p>
        </header>
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_200px]">
          <div>
            <MarkdownBody content={post.content} />
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="border border-line px-2 py-1 hover:border-ink">
                  #{tag}
                </Link>
              ))}
            </div>
            {related.length > 0 ? (
              <section className="mt-12 border-t border-line pt-6">
                <h2 className="text-lg">相邻的篇目</h2>
                <ul className="mt-3 space-y-2">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/posts/${item.slug}`} className="hover:text-cinnabar">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <CommentSection slug={post.slug} initial={comments} />
          </div>
          {toc.length > 0 ? (
            <aside className="no-print">
              <div className="sticky top-24">
                <p className="text-xs tracking-[0.28em] text-mist">目录</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "pl-3" : undefined}>
                      <a href={`#${item.id}`} className="text-ink-soft hover:text-cinnabar">
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}

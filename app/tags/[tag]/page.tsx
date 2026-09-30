import { PageTitle } from "@/components/PageTitle";
import { PostCard } from "@/components/PostCard";
import { commentCounts } from "@/lib/comments";
import { getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: decodeURIComponent(tag) };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  const posts = getAllPosts().filter((post) => post.tags.includes(name));
  if (!posts.length) notFound();
  const counts = commentCounts();
  return (
    <div className="wrap py-12">
      <PageTitle kicker="TAG" title={name} desc={`标了「${name}」的文章。`} />
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} comments={counts[post.slug] ?? 0} />
      ))}
    </div>
  );
}

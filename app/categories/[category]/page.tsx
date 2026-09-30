import { PageTitle } from "@/components/PageTitle";
import { PostCard } from "@/components/PostCard";
import { commentCounts } from "@/lib/comments";
import { getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  return { title: decodeURIComponent(category) };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const name = decodeURIComponent(category);
  const posts = getAllPosts().filter((post) => post.category === name);
  if (!posts.length) notFound();
  const counts = commentCounts();
  return (
    <div className="wrap py-12">
      <PageTitle kicker="CATEGORY" title={name} desc={`这一格里有 ${posts.length} 篇。`} />
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} comments={counts[post.slug] ?? 0} />
      ))}
    </div>
  );
}

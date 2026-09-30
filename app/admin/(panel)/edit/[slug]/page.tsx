import { AdminEditor } from "@/components/AdminEditor";
import { getPost } from "@/lib/posts";
import { notFound } from "next/navigation";

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug, { includeDrafts: true });
  if (!post) notFound();
  return (
    <AdminEditor
      mode="edit"
      initial={{
        slug: post.slug,
        title: post.title,
        date: post.date,
        category: post.category,
        tags: post.tags.join(", "),
        excerpt: post.excerpt,
        content: post.content,
        published: post.published,
      }}
    />
  );
}

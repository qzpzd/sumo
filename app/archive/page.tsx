import { PageTitle } from "@/components/PageTitle";
import { getAllPosts } from "@/lib/posts";
import { formatDate } from "@/lib/time";
import { groupByYear } from "@/lib/group";
import Link from "next/link";

export default function ArchivePage() {
  const groups = groupByYear(getAllPosts());
  return (
    <div className="wrap py-12">
      <PageTitle kicker="ARCHIVE" title="归档" desc="按年份收起。翻回去，像翻一叠旧宣纸。" />
      <div className="space-y-10">
        {groups.map(([year, posts]) => (
          <section key={year}>
            <h2 className="font-brush text-4xl">{year}</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {posts.map((post) => (
                <li key={post.slug} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
                  <Link href={`/posts/${post.slug}`} className="text-lg hover:text-cinnabar">
                    {post.title}
                  </Link>
                  <time dateTime={post.date} className="text-sm text-mist">
                    {formatDate(post.date)}
                  </time>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

import { PageTitle } from "@/components/PageTitle";
import { tagCounts } from "@/lib/group";
import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export default function TagsPage() {
  const tags = tagCounts(getAllPosts());
  const max = tags[0]?.[1] ?? 1;
  return (
    <div className="wrap py-12">
      <PageTitle kicker="TAGS" title="标签" desc="字越常出现，墨色越重。" />
      <div className="flex flex-wrap gap-4">
        {tags.map(([name, count]) => (
          <Link
            key={name}
            href={`/tags/${encodeURIComponent(name)}`}
            className="hover:text-cinnabar"
            style={{ fontSize: `${1 + (count / max) * 0.85}rem`, opacity: 0.55 + (count / max) * 0.45 }}
          >
            {name}
            <span className="ml-1 text-sm text-mist">{count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

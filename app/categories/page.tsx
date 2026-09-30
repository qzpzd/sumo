import { PageTitle } from "@/components/PageTitle";
import { categoryCounts } from "@/lib/group";
import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export default function CategoriesPage() {
  const categories = categoryCounts(getAllPosts());
  return (
    <div className="wrap py-12">
      <PageTitle kicker="CATEGORIES" title="分类" desc="文章落在不同的格子里，格子本身也要少。" />
      <ul className="divide-y divide-line border-y border-line">
        {categories.map(([name, count]) => (
          <li key={name}>
            <Link href={`/categories/${encodeURIComponent(name)}`} className="flex items-baseline justify-between py-5 hover:text-cinnabar">
              <span className="text-2xl">{name}</span>
              <span className="text-sm text-mist">{count} 篇</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

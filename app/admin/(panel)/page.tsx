import { DeletePostButton } from "@/components/DeletePostButton";
import { PushPanel } from "@/components/PushPanel";
import { getPushLog } from "@/lib/push";
import { getAllPosts } from "@/lib/posts";
import { formatDate } from "@/lib/time";
import Link from "next/link";

export default function AdminPage() {
  const posts = getAllPosts({ includeDrafts: true });
  const log = getPushLog();
  return (
    <div className="space-y-10">
      <PushPanel log={log} />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-mist">
            <tr className="border-b border-line">
              <th className="py-3 font-normal">标题</th>
              <th className="py-3 font-normal">日期</th>
              <th className="py-3 font-normal">状态</th>
              <th className="py-3 font-normal"> </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.slug} className="border-b border-line">
                <td className="py-4 pr-4">
                  <Link href={`/admin/edit/${post.slug}`} className="text-base hover:text-cinnabar">
                    {post.title}
                  </Link>
                </td>
                <td className="py-4 text-mist">{formatDate(post.date)}</td>
                <td className="py-4">{post.published ? "已发布" : "草稿"}</td>
                <td className="py-4 text-right">
                  {post.published ? (
                    <Link href={`/posts/${post.slug}`} className="mr-3 hover:text-cinnabar">
                      查看
                    </Link>
                  ) : null}
                  <DeletePostButton slug={post.slug} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

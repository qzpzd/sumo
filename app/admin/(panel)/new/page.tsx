import { AdminEditor } from "@/components/AdminEditor";
import { todayInShanghai } from "@/lib/time";

export default function NewPostPage() {
  return (
    <AdminEditor
      mode="create"
      initial={{
        slug: "",
        title: "",
        date: todayInShanghai(),
        category: "随笔",
        tags: "",
        excerpt: "",
        content: "",
        published: true,
      }}
    />
  );
}

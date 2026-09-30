export type Searchable = {
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  content: string;
};

function score(post: Searchable, query: string) {
  const title = post.title.toLowerCase();
  const excerpt = post.excerpt.toLowerCase();
  const category = post.category.toLowerCase();
  const tags = post.tags.join(" ").toLowerCase();
  const content = post.content.toLowerCase();
  let value = 0;
  if (title.includes(query)) value += 8;
  if (tags.includes(query)) value += 5;
  if (category.includes(query)) value += 4;
  if (excerpt.includes(query)) value += 3;
  if (content.includes(query)) value += 1;
  return value;
}

export function searchPosts<T extends Searchable>(posts: T[], q: string): T[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  return posts
    .map((post) => ({ post, value: score(post, query) }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((item) => item.post);
}

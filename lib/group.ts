export function paginate<T>(items: T[], page: number, size: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / size) || 1);
  const current = Math.min(Math.max(1, Number.isFinite(page) ? page : 1), totalPages);
  const start = (current - 1) * size;
  return { items: items.slice(start, start + size), current, totalPages, total };
}

export function tagCounts(posts: { tags: string[] }[]) {
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) map.set(tag, (map.get(tag) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh"));
}

export function categoryCounts(posts: { category: string }[]) {
  const map = new Map<string, number>();
  for (const post of posts) {
    if (!post.category) continue;
    map.set(post.category, (map.get(post.category) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh"));
}

export function groupByYear<T extends { date: string }>(posts: T[]) {
  const map = new Map<string, T[]>();
  for (const post of posts) {
    const year = post.date.slice(0, 4) || "未知";
    const list = map.get(year) ?? [];
    list.push(post);
    map.set(year, list);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

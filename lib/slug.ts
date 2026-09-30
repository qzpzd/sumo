export function assertSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("网址仅允许小写字母、数字与连字符");
  }
}

export function fallbackSlug(date: string) {
  const rand = Math.random().toString(36).slice(2, 6);
  return `note-${date.replace(/-/g, "")}-${rand}`;
}

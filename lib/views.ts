import { readJson, writeJson } from "./json-store";

const file = "views.json";

export function getViews(slug: string) {
  const views = readJson<Record<string, number>>(file, {});
  return views[slug] ?? 0;
}

export function getAllViews() {
  return readJson<Record<string, number>>(file, {});
}

export function incrementViews(slug: string) {
  const views = readJson<Record<string, number>>(file, {});
  views[slug] = (views[slug] ?? 0) + 1;
  writeJson(file, views);
  return views[slug];
}

import GithubSlugger from "github-slugger";

export type TocItem = { id: string; text: string; level: number };

function plainHeading(raw: string) {
  return raw
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .trim();
}

export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const text = plainHeading(match[2]);
    if (!text) continue;
    items.push({ id: slugger.slug(text), text, level: match[1].length });
  }
  return items;
}

export function readingMinutes(content: string) {
  const count = content.replace(/\s/g, "").length;
  return Math.max(1, Math.round(count / 400));
}

export function makeExcerpt(content: string, given?: string) {
  if (given && given.trim()) return given.trim();
  const plain = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_\[\]()`-]/g, "")
    .replace(/\s+/g, "")
    .trim();
  return plain.slice(0, 72);
}

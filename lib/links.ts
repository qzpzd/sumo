import fs from "fs";
import path from "path";

export type FriendLink = { name: string; url: string; note?: string };

export function getLinks(): FriendLink[] {
  const file = path.join(process.cwd(), "content", "links.json");
  if (!fs.existsSync(file)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8")) as FriendLink[];
    if (!Array.isArray(data)) return [];
    return data.filter(
      (item) => item && typeof item.name === "string" && typeof item.url === "string" && /^https?:\/\//.test(item.url),
    );
  } catch {
    return [];
  }
}

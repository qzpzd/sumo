import fs from "fs";
import path from "path";

export const dataDir = path.join(process.cwd(), "data");

export function readJson<T>(filename: string, fallback: T): T {
  const file = path.join(dataDir, filename);
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(filename: string, data: unknown) {
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, filename);
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, file);
}

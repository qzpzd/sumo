import { MarkdownBody } from "@/components/MarkdownBody";
import { PageTitle } from "@/components/PageTitle";
import fs from "fs";
import type { Metadata } from "next";
import path from "path";

export const metadata: Metadata = { title: "关于" };

export default function AboutPage() {
  const file = path.join(process.cwd(), "content", "about.md");
  const content = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "关于页还是空白。";
  return (
    <div className="wrap py-12">
      <PageTitle kicker="ABOUT" title="关于" desc="一间很小的个人站点。" />
      <div className="max-w-3xl">
        <MarkdownBody content={content} />
      </div>
    </div>
  );
}

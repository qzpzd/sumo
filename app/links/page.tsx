import { PageTitle } from "@/components/PageTitle";
import { getLinks } from "@/lib/links";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "墨缘" };

export default function LinksPage() {
  const links = getLinks();
  return (
    <div className="wrap py-12">
      <PageTitle kicker="LINKS" title="墨缘" desc="友链写在 content/links.json。只接受 http 或 https。" />
      {links.length === 0 ? <p className="text-mist">友链还空着，像一幅未题款的画。</p> : null}
      <ul className="divide-y divide-line border-y border-line">
        {links.map((link) => (
          <li key={link.url} className="py-5">
            <a href={link.url} className="text-xl hover:text-cinnabar" rel="noopener noreferrer">
              {link.name}
            </a>
            {link.note ? <p className="mt-1 text-sm text-mist">{link.note}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { Nav } from "./Nav";
import { Seal } from "./InkDecor";

export function Header() {
  return (
    <header className="no-print sticky top-0 z-20 border-b border-line bg-paper">
      <div className="wrap flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <Seal className="h-9 w-9 text-base" />
          <span className="font-brush text-4xl leading-none">素墨</span>
        </Link>
        <Nav />
      </div>
    </header>
  );
}

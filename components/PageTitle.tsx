import { BrushDivider } from "./InkDecor";

export function PageTitle({ kicker, title, desc }: { kicker?: string; title: string; desc?: string }) {
  return (
    <header className="mb-10">
      {kicker ? <p className="text-xs tracking-[0.35em] text-cinnabar">{kicker}</p> : null}
      <h1 className="mt-2 font-brush text-5xl leading-none md:text-6xl">{title}</h1>
      <BrushDivider />
      {desc ? <p className="mt-4 max-w-2xl leading-loose text-ink-soft">{desc}</p> : null}
    </header>
  );
}

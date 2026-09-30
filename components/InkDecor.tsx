export function Seal({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-11 w-11 shrink-0 rotate-[-8deg] items-center justify-center border-2 border-cinnabar text-lg text-cinnabar ${className}`}
      aria-hidden
    >
      墨
    </span>
  );
}

export function InkLandscape() {
  return (
    <svg viewBox="0 0 640 280" className="h-44 w-full text-ink md:h-60" aria-hidden>
      <path
        d="M0 210 C90 190 130 120 190 132 C250 144 270 78 340 92 C410 106 430 150 500 138 C560 128 590 96 640 110 L640 280 L0 280 Z"
        fill="currentColor"
        opacity="0.08"
      />
      <path
        d="M0 236 C120 200 170 168 250 184 C340 202 360 150 450 166 C530 180 580 214 640 196 L640 280 L0 280 Z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M78 250 C92 190 108 132 124 128 C142 124 150 176 168 214"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.45"
      />
      <path d="M118 146 C140 110 168 96 176 132" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.28" />
      <path d="M430 168 C470 120 520 108 548 150" fill="none" stroke="currentColor" strokeWidth="8" opacity="0.08" />
    </svg>
  );
}

export function BrushDivider() {
  return (
    <svg viewBox="0 0 180 12" className="mt-3 h-3 w-28 text-ink" aria-hidden>
      <path
        d="M2 7 C30 2 40 11 70 6 C100 1 120 10 150 5 C162 3 170 6 178 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

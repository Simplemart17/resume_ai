interface PageHeaderProps {
  eyebrow: string;
  title: string;
  sub?: string;
  /** Machine-strip readout at the slab's base: `[token] text`. */
  strip: { token: string; text: string };
}

/**
 * The app pages' "job ticket": an ink slab with the page title set large and
 * the machine's one-line description of what happens here. Gives every tool
 * page a dark anchor so the paper below reads as the lit work surface.
 */
export function PageHeader({ eyebrow, title, sub, strip }: PageHeaderProps) {
  return (
    <header className="ink-panel overflow-hidden mb-8">
      <div className="px-6 py-8 sm:px-8 sm:py-10">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-paper/60 mb-3">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl md:text-[40px] font-bold tracking-tight leading-tight text-paper">
          {title}
        </h1>
        {sub && <p className="mt-3 text-base md:text-lg text-paper/70 max-w-2xl leading-relaxed">{sub}</p>}
      </div>
      <div className="machine-strip machine-strip--ink">
        <span className="machine-token">[{strip.token}]</span>
        <span>{strip.text}</span>
      </div>
    </header>
  );
}

import Link from 'next/link';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/PageHeader';

export interface LegalSection {
  /** Anchor id — also the target of the contents links. */
  id: string;
  heading: string;
  body: ReactNode;
}

interface LegalDocumentProps {
  eyebrow: string;
  title: string;
  intro: string;
  /** Human-readable effective date, e.g. "July 16, 2026". */
  effectiveDate: string;
  strip: { token: string; text: string };
  sections: LegalSection[];
}

const num = (i: number) => String(i + 1).padStart(2, '0');

/**
 * The shared frame for legal long-form pages (privacy, terms): the ink-slab
 * PageHeader over a single paper "document" with a mono contents index and
 * numbered sections. Content is passed as `sections` data so each page file
 * stays prose, and numbering/anchors/contents stay consistent between them.
 */
export function LegalDocument({
  eyebrow,
  title,
  intro,
  effectiveDate,
  strip,
  sections,
}: LegalDocumentProps) {
  return (
    <div className="min-h-screen bg-bench py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <PageHeader eyebrow={eyebrow} title={title} sub={intro} strip={strip} />

        <article className="paper overflow-hidden">
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft mb-8">
              Effective {effectiveDate}
            </p>

            <nav aria-label="Contents" className="mb-10 border-y border-rule py-5">
              <p className="eyebrow mb-3">Contents</p>
              <ol className="grid gap-1.5 sm:grid-cols-2">
                {sections.map((s, i) => (
                  <li key={s.id} className="text-sm">
                    <a
                      href={`#${s.id}`}
                      className="group inline-flex gap-2 text-ink-soft hover:text-pen transition-colors"
                    >
                      <span className="font-mono tabular-nums text-ink-soft/70">{num(i)}</span>
                      <span className="group-hover:underline">{s.heading}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="space-y-10">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="flex items-baseline gap-3 font-display text-xl font-bold tracking-tight text-ink mb-3">
                    <span className="font-mono text-sm font-medium text-pen tabular-nums">
                      {num(i)}
                    </span>
                    {s.heading}
                  </h2>
                  <div className="legal-body">{s.body}</div>
                </section>
              ))}
            </div>
          </div>

          <div className="machine-strip">
            <span className="machine-token">[{strip.token}]</span>
            <span>{strip.text}</span>
          </div>
        </article>

        <p className="mt-6 text-center text-sm text-ink-soft">
          <Link href="/privacy" className="text-pen hover:underline">
            Privacy Policy
          </Link>
          <span className="mx-2 text-rule">·</span>
          <Link href="/terms" className="text-pen hover:underline">
            Terms of Service
          </Link>
          <span className="mx-2 text-rule">·</span>
          <Link href="/" className="text-pen hover:underline">
            Home
          </Link>
        </p>
      </div>
    </div>
  );
}

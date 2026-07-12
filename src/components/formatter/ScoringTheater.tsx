'use client';

import { useEffect, useState } from 'react';

const STEPS = ['reading résumé', 'tokenizing', 'matching keywords', 'scoring'];

/** The wait, staged as the product's thesis: a machine-strip streams the parse
 *  steps while a skeleton of the annotated result composes in. */
export function ScoringTheater() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-10 space-y-8" aria-live="polite" aria-label="Scoring your resume">
      <div className="paper overflow-hidden">
        <div className="flex items-center gap-5 p-6 sm:p-8">
          <span className="font-display text-6xl md:text-7xl font-bold tracking-tight tabular-nums text-ink/20">
            00
          </span>
          <div className="flex-1">
            <div className="h-3 w-24 rounded-[2px] bg-ink/10 mb-3" />
            <div className="h-1.5 w-full max-w-md overflow-hidden rounded-[2px] bg-bench">
              <div className="h-full w-1/3 bg-pen/40 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="machine-strip">
          <span className="machine-token">[ats]</span>
          <span>{STEPS[step]}…</span>
          <span className="machine-caret text-pen">▍</span>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 lg:items-start">
        <div className="paper overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="h-6 w-2/5 rounded-[2px] bg-ink/10 mb-6" />
            <div className="paper-rule h-72 rounded-[2px] opacity-70" />
          </div>
        </div>
        <aside className="mt-8 space-y-6 lg:mt-0">
          <div className="paper p-5">
            <div className="h-3 w-24 rounded-[2px] bg-ink/10 mb-4" />
            <div className="paper-rule h-16 rounded-[2px] opacity-60" />
          </div>
          <div className="paper p-5">
            <div className="h-3 w-20 rounded-[2px] bg-ink/10 mb-4" />
            <div className="paper-rule h-24 rounded-[2px] opacity-60" />
          </div>
        </aside>
      </div>
    </div>
  );
}

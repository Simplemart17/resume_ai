'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

// The hero demo: one fixed mini resume, three job targets. Picking a target
// re-reads the document — marks move, the missing list changes, the score
// re-counts. Ten seconds with this teaches the whole product.

type SkillId = 'typescript' | 'react' | 'kubernetes' | 'graphql' | 'terraform';

interface DemoJob {
  id: string;
  label: string;
  score: number;
  /** Skills in the skills line the parser matches for this job. */
  hits: SkillId[];
  /** Whether the two experience-line keywords (Kubernetes, Terraform) count. */
  expHits: boolean;
  missing: string;
}

const JOBS: DemoJob[] = [
  {
    id: 'platform',
    label: 'platform engineer',
    score: 78,
    hits: ['typescript', 'kubernetes', 'terraform'],
    expHits: true,
    missing: 'sql',
  },
  {
    id: 'frontend',
    label: 'frontend engineer',
    score: 64,
    hits: ['typescript', 'react', 'graphql'],
    expHits: false,
    missing: 'next.js, a11y',
  },
  {
    id: 'data',
    label: 'data engineer',
    score: 41,
    hits: ['kubernetes', 'terraform'],
    expHits: true,
    missing: 'sql, python, airflow',
  },
];

const SKILLS: SkillId[] = ['typescript', 'react', 'kubernetes', 'graphql', 'terraform'];

/** Counts up to `target` when it changes; honors prefers-reduced-motion. */
function useCountUp(target: number): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const from = 0;
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out so the last digits settle
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target]);

  return value;
}

function TypesetBar({ width, delay }: { width: string; delay: number }) {
  return (
    <div
      aria-hidden="true"
      className="typeset-line h-[7px] rounded-[2px] bg-ink/10"
      style={{ width, animationDelay: `${delay}ms` }}
    />
  );
}

function Kw({ hit, children }: { hit: boolean; children: React.ReactNode }) {
  return hit ? <span className="mark-hit">{children}</span> : <>{children}</>;
}

export function HeroDemo() {
  const [jobId, setJobId] = useState<string>(JOBS[0].id);
  const job = JOBS.find((j) => j.id === jobId) ?? JOBS[0];
  const score = useCountUp(job.score);

  return (
    <div
      className="w-full max-w-[400px] xl:max-w-[468px]"
      role="group"
      aria-label="Interactive demo: a sample résumé scored against a job posting"
    >
      {/* Announced to assistive tech on every job change — the visual document
          below is decorative typeset sample content. */}
      <p className="sr-only" aria-live="polite">
        Scored against {job.label}: match {job.score} of 100. Missing keywords: {job.missing}.
      </p>

      <div className="paper-stack">
        <div className="paper relative overflow-hidden" aria-hidden="true">
          {/* the parse pass: a read-head sweeps the document once on load */}
          <div className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-pen/30" />

          <div className="p-6 xl:p-7 space-y-4">
            {/* letterhead */}
            <div className="typeset-line" style={{ animationDelay: '100ms' }}>
              <p className="font-display text-[17px] xl:text-[19px] font-bold leading-tight text-ink">
                Amara Okafor
              </p>
              <p className="font-mono text-[10px] text-ink-soft mt-0.5">
                product engineer · lagos / remote · amara@okafor.dev
              </p>
            </div>

            {/* summary */}
            <div className="space-y-1.5">
              <p className="eyebrow eyebrow-rule typeset-line" style={{ animationDelay: '250ms' }}>
                <span>Summary</span>
              </p>
              <TypesetBar width="100%" delay={350} />
              <TypesetBar width="92%" delay={430} />
              <TypesetBar width="61%" delay={510} />
            </div>

            {/* experience */}
            <div className="space-y-1.5">
              <p className="eyebrow eyebrow-rule typeset-line" style={{ animationDelay: '620ms' }}>
                <span>Experience</span>
              </p>
              <p className="typeset-line text-[11px] xl:text-[12px] leading-snug text-ink" style={{ animationDelay: '720ms' }}>
                Led migration to <Kw hit={job.expHits}>Kubernetes</Kw> — cut deploy time 68%
              </p>
              <TypesetBar width="95%" delay={800} />
              <TypesetBar width="87%" delay={880} />
              <p className="typeset-line text-[11px] xl:text-[12px] leading-snug text-ink" style={{ animationDelay: '960ms' }}>
                Shipped <Kw hit={job.expHits}>Terraform</Kw> pipelines for 40+ services
              </p>
              <TypesetBar width="72%" delay={1040} />
            </div>

            {/* skills */}
            <div className="space-y-1.5">
              <p className="eyebrow eyebrow-rule typeset-line" style={{ animationDelay: '1120ms' }}>
                <span>Skills</span>
              </p>
              <p className="typeset-line font-mono text-[10px] xl:text-[11px] text-ink-soft" style={{ animationDelay: '1220ms' }}>
                {SKILLS.map((skill, index) => (
                  <span key={skill}>
                    <Kw hit={job.hits.includes(skill)}>{skill}</Kw>
                    {index < SKILLS.length - 1 && ' · '}
                  </span>
                ))}
              </p>
            </div>
          </div>

          {/* the machine reads it against the selected job */}
          <div className="machine-strip">
            <span className="machine-token">[ats]</span>
            <span>parse ok</span>
            <span>·</span>
            <span>
              match <span className="font-semibold tabular-nums text-ink">{score}</span>/100
            </span>
            <span>·</span>
            <span>missing: {job.missing}</span>
            <span className="machine-caret text-pen">▍</span>
          </div>
        </div>
      </div>

      {/* job selector — try the same page against three postings.
          Styled for the hero's ink stage. */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="w-full font-mono text-[11px] uppercase tracking-[0.14em] text-paper/55">
          score it against:
        </span>
        {JOBS.map((j) => (
          <button
            key={j.id}
            type="button"
            onClick={() => setJobId(j.id)}
            aria-pressed={jobId === j.id}
            className={`font-mono text-[11px] px-2.5 py-1.5 rounded-[2px] border transition-colors ${
              jobId === j.id
                ? 'bg-pen border-pen text-paper'
                : 'border-paper/30 bg-transparent text-paper/75 hover:border-paper/70 hover:text-paper'
            }`}
          >
            {j.label}
          </button>
        ))}
      </div>

      <Link
        href="/optimize"
        className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-paper/60 hover:text-paper underline decoration-paper/30 hover:decoration-paper underline-offset-4 transition-colors"
      >
        score your own résumé <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

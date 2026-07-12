'use client';

import { FormattedResult } from './types';
import { highlightKeywords } from './highlightKeywords';
import { ScoreVerdict } from './ScoreVerdict';
import { CopyButton } from '../CopyButton';

interface OptimizedResumePanelProps {
  result: FormattedResult;
}

/** A line that reads like a résumé section heading (short, all-caps, or a
 *  known section word) — set as an eyebrow rather than body text. */
function isHeading(line: string): boolean {
  if (line.length > 34) return false;
  const isAllCaps = /^[A-Z0-9 &/().,'’-]+$/.test(line) && /[A-Z]/.test(line) && line === line.toUpperCase();
  const isKnown =
    /^(professional\s+summary|summary|profile|experience|work experience|employment|education|skills|technical skills|projects|certifications|awards|contact)\s*:?$/i.test(line);
  return isAllCaps || isKnown;
}

/** Typeset the AI's plain-text résumé into a real document: the name lifts to
 *  display type, section lines become eyebrows, and body keeps the inline
 *  highlighter marks over matched keywords. */
function TypesetResume({ text, keywords }: { text: string; keywords: string[] }) {
  const lines = text.split('\n');
  const firstContent = lines.findIndex((l) => l.trim().length > 0);

  return (
    <div>
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="h-2.5" aria-hidden="true" />;
        if (i === firstContent) {
          return (
            <p key={i} className="font-display text-2xl font-bold tracking-tight text-ink mb-1 break-words">
              {t}
            </p>
          );
        }
        if (isHeading(t)) {
          return (
            <p key={i} className="eyebrow eyebrow-rule mt-6 mb-2.5">
              <span>{t}</span>
            </p>
          );
        }
        return (
          <p key={i} className="text-[15px] leading-relaxed text-ink break-words">
            {highlightKeywords(line, keywords)}
          </p>
        );
      })}
    </div>
  );
}

function downloadResume(text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'optimized-resume.txt';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * The one canonical result: the score verdict leads, then the optimized résumé
 * typeset and marked up with the parser's findings, and a marginalia rail
 * (matched keywords, what's still missing, and the edit log) alongside it — the
 * way an editor returns a draft.
 */
export function OptimizedResumePanel({ result }: OptimizedResumePanelProps) {
  return (
    <div className="space-y-8">
      <ScoreVerdict
        score={result.matchScore}
        matched={result.matchingSkills.length}
        missing={result.missingSkills.length}
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 lg:items-start">
        {/* The document, marked up. */}
        <div className="paper overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-rule px-6 py-3 sm:px-8">
            <p className="eyebrow">Optimized résumé</p>
            <div className="flex items-center gap-2">
              <CopyButton text={result.optimizedResume} label="résumé" />
              <button
                type="button"
                onClick={() => downloadResume(result.optimizedResume)}
                className="btn-ghost px-2.5 py-1.5 text-xs font-mono"
              >
                download
              </button>
            </div>
          </div>
          <div className="px-8 py-10 sm:px-12">
            <TypesetResume text={result.optimizedResume} keywords={result.matchingSkills} />
          </div>
          <div className="machine-strip">
            <span className="machine-token">[ats]</span>
            <span>{result.matchingSkills.length} keywords marked</span>
            <span>·</span>
            <span>{result.missingSkills.length} missing</span>
          </div>
        </div>

        {/* Marginalia. */}
        <aside className="mt-8 space-y-6 lg:mt-0 lg:sticky lg:top-24" aria-label="Reviewer notes">
          {result.matchingSkills.length > 0 && (
            <div className="paper p-5">
              <p className="eyebrow mb-3">Matched ({result.matchingSkills.length})</p>
              <div className="flex flex-wrap gap-2">
                {result.matchingSkills.map((skill) => (
                  <span key={skill} className="mark-hit text-sm">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-soft">
                <span className="mark-hit">highlighted</span> in the résumé = keyword the parser matched
              </p>
            </div>
          )}

          {result.missingSkills.length > 0 && (
            <div className="paper p-5">
              <p className="eyebrow mb-3">The parser didn&apos;t find</p>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill) => (
                  <span key={skill} className="mark-miss text-sm">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                Add the ones that are genuinely true of you — never the rest.
              </p>
            </div>
          )}

          {result.changes.length > 0 && (
            <div className="paper overflow-hidden">
              <p className="eyebrow px-5 pt-5 pb-3">Edit log</p>
              <ul className="divide-y divide-rule max-h-[360px] overflow-y-auto">
                {result.changes.map((change, index) => (
                  <li key={index} className="flex items-start gap-3 px-5 py-3">
                    <span className="mt-0.5 font-mono text-xs tabular-nums text-pen">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm leading-relaxed text-ink">{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

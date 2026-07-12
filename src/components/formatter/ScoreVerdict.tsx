'use client';

interface ScoreVerdictProps {
  score: number;
  matched: number;
  missing: number;
}

/** One interpreted verdict for the score — colored and worded consistently,
 *  so the number never renders as a bare, uninterpreted digit. */
function verdictFor(score: number): { color: string; line: string } {
  if (score >= 80) return { color: 'text-pass', line: "Strong match — you're in the pile that gets read." };
  if (score >= 60) return { color: 'text-ink', line: 'Decent match — a few targeted keywords will lift it.' };
  if (score >= 40) return { color: 'text-fail', line: "Weak match — the parser is missing much of what the job asks for." };
  return { color: 'text-fail', line: 'Low match — significant gaps. Add what is genuinely true of you.' };
}

export function ScoreVerdict({ score, matched, missing }: ScoreVerdictProps) {
  const v = verdictFor(score);
  return (
    <div className="paper overflow-hidden">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
        <div className="flex items-baseline gap-2">
          <span className={`font-display text-6xl md:text-7xl font-bold tracking-tight tabular-nums ${v.color}`}>
            {score}
          </span>
          <span className="font-mono text-lg text-ink-soft">/100</span>
        </div>
        <div className="flex-1">
          <p className="eyebrow mb-2">Match score</p>
          <p className="text-lg text-ink leading-snug">{v.line}</p>
          <div className="mt-4 h-1.5 w-full max-w-md overflow-hidden rounded-[2px] bg-bench">
            <div
              className="h-full bg-pen transition-[width] duration-700 ease-out"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
      <div className="machine-strip">
        <span className="machine-token">[ats]</span>
        <span>match {score}/100</span>
        <span>·</span>
        <span>{matched} matched</span>
        <span>·</span>
        <span>{missing} missing</span>
      </div>
    </div>
  );
}

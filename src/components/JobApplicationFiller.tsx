'use client';

import { useMemo, useState } from 'react';
import { CopyButton } from './CopyButton';

/**
 * Structured resume data already extracted upstream (e.g. by the parse-resume
 * API). When provided, it feeds the manifest directly and the regex path is
 * never used.
 */
export interface StructuredResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
  };
  skills: string[];
  summary?: string;
}

interface JobApplicationFillerProps {
  /** Raw (plain) resume text — used only as a regex fallback when no structured data is given. */
  resumeText: string;
  /** Structured data; when present, drives the manifest with no regex re-extraction. */
  structuredData?: StructuredResumeData | null;
}

interface Manifest {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  skills: string[];
  summary: string;
}

const EMPTY: Manifest = {
  fullName: '', email: '', phone: '', location: '', website: '', linkedin: '', skills: [], summary: '',
};

/** Fallback extraction for the optimizer context, where only résumé text is
 *  available (the auto-fill page always passes structured data instead). */
function extractFromText(text: string): Manifest {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const email = text.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] ?? '';
  const phone = text.match(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/)?.[0] ?? '';
  let fullName = '';
  for (const line of lines) {
    if (line.toLowerCase().includes('name:')) { fullName = line.replace(/name:/i, '').trim(); break; }
    if (line.length < 50 && line.split(' ').length >= 2 && line.split(' ').length <= 4) { fullName = line; break; }
  }
  const skillsText = text.match(/skills?:?\s*([^]*?)(?=\n\s*[A-Z][^:]*:|$)/i)?.[1] ?? '';
  const skills = skillsText.split(/[,\n•-]/).map((s) => s.trim()).filter((s) => s.length > 1).slice(0, 12);
  return { ...EMPTY, fullName, email, phone, skills };
}

function buildManifest(resumeText: string, structured?: StructuredResumeData | null): Manifest {
  if (structured) {
    return {
      fullName: structured.personalInfo.fullName ?? '',
      email: structured.personalInfo.email ?? '',
      phone: structured.personalInfo.phone ?? '',
      location: structured.personalInfo.location ?? '',
      website: structured.personalInfo.website ?? '',
      linkedin: structured.personalInfo.linkedin ?? '',
      skills: structured.skills ?? [],
      summary: structured.summary ?? '',
    };
  }
  return resumeText.trim() ? extractFromText(resumeText) : EMPTY;
}

const VALID_JOB_DOMAINS = [
  'greenhouse.io', 'lever.co', 'workday.com', 'bamboohr.com', 'smartrecruiters.com', 'indeed.com', 'linkedin.com',
];

function isValidJobUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return VALID_JOB_DOMAINS.some((d) => hostname === d || hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

const HOW_IT_WORKS = [
  'Every field the parser found is listed on the left, ready to copy.',
  'Optionally paste the job URL to keep it handy while you fill the form.',
  'Open the application in a new tab.',
  'Copy each field and paste it into the matching form field.',
];

export function JobApplicationFiller({ resumeText, structuredData }: JobApplicationFillerProps) {
  const [jobUrl, setJobUrl] = useState('');

  // Auto-populate — no "extract" button. Recompute when inputs change.
  const manifest = useMemo(
    () => buildManifest(resumeText, structuredData),
    [resumeText, structuredData]
  );

  const rows = [
    { label: 'Full name', value: manifest.fullName },
    { label: 'Email', value: manifest.email },
    { label: 'Phone', value: manifest.phone },
    { label: 'Location', value: manifest.location },
    { label: 'Website', value: manifest.website },
    { label: 'LinkedIn', value: manifest.linkedin },
  ].filter((r) => r.value);

  const detected =
    rows.length + (manifest.skills.length ? 1 : 0) + (manifest.summary ? 1 : 0);

  const copyAllText = useMemo(() => {
    const parts = rows.map((r) => `${r.label}: ${r.value}`);
    if (manifest.skills.length) parts.push(`Skills: ${manifest.skills.join(', ')}`);
    if (manifest.summary) parts.push(`Summary: ${manifest.summary}`);
    return parts.join('\n');
  }, [rows, manifest]);

  return (
    <div className="lg:grid lg:grid-cols-[1.5fr_1fr] lg:gap-8 lg:items-start">
      {/* The field manifest — one canonical, copyable ledger. */}
      <div className="paper overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-rule px-5 py-3">
          <p className="eyebrow">Field manifest</p>
          {detected > 0 && <CopyButton text={copyAllText} label="all fields" />}
        </div>

        {detected > 0 ? (
          <ul className="divide-y divide-rule">
            {rows.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="eyebrow mb-0.5">{row.label}</p>
                  <p className="text-sm text-ink truncate">{row.value}</p>
                </div>
                <CopyButton text={row.value} label={row.label} />
              </li>
            ))}

            {manifest.skills.length > 0 && (
              <li className="px-5 py-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="eyebrow">Skills ({manifest.skills.length})</p>
                  <CopyButton text={manifest.skills.join(', ')} label="skills" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {manifest.skills.map((skill) => (
                    <span key={skill} className="font-mono text-xs bg-bench border border-rule text-ink px-2 py-0.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </li>
            )}

            {manifest.summary && (
              <li className="px-5 py-3">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <p className="eyebrow">Summary</p>
                  <CopyButton text={manifest.summary} label="summary" />
                </div>
                <p className="text-sm text-ink leading-relaxed">{manifest.summary}</p>
              </li>
            )}
          </ul>
        ) : (
          <div className="px-5 py-8">
            <div className="paper-rule h-24 rounded-[2px] opacity-60" />
            <p className="mt-4 font-mono text-xs text-ink-soft">
              No fields detected yet — upload a résumé to fill the manifest.
            </p>
          </div>
        )}

        <div className="machine-strip">
          <span className="machine-token">[fields]</span>
          <span className="tabular-nums">{detected}</span>
          <span>detected</span>
          <span>·</span>
          <span>copy each into the form yourself</span>
        </div>
      </div>

      {/* Helper rail: job link + how it works. */}
      <aside className="mt-8 space-y-6 lg:mt-0">
        <div className="paper p-5">
          <p className="eyebrow mb-2">Job posting URL <span className="text-ink-soft">(optional)</span></p>
          <p className="text-sm text-ink-soft mb-3">Keeps the posting one click away while you fill the form.</p>
          <input
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://company.greenhouse.io/jobs/…"
            className="input-flat w-full px-3.5 py-2.5 text-sm"
          />
          {jobUrl && !isValidJobUrl(jobUrl) && (
            <p className="mt-2 font-mono text-xs text-ink-soft">
              Doesn&apos;t look like a common job board — double-check before opening.
            </p>
          )}
          {jobUrl && isValidJobUrl(jobUrl) && (
            <a href={jobUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-3 w-full px-4 py-2 text-sm">
              Open posting <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>

        <div className="paper overflow-hidden">
          <div className="p-5">
            <p className="eyebrow eyebrow-rule mb-4"><span>How it works</span></p>
            <ol className="space-y-2.5 text-sm text-ink">
              {HOW_IT_WORKS.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-mono text-xs tabular-nums text-pen pt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="machine-strip leading-snug">
            <span className="machine-token">[note]</span>
            <span>Nothing is submitted for you — you paste each field yourself, so it works with any form.</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useUserTier } from '@/lib/useUserTier';
import { savedDocumentsLimit } from '@/lib/tiers';
import { PageHeader } from './PageHeader';
import { DownloadMenu } from './DownloadMenu';
import { AccountsNotConfigured } from './auth/AccountsNotConfigured';
import { downloadCoverLetter, downloadResumeText } from '@/utils/documentExport';
import {
  deleteBaseResume,
  deleteCoverLetter,
  deleteOptimizedResume,
  getBaseResumeOriginalUrl,
  getCoverLetter,
  getOptimizedResume,
  listBaseResumes,
  listCoverLetters,
  listOptimizedResumes,
} from '@/lib/documents';
import type {
  BaseResumeSummary,
  CoverLetterSummary,
  OptimizedResumeSummary,
} from '@/types/documents';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function Section({
  title,
  count,
  limit,
  children,
}: {
  title: string;
  count: number;
  /** Per-type cap; null = unlimited. */
  limit: number | null;
  children: React.ReactNode;
}) {
  const atCap = limit !== null && count >= limit;
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3 border-b border-rule pb-2">
        <p className="eyebrow">
          <span>
            {title} {limit === null ? `(${count})` : `(${count}/${limit})`}
          </span>
        </p>
        {atCap && (
          <Link href="/account" className="font-mono text-[11px] text-pen hover:underline">
            upgrade for more
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Row({
  primary,
  secondary,
  actions,
}: {
  primary: string;
  secondary: string;
  actions: React.ReactNode;
}) {
  return (
    <div className="paper flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{primary}</p>
        <p className="font-mono text-[11px] text-ink-soft">{secondary}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">{actions}</div>
    </div>
  );
}

function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm('Delete this document? This cannot be undone.')) return;
        setBusy(true);
        try {
          await onDelete();
        } finally {
          setBusy(false);
        }
      }}
      className="btn-ghost px-2.5 py-1.5 text-xs font-mono disabled:opacity-60"
      aria-label="Delete document"
    >
      {busy ? 'deleting…' : 'delete'}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="machine-strip rounded-[3px] border border-rule">
      <span className="machine-token">[empty]</span>
      <span>{text}</span>
    </div>
  );
}

/**
 * The central hub for everything a user has saved: base resumes (with the
 * original file), optimized resumes, and cover letters — each downloadable as
 * PDF/DOCX (+ TXT for resumes) and deletable. Data comes from the
 * /api/documents/** routes; the browser never touches the database directly.
 */
export function DocumentsHub() {
  const { user, tier, loading, accountsEnabled } = useUserTier();
  const docLimit = savedDocumentsLimit(tier);

  const [baseResumes, setBaseResumes] = useState<BaseResumeSummary[]>([]);
  const [optimized, setOptimized] = useState<OptimizedResumeSummary[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetterSummary[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!accountsEnabled || !userId) return;
    let cancelled = false;
    setDataLoading(true);
    setError(null);
    Promise.all([listBaseResumes(), listOptimizedResumes(), listCoverLetters()])
      .then(([b, o, c]) => {
        if (cancelled) return;
        setBaseResumes(b);
        setOptimized(o);
        setCoverLetters(c);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load your documents');
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accountsEnabled, userId]);

  if (!accountsEnabled) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <AccountsNotConfigured description="Saving documents requires authentication to be set up by the site operator. AI optimization, cover letters, and PDF/DOCX downloads still work without an account." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div
          className="h-8 w-8 rounded-full border-2 border-pen border-t-transparent animate-spin"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="paper p-8 text-center">
          <p className="eyebrow mb-3">Documents</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink mb-2">
            Sign in to see your saved documents
          </h1>
          <p className="text-sm text-ink-soft mb-6">
            Base resumes, optimized resumes, and cover letters are saved to your account so you can
            reuse and re-download them anytime.
          </p>
          <Link href="/login?redirect_url=/documents" className="btn-pen px-6 py-2.5 text-sm">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const removeAndToast = async (fn: () => Promise<void>, onDone: () => void) => {
    try {
      await fn();
      onDone();
      toast.success('Deleted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const downloadOriginal = async (id: string) => {
    try {
      const url = await getBaseResumeOriginalUrl(id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to open the original file');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <PageHeader
        eyebrow="Documents"
        title="Your saved documents"
        sub="Everything you've uploaded and generated — reuse a base resume, or re-download any result as PDF or DOCX."
        strip={{ token: 'docs', text: 'base resumes · optimized resumes · cover letters' }}
      />

      {error && (
        <div className="px-4 py-3 rounded-[3px] bg-fail/10 border border-fail/30 text-sm text-fail">
          {error}
        </div>
      )}

      {dataLoading ? (
        <div className="flex items-center justify-center py-16">
          <div
            className="h-6 w-6 rounded-full border-2 border-pen border-t-transparent animate-spin"
            role="status"
            aria-label="Loading documents"
          />
        </div>
      ) : (
        <>
          <Section title="Base resumes" count={baseResumes.length} limit={docLimit}>
            {baseResumes.length === 0 ? (
              <EmptyState text="upload a resume on the optimizer to save it here" />
            ) : (
              <div className="space-y-3">
                {baseResumes.map((r) => (
                  <Row
                    key={r.id}
                    primary={r.title || r.fileName || 'Base resume'}
                    secondary={formatDate(r.createdAt)}
                    actions={
                      <>
                        {r.hasOriginal && (
                          <button
                            type="button"
                            onClick={() => downloadOriginal(r.id)}
                            className="btn-ghost px-2.5 py-1.5 text-xs font-mono"
                          >
                            original
                          </button>
                        )}
                        <DeleteButton
                          onDelete={() =>
                            removeAndToast(
                              () => deleteBaseResume(r.id),
                              () => setBaseResumes((prev) => prev.filter((x) => x.id !== r.id))
                            )
                          }
                        />
                      </>
                    }
                  />
                ))}
              </div>
            )}
          </Section>

          <Section title="Optimized resumes" count={optimized.length} limit={docLimit}>
            {optimized.length === 0 ? (
              <EmptyState text="run the optimizer to save a result here" />
            ) : (
              <div className="space-y-3">
                {optimized.map((o) => {
                  const base = o.title || [o.jobTitle, o.company].filter(Boolean).join('-') || 'optimized-resume';
                  const load = async () => (await getOptimizedResume(o.id)).optimizedText;
                  return (
                    <Row
                      key={o.id}
                      primary={o.title || o.jobTitle || 'Optimized resume'}
                      secondary={[o.company, o.matchScore != null ? `match ${o.matchScore}/100` : null, formatDate(o.createdAt)]
                        .filter(Boolean)
                        .join(' · ')}
                      actions={
                        <>
                          <DownloadMenu
                            options={[
                              { format: 'pdf', onSelect: async () => downloadResumeText(await load(), base, 'pdf') },
                              { format: 'docx', onSelect: async () => downloadResumeText(await load(), base, 'docx') },
                              { format: 'txt', onSelect: async () => downloadResumeText(await load(), base, 'txt') },
                            ]}
                          />
                          <DeleteButton
                            onDelete={() =>
                              removeAndToast(
                                () => deleteOptimizedResume(o.id),
                                () => setOptimized((prev) => prev.filter((x) => x.id !== o.id))
                              )
                            }
                          />
                        </>
                      }
                    />
                  );
                })}
              </div>
            )}
          </Section>

          <Section title="Cover letters" count={coverLetters.length} limit={docLimit}>
            {coverLetters.length === 0 ? (
              <EmptyState text="generate a cover letter to save it here" />
            ) : (
              <div className="space-y-3">
                {coverLetters.map((c) => {
                  const base = [c.jobTitle, c.company].filter(Boolean).join('-') || 'cover-letter';
                  const load = async () => (await getCoverLetter(c.id)).contentHtml;
                  return (
                    <Row
                      key={c.id}
                      primary={c.title || [c.jobTitle, c.company].filter(Boolean).join(' · ') || 'Cover letter'}
                      secondary={formatDate(c.createdAt)}
                      actions={
                        <>
                          <DownloadMenu
                            options={[
                              { format: 'pdf', onSelect: async () => downloadCoverLetter(await load(), base, 'pdf') },
                              { format: 'docx', onSelect: async () => downloadCoverLetter(await load(), base, 'docx') },
                            ]}
                          />
                          <DeleteButton
                            onDelete={() =>
                              removeAndToast(
                                () => deleteCoverLetter(c.id),
                                () => setCoverLetters((prev) => prev.filter((x) => x.id !== c.id))
                              )
                            }
                          />
                        </>
                      }
                    />
                  );
                })}
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
}

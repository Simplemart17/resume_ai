'use client';

import { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { RESUME_ACCEPT } from '@/config/uploads';
import type { BaseResumeSummary } from '@/types/documents';

/** Where the resume text comes from: a fresh upload or a saved base resume. */
export type ResumeSource =
  | { kind: 'upload'; file: File }
  | { kind: 'saved'; id: string; title: string };

interface ResumeSourcePickerProps {
  source: ResumeSource | null;
  onSourceChange: (source: ResumeSource | null) => void;
  savedResumes: BaseResumeSummary[];
  /** Show the "saved" tab at all — true only when signed in. */
  showSaved: boolean;
  savedLoading?: boolean;
  error?: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * The resume input shared by both optimizer modes: upload a new file, or reuse
 * a previously saved base resume. Selecting a saved resume hands back only its
 * id/title — the full text is fetched lazily at submit time.
 */
export function ResumeSourcePicker({
  source,
  onSourceChange,
  savedResumes,
  showSaved,
  savedLoading,
  error,
}: ResumeSourcePickerProps) {
  const hasSaved = showSaved && savedResumes.length > 0;
  const [tab, setTab] = useState<'upload' | 'saved'>('upload');

  // Keep the active source in sync with the visible tab: switching away from a
  // tab drops a selection made there, so the resume that will be submitted
  // always matches what the user is looking at.
  const selectTab = (next: 'upload' | 'saved') => {
    setTab(next);
    if (next === 'upload' && source?.kind === 'saved') onSourceChange(null);
    if (next === 'saved' && source?.kind === 'upload') onSourceChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <label className="eyebrow block">Your resume</label>
        {hasSaved && (
          <div className="flex gap-1" role="tablist" aria-label="Resume source">
            {(['upload', 'saved'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => selectTab(t)}
                className={`rounded-[3px] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] border transition-colors ${
                  tab === t
                    ? 'border-pen bg-pen-wash text-pen'
                    : 'border-rule bg-paper text-ink-soft hover:text-ink hover:border-ink/40'
                }`}
              >
                {t === 'upload' ? 'Upload new' : 'Saved'}
              </button>
            ))}
          </div>
        )}
      </div>

      {hasSaved && tab === 'saved' ? (
        <div className="max-h-[220px] space-y-2 overflow-y-auto">
          {savedResumes.map((r) => {
            const selected = source?.kind === 'saved' && source.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSourceChange({ kind: 'saved', id: r.id, title: r.title || r.fileName || 'Saved resume' })}
                className={`flex w-full items-center justify-between gap-3 rounded-[3px] border px-3.5 py-3 text-left transition-colors ${
                  selected
                    ? 'border-pen bg-pen-wash'
                    : 'border-rule bg-paper hover:border-ink/40'
                }`}
                aria-pressed={selected}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {r.title || r.fileName || 'Saved resume'}
                  </span>
                  <span className="font-mono text-[11px] text-ink-soft">
                    {formatDate(r.createdAt)}
                  </span>
                </span>
                {selected && (
                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-pen">
                    selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <FileUploader
          onFileSelect={(file) => onSourceChange(file ? { kind: 'upload', file } : null)}
          selectedFile={source?.kind === 'upload' ? source.file : null}
          accept={RESUME_ACCEPT}
        />
      )}

      {hasSaved && tab === 'saved' && savedLoading && (
        <p className="font-mono text-xs text-ink-soft">loading saved resumes…</p>
      )}
      {error && <p className="text-sm text-fail">{error}</p>}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { CLERK_ENABLED } from '@/lib/useUserTier';
import type {
  BaseResume,
  BaseResumeSummary,
  CoverLetter,
  CoverLetterSummary,
  OptimizedResume,
  OptimizedResumeSummary,
  SaveCoverLetterPayload,
  SaveOptimizedResumePayload,
} from '@/types/documents';

// Client-side access to the /api/documents/** routes. Persistence needs
// accounts, so every write is a no-op that resolves to null when accounts are
// disabled — callers stay branch-light and never special-case the OSS build.
// The server is the real gate (401/501); these guards just avoid pointless
// round-trips and let the UI hide save affordances cleanly.

/** Carries the HTTP status so callers can tell a 403 tier cap from an outage. */
export class DocumentsApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'DocumentsApiError';
    this.status = status;
  }
}

/** True when an error is a saved-documents tier-cap rejection (HTTP 403). */
export function isLimitError(error: unknown): error is DocumentsApiError {
  return error instanceof DocumentsApiError && error.status === 403;
}

async function jsonOrThrow(res: Response, fallback: string): Promise<unknown> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data as { error?: string } | null)?.error || fallback;
    throw new DocumentsApiError(message, res.status);
  }
  return data;
}

// ---- base resumes ----

export async function saveBaseResumeFile(file: File): Promise<BaseResume | null> {
  if (!CLERK_ENABLED) return null;
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/documents/base-resumes', { method: 'POST', body: formData });
  const data = await jsonOrThrow(res, 'Failed to save resume');
  return (data as { item: BaseResume }).item;
}

export async function listBaseResumes(): Promise<BaseResumeSummary[]> {
  if (!CLERK_ENABLED) return [];
  const res = await fetch('/api/documents/base-resumes');
  const data = await jsonOrThrow(res, 'Failed to load resumes');
  return (data as { items: BaseResumeSummary[] }).items;
}

export async function getBaseResume(id: string): Promise<BaseResume> {
  const res = await fetch(`/api/documents/base-resumes/${id}`);
  const data = await jsonOrThrow(res, 'Failed to load resume');
  return (data as { item: BaseResume }).item;
}

export async function getBaseResumeOriginalUrl(id: string): Promise<string> {
  const res = await fetch(`/api/documents/base-resumes/${id}?download=1`);
  const data = await jsonOrThrow(res, 'Failed to get download link');
  return (data as { url: string }).url;
}

export async function deleteBaseResume(id: string): Promise<void> {
  const res = await fetch(`/api/documents/base-resumes/${id}`, { method: 'DELETE' });
  await jsonOrThrow(res, 'Failed to delete resume');
}

// ---- optimized resumes ----

export async function saveOptimizedResume(
  payload: SaveOptimizedResumePayload
): Promise<OptimizedResumeSummary | null> {
  if (!CLERK_ENABLED) return null;
  const res = await fetch('/api/documents/optimized-resumes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await jsonOrThrow(res, 'Failed to save optimized resume');
  return (data as { item: OptimizedResumeSummary }).item;
}

export async function listOptimizedResumes(): Promise<OptimizedResumeSummary[]> {
  if (!CLERK_ENABLED) return [];
  const res = await fetch('/api/documents/optimized-resumes');
  const data = await jsonOrThrow(res, 'Failed to load optimized resumes');
  return (data as { items: OptimizedResumeSummary[] }).items;
}

export async function getOptimizedResume(id: string): Promise<OptimizedResume> {
  const res = await fetch(`/api/documents/optimized-resumes/${id}`);
  const data = await jsonOrThrow(res, 'Failed to load optimized resume');
  return (data as { item: OptimizedResume }).item;
}

export async function deleteOptimizedResume(id: string): Promise<void> {
  const res = await fetch(`/api/documents/optimized-resumes/${id}`, { method: 'DELETE' });
  await jsonOrThrow(res, 'Failed to delete optimized resume');
}

// ---- cover letters ----

export async function saveCoverLetter(
  payload: SaveCoverLetterPayload
): Promise<CoverLetterSummary | null> {
  if (!CLERK_ENABLED) return null;
  const res = await fetch('/api/documents/cover-letters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await jsonOrThrow(res, 'Failed to save cover letter');
  return (data as { item: CoverLetterSummary }).item;
}

export async function listCoverLetters(): Promise<CoverLetterSummary[]> {
  if (!CLERK_ENABLED) return [];
  const res = await fetch('/api/documents/cover-letters');
  const data = await jsonOrThrow(res, 'Failed to load cover letters');
  return (data as { items: CoverLetterSummary[] }).items;
}

export async function getCoverLetter(id: string): Promise<CoverLetter> {
  const res = await fetch(`/api/documents/cover-letters/${id}`);
  const data = await jsonOrThrow(res, 'Failed to load cover letter');
  return (data as { item: CoverLetter }).item;
}

export async function deleteCoverLetter(id: string): Promise<void> {
  const res = await fetch(`/api/documents/cover-letters/${id}`, { method: 'DELETE' });
  await jsonOrThrow(res, 'Failed to delete cover letter');
}

// ---- hook: the saved-resume picker on /optimize ----

export interface UseSavedResumes {
  resumes: BaseResumeSummary[];
  loading: boolean;
  error: string | null;
  /** Reload the list (e.g. after a new save). */
  refresh: () => void;
  /** Optimistically prepend a freshly saved resume without a refetch. */
  add: (resume: BaseResumeSummary) => void;
}

/**
 * Loads the signed-in user's saved base resumes for the picker. Pass the Clerk
 * user id (or null when signed out) — keying on the id, not a signed-in
 * boolean, means the list refetches when the account CHANGES, not only when it
 * appears/disappears (an A→B switch that stays signed in would otherwise show
 * user A's resumes to user B).
 */
export function useSavedResumes(userId: string | null): UseSavedResumes {
  const [resumes, setResumes] = useState<BaseResumeSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);
  const add = useCallback(
    (resume: BaseResumeSummary) => setResumes((prev) => [resume, ...prev]),
    []
  );

  useEffect(() => {
    if (!CLERK_ENABLED || !userId) {
      setResumes([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    listBaseResumes()
      .then((items) => {
        if (!cancelled) setResumes(items);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load resumes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, nonce]);

  return { resumes, loading, error, refresh, add };
}

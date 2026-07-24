import { getSupabaseDb } from '@/lib/supabase/server';
import { savedDocumentsLimit, type Tier } from '@/lib/tiers';
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

// Server-only data access for saved documents. Every query is scoped by
// user_id — ownership is enforced here on every read and delete, never trusting
// an id from the client alone. Access runs against the "resume" schema with the
// secret key via getSupabaseDb() (see src/lib/supabase/server.ts).

export const RESUME_FILES_BUCKET = 'resume-files';

/** Thrown when Supabase is not configured; routes map this to 503. */
export class DocumentsUnavailableError extends Error {
  constructor() {
    super('Document storage is not configured');
    this.name = 'DocumentsUnavailableError';
  }
}

/** The three saved-document tables, used by the per-type limit enforcement. */
export type DocumentTable = 'base_resumes' | 'optimized_resumes' | 'cover_letters';

const DOCUMENT_LABELS: Record<DocumentTable, string> = {
  base_resumes: 'saved resumes',
  optimized_resumes: 'optimized resumes',
  cover_letters: 'cover letters',
};

export type DocumentLimitResult = { ok: true } | { ok: false; message: string };

/**
 * Checks the tier's per-type saved-documents cap. Returns `{ ok: false, message }`
 * (an upgrade-prompting message the route sends as a 403) when the user is at the
 * limit, else `{ ok: true }`. Pure data — the route owns the HTTP response.
 * Best-effort: a soft product limit, not a security boundary, so a rare
 * concurrent-insert race that lands one over is acceptable. Call from the create
 * routes BEFORE doing expensive work (extraction, upload).
 */
export async function checkDocumentLimit(
  userId: string,
  tier: Tier,
  table: DocumentTable
): Promise<DocumentLimitResult> {
  const limit = savedDocumentsLimit(tier);
  if (limit === null) return { ok: true }; // unlimited

  const db = requireDb();
  const { count, error } = await db
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) fail('checkDocumentLimit', error.message);

  if ((count ?? 0) >= limit) {
    // limit 0 = the free (unpaid) tier, where saving isn't included at all —
    // frame it as unlocking a feature, not hitting a quota.
    const message =
      limit === 0
        ? 'Saving to your library is a paid feature — upgrade to Starter ($1) to keep your resumes and cover letters.'
        : `You've reached your plan's limit of ${limit} ${DOCUMENT_LABELS[table]}. Upgrade for unlimited saved documents.`;
    return { ok: false, message };
  }
  return { ok: true };
}

type Db = NonNullable<ReturnType<typeof getSupabaseDb>>;

function requireDb(): Db {
  const db = getSupabaseDb();
  if (!db) throw new DocumentsUnavailableError();
  return db;
}

function fail(context: string, message: string): never {
  throw new Error(`${context}: ${message}`);
}

// ---------- base resumes ----------

interface CreateBaseResumeInput {
  title: string | null;
  resumeText: string;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  fileBytes: ArrayBuffer | null;
}

export async function createBaseResume(
  userId: string,
  input: CreateBaseResumeInput
): Promise<BaseResume> {
  const db = requireDb();

  const { data: row, error } = await db
    .from('base_resumes')
    .insert({
      user_id: userId,
      title: input.title,
      resume_text: input.resumeText,
      file_name: input.fileName,
      file_type: input.fileType,
      file_size: input.fileSize,
    })
    .select('id, title, file_name, file_type, storage_path, created_at')
    .single();

  if (error || !row) fail('createBaseResume', error?.message ?? 'no row returned');

  let storagePath: string | null = null;
  if (input.fileBytes) {
    storagePath = `${userId}/${row.id}/${sanitizeFileName(input.fileName)}`;
    const { error: uploadError } = await db.storage
      .from(RESUME_FILES_BUCKET)
      .upload(storagePath, input.fileBytes, {
        contentType: input.fileType ?? 'application/octet-stream',
        upsert: true,
      });
    if (uploadError) {
      // Best-effort: keep the text row even if the original file couldn't be
      // stored, but surface it so the row's storage_path stays honest (null).
      console.error(`createBaseResume: file upload failed for ${row.id}:`, uploadError.message);
      storagePath = null;
    } else {
      const { error: updateError } = await db
        .from('base_resumes')
        .update({ storage_path: storagePath })
        .eq('id', row.id)
        .eq('user_id', userId);
      if (updateError) {
        console.error(`createBaseResume: storage_path update failed for ${row.id}:`, updateError.message);
      }
    }
  }

  return {
    id: row.id,
    title: row.title,
    fileName: row.file_name,
    fileType: row.file_type,
    hasOriginal: Boolean(storagePath),
    createdAt: row.created_at,
    resumeText: input.resumeText,
  };
}

export async function listBaseResumes(userId: string): Promise<BaseResumeSummary[]> {
  const db = requireDb();
  const { data, error } = await db
    .from('base_resumes')
    .select('id, title, file_name, file_type, storage_path, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) fail('listBaseResumes', error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    fileName: r.file_name,
    fileType: r.file_type,
    hasOriginal: Boolean(r.storage_path),
    createdAt: r.created_at,
  }));
}

export async function getBaseResume(userId: string, id: string): Promise<BaseResume | null> {
  const db = requireDb();
  const { data: r, error } = await db
    .from('base_resumes')
    .select('id, title, file_name, file_type, storage_path, created_at, resume_text')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();
  if (error) fail('getBaseResume', error.message);
  if (!r) return null;
  return {
    id: r.id,
    title: r.title,
    fileName: r.file_name,
    fileType: r.file_type,
    hasOriginal: Boolean(r.storage_path),
    createdAt: r.created_at,
    resumeText: r.resume_text,
  };
}

/** Signed URL for the original uploaded file, or null if there is none. */
export async function signBaseResumeOriginal(
  userId: string,
  id: string,
  expiresInSeconds = 60
): Promise<string | null> {
  const db = requireDb();
  const { data: r, error } = await db
    .from('base_resumes')
    .select('storage_path')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();
  if (error) fail('signBaseResumeOriginal', error.message);
  if (!r?.storage_path) return null;
  const { data, error: signError } = await db.storage
    .from(RESUME_FILES_BUCKET)
    .createSignedUrl(r.storage_path, expiresInSeconds);
  if (signError) fail('signBaseResumeOriginal', signError.message);
  return data?.signedUrl ?? null;
}

/** Deletes the row and its stored original. Returns false if not found/owned. */
export async function deleteBaseResume(userId: string, id: string): Promise<boolean> {
  const db = requireDb();
  const { data: r, error } = await db
    .from('base_resumes')
    .select('storage_path')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();
  if (error) fail('deleteBaseResume', error.message);
  if (!r) return false;

  if (r.storage_path) {
    const { error: removeError } = await db.storage
      .from(RESUME_FILES_BUCKET)
      .remove([r.storage_path]);
    if (removeError) {
      console.error(`deleteBaseResume: storage remove failed for ${id}:`, removeError.message);
    }
  }

  const { error: deleteError } = await db
    .from('base_resumes')
    .delete()
    .eq('user_id', userId)
    .eq('id', id);
  if (deleteError) fail('deleteBaseResume', deleteError.message);
  return true;
}

// ---------- optimized resumes ----------

export async function createOptimizedResume(
  userId: string,
  payload: SaveOptimizedResumePayload
): Promise<OptimizedResumeSummary> {
  const db = requireDb();
  const { data: r, error } = await db
    .from('optimized_resumes')
    .insert({
      user_id: userId,
      base_resume_id: payload.baseResumeId ?? null,
      title: payload.title ?? null,
      job_title: payload.jobTitle ?? null,
      company: payload.company ?? null,
      job_description: payload.jobDescription ?? null,
      optimized_text: payload.optimizedText,
      match_score: payload.matchScore ?? null,
      changes: payload.changes ?? [],
      matching_skills: payload.matchingSkills ?? [],
      missing_skills: payload.missingSkills ?? [],
    })
    .select('id, title, job_title, company, match_score, created_at')
    .single();
  if (error || !r) fail('createOptimizedResume', error?.message ?? 'no row returned');
  return {
    id: r.id,
    title: r.title,
    jobTitle: r.job_title,
    company: r.company,
    matchScore: r.match_score,
    createdAt: r.created_at,
  };
}

export async function listOptimizedResumes(userId: string): Promise<OptimizedResumeSummary[]> {
  const db = requireDb();
  const { data, error } = await db
    .from('optimized_resumes')
    .select('id, title, job_title, company, match_score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) fail('listOptimizedResumes', error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    jobTitle: r.job_title,
    company: r.company,
    matchScore: r.match_score,
    createdAt: r.created_at,
  }));
}

export async function getOptimizedResume(userId: string, id: string): Promise<OptimizedResume | null> {
  const db = requireDb();
  const { data: r, error } = await db
    .from('optimized_resumes')
    .select(
      'id, title, job_title, company, match_score, created_at, optimized_text, job_description, changes, matching_skills, missing_skills'
    )
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();
  if (error) fail('getOptimizedResume', error.message);
  if (!r) return null;
  return {
    id: r.id,
    title: r.title,
    jobTitle: r.job_title,
    company: r.company,
    matchScore: r.match_score,
    createdAt: r.created_at,
    optimizedText: r.optimized_text,
    jobDescription: r.job_description,
    changes: toStringArray(r.changes),
    matchingSkills: toStringArray(r.matching_skills),
    missingSkills: toStringArray(r.missing_skills),
  };
}

export async function deleteOptimizedResume(userId: string, id: string): Promise<boolean> {
  return deleteRow('optimized_resumes', userId, id);
}

// ---------- cover letters ----------

export async function createCoverLetter(
  userId: string,
  payload: SaveCoverLetterPayload
): Promise<CoverLetterSummary> {
  const db = requireDb();
  const { data: r, error } = await db
    .from('cover_letters')
    .insert({
      user_id: userId,
      base_resume_id: payload.baseResumeId ?? null,
      optimized_resume_id: payload.optimizedResumeId ?? null,
      title: payload.title ?? null,
      job_title: payload.jobTitle ?? null,
      company: payload.company ?? null,
      job_description: payload.jobDescription ?? null,
      content_html: payload.contentHtml,
    })
    .select('id, title, job_title, company, created_at')
    .single();
  if (error || !r) fail('createCoverLetter', error?.message ?? 'no row returned');
  return {
    id: r.id,
    title: r.title,
    jobTitle: r.job_title,
    company: r.company,
    createdAt: r.created_at,
  };
}

export async function listCoverLetters(userId: string): Promise<CoverLetterSummary[]> {
  const db = requireDb();
  const { data, error } = await db
    .from('cover_letters')
    .select('id, title, job_title, company, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) fail('listCoverLetters', error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    jobTitle: r.job_title,
    company: r.company,
    createdAt: r.created_at,
  }));
}

export async function getCoverLetter(userId: string, id: string): Promise<CoverLetter | null> {
  const db = requireDb();
  const { data: r, error } = await db
    .from('cover_letters')
    .select('id, title, job_title, company, created_at, content_html, job_description')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();
  if (error) fail('getCoverLetter', error.message);
  if (!r) return null;
  return {
    id: r.id,
    title: r.title,
    jobTitle: r.job_title,
    company: r.company,
    createdAt: r.created_at,
    contentHtml: r.content_html,
    jobDescription: r.job_description,
  };
}

export async function deleteCoverLetter(userId: string, id: string): Promise<boolean> {
  return deleteRow('cover_letters', userId, id);
}

// ---------- helpers ----------

async function deleteRow(
  table: 'optimized_resumes' | 'cover_letters',
  userId: string,
  id: string
): Promise<boolean> {
  const db = requireDb();
  const { data, error } = await db
    .from(table)
    .delete()
    .eq('user_id', userId)
    .eq('id', id)
    .select('id');
  if (error) fail(`delete ${table}`, error.message);
  return (data?.length ?? 0) > 0;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  return [];
}

function sanitizeFileName(name: string | null): string {
  if (!name) return 'resume';
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200) || 'resume';
}

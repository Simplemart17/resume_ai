// Shared shapes for saved documents (base resumes, optimized resumes, cover
// letters). The API returns camelCase DTOs; the DB columns are snake_case and
// mapped in src/lib/documents.server.ts. Import these on both client and server
// — never redeclare per component.

export type DocumentKind = 'base-resume' | 'optimized-resume' | 'cover-letter';

/** List-row shape for a saved base resume (no full text — kept light). */
export interface BaseResumeSummary {
  id: string;
  title: string | null;
  fileName: string | null;
  fileType: string | null;
  hasOriginal: boolean;
  createdAt: string;
}

/** Full base resume, including the extracted text used to seed optimization. */
export interface BaseResume extends BaseResumeSummary {
  resumeText: string;
}

export interface OptimizedResumeSummary {
  id: string;
  title: string | null;
  jobTitle: string | null;
  company: string | null;
  matchScore: number | null;
  createdAt: string;
}

export interface OptimizedResume extends OptimizedResumeSummary {
  optimizedText: string;
  jobDescription: string | null;
  changes: string[];
  matchingSkills: string[];
  missingSkills: string[];
}

export interface CoverLetterSummary {
  id: string;
  title: string | null;
  jobTitle: string | null;
  company: string | null;
  createdAt: string;
}

export interface CoverLetter extends CoverLetterSummary {
  contentHtml: string;
  jobDescription: string | null;
}

// ---- POST payloads (client → API) ----

export interface SaveOptimizedResumePayload {
  baseResumeId?: string | null;
  title?: string;
  jobTitle?: string;
  company?: string;
  jobDescription?: string;
  optimizedText: string;
  matchScore?: number;
  changes?: string[];
  matchingSkills?: string[];
  missingSkills?: string[];
}

export interface SaveCoverLetterPayload {
  baseResumeId?: string | null;
  optimizedResumeId?: string | null;
  title?: string;
  jobTitle?: string;
  company?: string;
  jobDescription?: string;
  contentHtml: string;
}

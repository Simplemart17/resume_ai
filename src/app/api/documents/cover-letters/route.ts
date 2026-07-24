import { NextRequest, NextResponse } from 'next/server';
import { parseJsonBody, requireUser, documentsErrorResponse } from '@/utils/apiHelpers';
import { sanitizeStoredHtml } from '@/utils/sanitizeHtml';
import { MAX_JOB_DESCRIPTION_CHARS, MAX_TITLE_COMPANY_CHARS } from '@/config/apiLimits';
import {
  createCoverLetter,
  checkDocumentLimit,
  listCoverLetters,
} from '@/lib/documents.server';
import type { SaveCoverLetterPayload } from '@/types/documents';

// Cover letter HTML is short; cap generously to reject obviously bad input.
const MAX_COVER_LETTER_CHARS = 40000;

// GET  /api/documents/cover-letters → list summaries
// POST /api/documents/cover-letters → save one generated cover letter (JSON)

export async function GET(request: NextRequest) {
  const gate = await requireUser(request, 'documents');
  if (gate.errorResponse) return gate.errorResponse;
  try {
    return NextResponse.json({ items: await listCoverLetters(gate.userId) });
  } catch (error) {
    return documentsErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireUser(request, 'documents');
  if (gate.errorResponse) return gate.errorResponse;

  const parsed = await parseJsonBody<SaveCoverLetterPayload>(request);
  if (parsed.errorResponse) return parsed.errorResponse;
  const body = parsed.body;

  if (typeof body.contentHtml !== 'string' || !body.contentHtml.trim()) {
    return NextResponse.json({ error: 'contentHtml is required' }, { status: 400 });
  }
  if (body.contentHtml.length > MAX_COVER_LETTER_CHARS) {
    return NextResponse.json({ error: 'Cover letter is too long' }, { status: 413 });
  }

  try {
    const limit = await checkDocumentLimit(gate.userId, gate.tier, 'cover_letters');
    if (!limit.ok) return NextResponse.json({ error: limit.message }, { status: 403 });

    const item = await createCoverLetter(gate.userId, {
      baseResumeId: body.baseResumeId ?? null,
      optimizedResumeId: body.optimizedResumeId ?? null,
      title: clip(body.title, MAX_TITLE_COMPANY_CHARS),
      jobTitle: clip(body.jobTitle, MAX_TITLE_COMPANY_CHARS),
      company: clip(body.company, MAX_TITLE_COMPANY_CHARS),
      jobDescription: clip(body.jobDescription, MAX_JOB_DESCRIPTION_CHARS),
      // Defense-in-depth: strip active content server-side even though the
      // client already sanitized before POST (see sanitizeStoredHtml).
      contentHtml: sanitizeStoredHtml(body.contentHtml),
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return documentsErrorResponse(error);
  }
}

function clip(value: string | undefined, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

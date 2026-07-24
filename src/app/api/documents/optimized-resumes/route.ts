import { NextRequest, NextResponse } from 'next/server';
import { parseJsonBody, requireUser, documentsErrorResponse } from '@/utils/apiHelpers';
import {
  MAX_JOB_DESCRIPTION_CHARS,
  MAX_RESUME_CHARS,
  MAX_TITLE_COMPANY_CHARS,
} from '@/config/apiLimits';
import {
  createOptimizedResume,
  checkDocumentLimit,
  listOptimizedResumes,
} from '@/lib/documents.server';
import type { SaveOptimizedResumePayload } from '@/types/documents';

// GET  /api/documents/optimized-resumes → list summaries
// POST /api/documents/optimized-resumes → save one optimizer result (JSON)

export async function GET(request: NextRequest) {
  const gate = await requireUser(request, 'documents');
  if (gate.errorResponse) return gate.errorResponse;
  try {
    return NextResponse.json({ items: await listOptimizedResumes(gate.userId) });
  } catch (error) {
    return documentsErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireUser(request, 'documents');
  if (gate.errorResponse) return gate.errorResponse;

  const parsed = await parseJsonBody<SaveOptimizedResumePayload>(request);
  if (parsed.errorResponse) return parsed.errorResponse;
  const body = parsed.body;

  if (typeof body.optimizedText !== 'string' || !body.optimizedText.trim()) {
    return NextResponse.json({ error: 'optimizedText is required' }, { status: 400 });
  }
  if (body.optimizedText.length > MAX_RESUME_CHARS) {
    return NextResponse.json({ error: 'Optimized resume is too long' }, { status: 413 });
  }
  if (body.jobDescription && body.jobDescription.length > MAX_JOB_DESCRIPTION_CHARS) {
    return NextResponse.json({ error: 'Job description is too long' }, { status: 413 });
  }

  try {
    const limit = await checkDocumentLimit(gate.userId, gate.tier, 'optimized_resumes');
    if (!limit.ok) return NextResponse.json({ error: limit.message }, { status: 403 });

    const item = await createOptimizedResume(gate.userId, {
      baseResumeId: body.baseResumeId ?? null,
      title: clip(body.title, MAX_TITLE_COMPANY_CHARS),
      jobTitle: clip(body.jobTitle, MAX_TITLE_COMPANY_CHARS),
      company: clip(body.company, MAX_TITLE_COMPANY_CHARS),
      jobDescription: clip(body.jobDescription, MAX_JOB_DESCRIPTION_CHARS),
      optimizedText: body.optimizedText,
      matchScore: typeof body.matchScore === 'number' ? body.matchScore : undefined,
      changes: toStrings(body.changes),
      matchingSkills: toStrings(body.matchingSkills),
      missingSkills: toStrings(body.missingSkills),
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

function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string').slice(0, 100);
}

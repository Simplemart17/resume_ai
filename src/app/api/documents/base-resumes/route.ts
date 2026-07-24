import { NextRequest, NextResponse } from 'next/server';
import { requireUser, documentsErrorResponse } from '@/utils/apiHelpers';
import { extractResumeText } from '@/utils/extractResumeText';
import { MAX_RESUME_CHARS } from '@/config/apiLimits';
import { createBaseResume, checkDocumentLimit, listBaseResumes } from '@/lib/documents.server';

// GET  /api/documents/base-resumes  → list the signed-in user's base resumes
// POST /api/documents/base-resumes  → multipart file: extract text, store the
//   original in the private bucket, and save a base resume row.

export async function GET(request: NextRequest) {
  const gate = await requireUser(request, 'documents');
  if (gate.errorResponse) return gate.errorResponse;
  try {
    return NextResponse.json({ items: await listBaseResumes(gate.userId) });
  } catch (error) {
    return documentsErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  // Parsing a 10 MB upload is expensive — tighter limit than list reads.
  const gate = await requireUser(request, 'documents', { limit: 12 });
  if (gate.errorResponse) return gate.errorResponse;

  try {
    // Check the tier cap before the expensive extraction + file upload.
    const limit = await checkDocumentLimit(gate.userId, gate.tier, 'base_resumes');
    if (!limit.ok) return NextResponse.json({ error: limit.message }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get('file');

    const extraction = await extractResumeText(file);
    if (!extraction.ok) {
      return NextResponse.json({ error: extraction.error }, { status: extraction.status });
    }
    if (extraction.text.length > MAX_RESUME_CHARS) {
      return NextResponse.json(
        {
          error: `Your resume is ${extraction.text.length.toLocaleString()} characters; the maximum is ${MAX_RESUME_CHARS.toLocaleString()}.`,
        },
        { status: 413 }
      );
    }

    // Keep the original bytes so the exact upload can be re-downloaded later.
    const uploaded = file as File;
    const fileName = uploaded.name || null;
    const fileType = uploaded.type || null;
    const fileBytes = await uploaded.arrayBuffer();

    const saved = await createBaseResume(gate.userId, {
      title: fileName,
      resumeText: extraction.text,
      fileName,
      fileType,
      fileSize: uploaded.size ?? fileBytes.byteLength,
      fileBytes,
    });

    return NextResponse.json({ item: saved }, { status: 201 });
  } catch (error) {
    return documentsErrorResponse(error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireUser, documentsErrorResponse } from '@/utils/apiHelpers';
import {
  deleteBaseResume,
  getBaseResume,
  signBaseResumeOriginal,
} from '@/lib/documents.server';

// GET    /api/documents/base-resumes/[id]            → full base resume (text)
// GET    /api/documents/base-resumes/[id]?download=1 → { url } signed URL to the
//                                                       original uploaded file
// DELETE /api/documents/base-resumes/[id]            → remove row + stored file

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const gate = await requireUser(request, 'documents');
  if (gate.errorResponse) return gate.errorResponse;
  const { id } = await params;

  try {
    if (request.nextUrl.searchParams.get('download') === '1') {
      const url = await signBaseResumeOriginal(gate.userId, id);
      if (!url) {
        return NextResponse.json({ error: 'No original file for this resume' }, { status: 404 });
      }
      return NextResponse.json({ url });
    }

    const item = await getBaseResume(gate.userId, id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    return documentsErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const gate = await requireUser(request, 'documents');
  if (gate.errorResponse) return gate.errorResponse;
  const { id } = await params;

  try {
    const removed = await deleteBaseResume(gate.userId, id);
    if (!removed) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return documentsErrorResponse(error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireUser, documentsErrorResponse } from '@/utils/apiHelpers';
import { deleteCoverLetter, getCoverLetter } from '@/lib/documents.server';

// GET    /api/documents/cover-letters/[id] → full cover letter (HTML)
// DELETE /api/documents/cover-letters/[id] → remove it

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const gate = await requireUser(request, 'documents');
  if (gate.errorResponse) return gate.errorResponse;
  const { id } = await params;
  try {
    const item = await getCoverLetter(gate.userId, id);
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
    const removed = await deleteCoverLetter(gate.userId, id);
    if (!removed) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return documentsErrorResponse(error);
  }
}

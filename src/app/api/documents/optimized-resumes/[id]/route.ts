import { NextRequest, NextResponse } from 'next/server';
import { requireUser, documentsErrorResponse } from '@/utils/apiHelpers';
import { deleteOptimizedResume, getOptimizedResume } from '@/lib/documents.server';

// GET    /api/documents/optimized-resumes/[id] → full optimized resume
// DELETE /api/documents/optimized-resumes/[id] → remove it

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const gate = await requireUser(request, 'documents');
  if (gate.errorResponse) return gate.errorResponse;
  const { id } = await params;
  try {
    const item = await getOptimizedResume(gate.userId, id);
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
    const removed = await deleteOptimizedResume(gate.userId, id);
    if (!removed) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return documentsErrorResponse(error);
  }
}

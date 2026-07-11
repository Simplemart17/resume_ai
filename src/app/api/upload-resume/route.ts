import { NextRequest, NextResponse } from 'next/server';
import { extractResumeText } from '@/utils/extractResumeText';
import { checkRateLimit } from '@/utils/rateLimit';
import { rateLimitResponse } from '@/utils/apiHelpers';

export async function POST(request: NextRequest) {
  try {
    // Rate limit before doing any work — parsing 10 MB uploads is expensive
    const rateLimit = checkRateLimit(request, { limit: 10, windowMs: 60000, bucket: 'upload-resume' });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    const formData = await request.formData();

    // Shared validation + text extraction (same rules as parse-resume)
    const extraction = await extractResumeText(formData.get('file'));
    if (!extraction.ok) {
      return NextResponse.json({ error: extraction.error }, { status: extraction.status });
    }

    return NextResponse.json({ text: extraction.text });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}

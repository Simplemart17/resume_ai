import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10 MB.' },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileType = file.name.split('.').pop()?.toLowerCase();

    let text = '';

    switch (fileType) {
      case 'pdf': {
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
        break;
      }
      case 'docx': {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
        break;
      }
      case 'txt':
        text = buffer.toString('utf-8');
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported file type. Please upload PDF, DOCX, or TXT.' },
          { status: 400 }
        );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from file' },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}

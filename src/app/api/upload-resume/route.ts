import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { unlink } from 'fs/promises';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Create a temporary file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join('/tmp', `upload-${Date.now()}-${file.name}`);
    await writeFile(tempPath, buffer);

    let text = '';
    const fileType = file.name.split('.').pop()?.toLowerCase();

    try {
      switch (fileType) {
        case 'pdf':
          const pdfData = await pdfParse(buffer);
          text = pdfData.text;
          break;
        
        case 'docx':
          const result = await mammoth.extractRawText({ path: tempPath });
          text = result.value;
          break;
        
        case 'txt':
          text = buffer.toString('utf-8');
          break;
        
        default:
          throw new Error('Unsupported file type');
      }
    } finally {
      // Clean up the temporary file
      await unlink(tempPath).catch(() => {});
    }

    if (!text.trim()) {
      throw new Error('Could not extract text from file');
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
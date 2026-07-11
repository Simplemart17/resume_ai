import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import {
  MAX_UPLOAD_BYTES,
  RESUME_EXTENSIONS,
  RESUME_FORMATS_LABEL,
  RESUME_MIME_TYPES,
} from '@/config/uploads';

// Shared server-side resume text extraction, used by BOTH the parse-resume
// and upload-resume routes so their validation cannot drift: the same file
// must be accepted or rejected by both routes with the same message.
// pdf-parse is listed in serverExternalPackages (next.config.ts) — keep the
// plain default import so it is required at runtime, not bundled.

export type ExtractResumeTextResult =
  | { ok: true; text: string }
  | { ok: false; status: number; error: string };

const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));

const LEGACY_DOC_MIME = 'application/msword';

type ResumeExtension = (typeof RESUME_EXTENSIONS)[number];

/**
 * Detects the file kind with ONE consistent strategy: trust the MIME type
 * first, and fall back to the filename extension only when the MIME type is
 * missing or unrecognized (browsers sometimes send empty/generic types).
 * Returns '.doc' for legacy Word files so callers can reject them helpfully.
 */
function detectKind(file: File): ResumeExtension | '.doc' | null {
  const mime = file.type;
  if (mime) {
    for (const ext of RESUME_EXTENSIONS) {
      if (mime === RESUME_MIME_TYPES[ext]) return ext;
    }
    if (mime === LEGACY_DOC_MIME) return '.doc';
  }

  const name = file.name.toLowerCase();
  for (const ext of RESUME_EXTENSIONS) {
    if (name.endsWith(ext)) return ext;
  }
  if (name.endsWith('.doc')) return '.doc';

  return null;
}

/**
 * Validates an uploaded resume file and extracts its plain text.
 * Returns a discriminated result: { ok: true, text } on success, or
 * { ok: false, status, error } that routes map straight to a JSON response.
 */
export async function extractResumeText(file: unknown): Promise<ExtractResumeTextResult> {
  if (!(file instanceof File)) {
    return { ok: false, status: 400, error: 'No file provided' };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      status: 413,
      error: `File too large. Maximum size is ${MAX_UPLOAD_MB} MB.`,
    };
  }

  const kind = detectKind(file);

  if (kind === '.doc') {
    // mammoth only supports .docx, not legacy .doc
    return {
      ok: false,
      status: 400,
      error: 'Legacy .doc files are not supported. Please convert your file to .docx and try again.',
    };
  }

  if (kind === null) {
    return {
      ok: false,
      status: 400,
      error: `Unsupported file type. Please upload ${RESUME_FORMATS_LABEL}.`,
    };
  }

  let text: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    switch (kind) {
      case '.pdf': {
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
        break;
      }
      case '.docx': {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
        break;
      }
      case '.txt':
        text = buffer.toString('utf-8');
        break;
    }
  } catch (error) {
    // Corrupt or unreadable file (pdf-parse/mammoth threw)
    console.error('Error extracting resume text:', error);
    return { ok: false, status: 422, error: 'Could not extract text from file' };
  }

  if (!text.trim()) {
    return { ok: false, status: 422, error: 'Could not extract text from file' };
  }

  return { ok: true, text };
}

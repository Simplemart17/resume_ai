// Single source of truth for resume upload rules. Imported by the client
// uploaders AND the server parsing routes so the tiers cannot drift: the
// accept list, MIME types, size limit, and user-facing label must always
// describe the same set of files.

export const RESUME_EXTENSIONS = ['.pdf', '.docx', '.txt'] as const;

export const RESUME_ACCEPT = RESUME_EXTENSIONS.join(',');

export const RESUME_MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain',
};

export const RESUME_FORMATS_LABEL = 'PDF, DOCX, or TXT';

// Enforced client-side (pre-upload validation) and server-side (HTTP 413).
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

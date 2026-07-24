// Server-side defensive HTML strip for persisted cover letters.
//
// The cover letter is already DOMPurify-sanitized in the browser before it is
// POSTed, and it is only ever DOWNLOADED from storage (tags are flattened to
// plain blocks in documentExport.ts) — it is never rendered raw from the DB.
// This pass is belt-and-braces so a DIRECT API write (bypassing the client)
// cannot persist executable markup that a future feature might render.
//
// It is a targeted strip of *active* content — script/style/embedding tags,
// inline event handlers, and dangerous URL schemes — NOT a full allowlist DOM
// sanitizer. Anything that renders this HTML must still sanitize on the way out.

const ACTIVE_TAGS = 'script|style|iframe|object|embed|noscript|template|link|meta|base';

export function sanitizeStoredHtml(html: string): string {
  return (
    html
      // Drop active/embedding elements together with their contents.
      .replace(new RegExp(`<(${ACTIVE_TAGS})\\b[^>]*>[\\s\\S]*?<\\/\\1>`, 'gi'), '')
      // Drop any stray/self-closing openers or orphan closers of those tags.
      .replace(new RegExp(`<\\/?(${ACTIVE_TAGS})\\b[^>]*>`, 'gi'), '')
      // Remove HTML comments (can hide IE conditional-comment scripts).
      .replace(/<!--[\s\S]*?-->/g, '')
      // Strip inline event-handler attributes: onclick=, onerror=, onload=, ...
      .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
      .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
      // Neutralize dangerous URL schemes in href/src.
      .replace(/\b(href|src)\s*=\s*"(?:\s*(?:javascript|vbscript|data)):[^"]*"/gi, '$1="#"')
      .replace(/\b(href|src)\s*=\s*'(?:\s*(?:javascript|vbscript|data)):[^']*'/gi, "$1='#'")
  );
}

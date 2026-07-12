import type { ReactNode } from 'react';

/**
 * Builds one case-insensitive pattern for all keywords. Longer keywords win
 * over their substrings ("project management" before "project"), regex
 * metacharacters are escaped, and word boundaries are applied only where the
 * keyword actually starts/ends with a word character (so "C++" still works).
 */
function buildPattern(keywords: string[]): RegExp | null {
  const parts = keywords
    .map((k) => k.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((k) => {
      const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const lead = /^\w/.test(k) ? '\\b' : '';
      const tail = /\w$/.test(k) ? '\\b' : '';
      return lead + escaped + tail;
    });
  if (parts.length === 0) return null;
  return new RegExp(`(${parts.join('|')})`, 'gi');
}

/**
 * Renders `text` with every keyword occurrence wrapped in a highlighter
 * mark — the annotated-document view of the ATS's findings.
 */
export function highlightKeywords(text: string, keywords: string[]): ReactNode {
  const pattern = buildPattern(keywords);
  if (!pattern) return text;

  // String.split with a capturing group alternates plain/matched segments.
  return text.split(pattern).map((segment, index) =>
    index % 2 === 1 ? (
      <mark key={index} className="mark-hit">
        {segment}
      </mark>
    ) : (
      segment
    )
  );
}

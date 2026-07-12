'use client';

import { CopyButton } from '../CopyButton';

interface CoverLetterPanelProps {
  safeCoverLetter: string;
}

/** Plain-text form of the sanitized letter, for the clipboard. */
function toPlainText(html: string): string {
  return html
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function CoverLetterPanel({ safeCoverLetter }: CoverLetterPanelProps) {
  return (
    // A letter is a document: paper sheet, letter margins, machine strip below.
    <div className="paper mx-auto w-full max-w-[816px] overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-rule px-8 py-3 sm:px-12">
        <p className="eyebrow">Cover letter</p>
        <CopyButton text={toPlainText(safeCoverLetter)} label="cover letter" />
      </div>
      <div className="px-8 py-10 sm:px-12 sm:py-12">
        <div
          className="prose max-w-none text-ink leading-relaxed"
          dangerouslySetInnerHTML={{ __html: safeCoverLetter }}
        />
      </div>
      <div className="machine-strip">
        <span className="machine-token">[doc]</span>
        <span>cover letter · edit before sending</span>
      </div>
    </div>
  );
}

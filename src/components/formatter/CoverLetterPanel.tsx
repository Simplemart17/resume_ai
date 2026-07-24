'use client';

import { CopyButton } from '../CopyButton';
import { DownloadMenu } from '../DownloadMenu';
import { downloadCoverLetter } from '@/utils/documentExport';

interface CoverLetterPanelProps {
  safeCoverLetter: string;
  /** Base filename (no extension) for exports; defaults to "cover-letter". */
  fileBase?: string;
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

export function CoverLetterPanel({ safeCoverLetter, fileBase = 'cover-letter' }: CoverLetterPanelProps) {
  return (
    // A letter is a document: paper sheet, letter margins, machine strip below.
    <div className="paper mx-auto w-full max-w-[816px] overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-rule px-8 py-3 sm:px-12">
        <p className="eyebrow">Cover letter</p>
        <div className="flex items-center gap-2">
          <CopyButton text={toPlainText(safeCoverLetter)} label="cover letter" />
          <DownloadMenu
            options={[
              { format: 'pdf', onSelect: () => downloadCoverLetter(safeCoverLetter, fileBase, 'pdf') },
              { format: 'docx', onSelect: () => downloadCoverLetter(safeCoverLetter, fileBase, 'docx') },
            ]}
          />
        </div>
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

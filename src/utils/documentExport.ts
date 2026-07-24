// Client-side export of the AI's plain-text resume and HTML cover letters to
// PDF / DOCX / TXT. Runs entirely in the browser (no account needed), so these
// formats are available on every tier. The templated, styled resume PDF path
// stays in newPdfGenerator.ts — this is the "export what the AI returned"
// counterpart for the optimizer output, cover letters, and the /documents hub.
//
// jsPDF and docx are both heavy and only needed on an actual download click, so
// they are dynamically imported inside the render functions — kept out of the
// initial /optimize and /documents bundles and loaded on first use.

export type ResumeExportFormat = 'pdf' | 'docx' | 'txt';
export type CoverLetterExportFormat = 'pdf' | 'docx';

// --- shared helpers ---

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Base filename (no extension), sanitized for the download attribute. */
function safeBase(base: string): string {
  const cleaned = base.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'document';
}

/** A resume line that reads like a section heading — rendered bold in exports.
 *  Mirrors the isHeading heuristic in OptimizedResumePanel.tsx. */
function isHeadingLine(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 34) return false;
  const isAllCaps = /^[A-Z0-9 &/().,'-]+$/.test(t) && /[A-Z]/.test(t) && t === t.toUpperCase();
  const isKnown =
    /^(professional\s+summary|summary|profile|experience|work experience|employment|education|skills|technical skills|projects|certifications|awards|contact)\s*:?$/i.test(t);
  return isAllCaps || isKnown;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// --- resume (plain text) ---

export async function downloadResumeText(
  text: string,
  base: string,
  format: ResumeExportFormat
): Promise<void> {
  const filename = `${safeBase(base)}.${format}`;
  if (format === 'txt') {
    triggerDownload(new Blob([text], { type: 'text/plain;charset=utf-8' }), filename);
    return;
  }
  if (format === 'pdf') {
    await renderTextToPdf(text.split('\n'), filename);
    return;
  }
  await renderResumeToDocx(text, filename);
}

async function renderTextToPdf(lines: string[], filename: string) {
  const { default: jsPDF } = await import('jspdf');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const marginX = 18;
  const marginY = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - marginX * 2;
  let y = marginY;

  const advance = (lineHeight: number) => {
    if (y + lineHeight > pageHeight - marginY) {
      pdf.addPage();
      y = marginY;
    }
  };

  const firstContent = lines.findIndex((l) => l.trim().length > 0);

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) {
      advance(4);
      y += 4;
      return;
    }
    if (i === firstContent) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      advance(9);
      pdf.text(line, marginX, y);
      y += 9;
      return;
    }
    if (isHeadingLine(line)) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      const wrapped = pdf.splitTextToSize(line.toUpperCase(), contentWidth) as string[];
      wrapped.forEach((w) => {
        advance(6);
        pdf.text(w, marginX, y);
        y += 6;
      });
      y += 1.5;
      return;
    }
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10.5);
    const wrapped = pdf.splitTextToSize(line, contentWidth) as string[];
    wrapped.forEach((w) => {
      advance(5.4);
      pdf.text(w, marginX, y);
      y += 5.4;
    });
  });

  pdf.save(filename);
}

async function renderResumeToDocx(text: string, filename: string) {
  const { Document, Packer, Paragraph, TextRun } = await import('docx');
  const lines = text.split('\n');
  const firstContent = lines.findIndex((l) => l.trim().length > 0);

  const paragraphs = lines.map((raw, i) => {
    const line = raw.trim();
    if (!line) return new Paragraph({ children: [] });
    if (i === firstContent) {
      return new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: line, bold: true, size: 32 })],
      });
    }
    if (isHeadingLine(line)) {
      return new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text: line.toUpperCase(), bold: true, size: 24 })],
      });
    }
    return new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: line, size: 22 })],
    });
  });

  const doc = new Document({ sections: [{ children: paragraphs }] });
  triggerDownload(await Packer.toBlob(doc), filename);
}

// --- cover letter (HTML) ---

interface Block {
  text: string;
  heading?: boolean;
  bullet?: boolean;
}

// Block-boundary + role markers that survive tag-stripping. A role marker is
// only ever emitted right after a separator (start of a chunk), so we test with
// startsWith; the "@@..@@" shape makes a collision with real text impossible.
const SEP = '@@SEP@@';
const HEADING_MARK = '@@H@@';
const BULLET_MARK = '@@LI@@';

/** Light HTML to block parser: enough for the generator's paragraph, break,
 *  list, heading, and inline emphasis output. Inline formatting is flattened to
 *  text (the letter reads as prose either way). */
function htmlToBlocks(html: string): Block[] {
  const marked = html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<h[1-6][^>]*>/gi, `${SEP}${HEADING_MARK}`)
    .replace(/<li[^>]*>/gi, `${SEP}${BULLET_MARK}`)
    .replace(/<\/(p|div|h[1-6]|li)>/gi, SEP)
    .replace(/<[^>]+>/g, ''); // drop remaining inline tags (strong/em/span/...)

  const blocks: Block[] = [];
  for (const rawChunk of marked.split(SEP)) {
    const chunk = rawChunk.trimStart();
    const heading = chunk.startsWith(HEADING_MARK);
    const bullet = chunk.startsWith(BULLET_MARK);
    const text = decodeEntities(chunk.replace(HEADING_MARK, '').replace(BULLET_MARK, ''))
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{2,}/g, '\n')
      .trim();
    if (text) blocks.push({ text, heading, bullet });
  }
  return blocks;
}

export async function downloadCoverLetter(
  html: string,
  base: string,
  format: CoverLetterExportFormat
): Promise<void> {
  const filename = `${safeBase(base)}.${format}`;
  const blocks = htmlToBlocks(html);
  if (format === 'pdf') {
    await renderCoverLetterToPdf(blocks, filename);
    return;
  }
  await renderCoverLetterToDocx(blocks, filename);
}

async function renderCoverLetterToPdf(blocks: Block[], filename: string) {
  const { default: jsPDF } = await import('jspdf');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const marginX = 20;
  const marginY = 22;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - marginX * 2;
  let y = marginY;

  const advance = (h: number) => {
    if (y + h > pageHeight - marginY) {
      pdf.addPage();
      y = marginY;
    }
  };

  blocks.forEach((block) => {
    const indent = block.bullet ? 6 : 0;
    const prefix = block.bullet ? '-  ' : '';
    pdf.setFont('helvetica', block.heading ? 'bold' : 'normal');
    pdf.setFontSize(block.heading ? 12.5 : 10.5);
    const wrapped = pdf.splitTextToSize(prefix + block.text, contentWidth - indent) as string[];
    wrapped.forEach((w) => {
      advance(5.6);
      pdf.text(w, marginX + indent, y);
      y += 5.6;
    });
    y += block.heading ? 3 : 2.4;
  });

  pdf.save(filename);
}

async function renderCoverLetterToDocx(blocks: Block[], filename: string) {
  const { Document, Packer, Paragraph, TextRun } = await import('docx');
  const paragraphs = blocks.map(
    (block) =>
      new Paragraph({
        spacing: { after: block.heading ? 160 : 120 },
        bullet: block.bullet ? { level: 0 } : undefined,
        children: [
          new TextRun({ text: block.text, bold: block.heading, size: block.heading ? 26 : 22 }),
        ],
      })
  );
  const doc = new Document({ sections: [{ children: paragraphs }] });
  triggerDownload(await Packer.toBlob(doc), filename);
}

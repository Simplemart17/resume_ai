interface TemplatePreviewProps {
  templateId: string;
  className?: string;
}

/* A faint body-text line. Widths vary so the miniature reads as set copy,
   not a loading skeleton. */
function Line({ w = '100%', tone = 'ink' }: { w?: string; tone?: 'ink' | 'soft' }) {
  return (
    <div
      className={`h-[3px] rounded-[1px] ${tone === 'ink' ? 'bg-ink/18' : 'bg-ink/10'}`}
      style={{ width: w }}
    />
  );
}

/* A mono section opener, set small like a real résumé heading. */
function Head({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`font-mono text-[5px] font-semibold uppercase tracking-[0.14em] text-ink-soft ${className}`}
    >
      {children}
    </p>
  );
}

/**
 * A miniature of the ACTUAL typeset output, on-palette (ink/paper/rule/pen/mark)
 * — never gray-bar wireframes. The four templates differ by structure (column
 * count, header alignment, accent, margins), and each shows one matched keyword
 * swept in `mark` to reinforce "what the machine reads."
 */
export function TemplatePreview({ templateId, className = '' }: TemplatePreviewProps) {
  const sheet = (inner: React.ReactNode, pad = 'p-4') => (
    <div className={`bg-paper border border-rule rounded-[3px] h-full overflow-hidden ${pad}`}>
      {inner}
    </div>
  );

  const content = () => {
    switch (templateId) {
      // Single column, left header with a pen accent rule under the name.
      case 'modern-professional':
        return sheet(
          <div className="flex flex-col gap-2.5">
            <div>
              <p className="font-display text-[10px] font-bold leading-none text-ink">Amara Okafor</p>
              <p className="font-mono text-[5px] text-ink-soft mt-1">product engineer · lagos</p>
              <div className="mt-1.5 h-[2px] w-8 bg-pen rounded-full" />
            </div>
            <div className="space-y-1">
              <Head>Experience</Head>
              <Line w="100%" />
              <Line w="88%" />
              <Line w="72%" tone="soft" />
            </div>
            <div className="space-y-1">
              <Head>Skills</Head>
              <div className="flex flex-wrap gap-1 items-center">
                <span className="mark-hit font-mono text-[5px] leading-tight">kubernetes</span>
                <Line w="18px" /><Line w="22px" tone="soft" />
              </div>
            </div>
          </div>
        );

      // Centered header, ruled, two-column body — conservative, ink only.
      case 'classic-traditional':
        return sheet(
          <div className="flex flex-col gap-2.5">
            <div className="text-center pb-1.5 border-b border-rule">
              <p className="font-display text-[10px] font-bold leading-none text-ink">Amara Okafor</p>
              <p className="font-mono text-[5px] text-ink-soft mt-1">amara@okafor.dev · lagos</p>
            </div>
            <div className="grid grid-cols-[1.6fr_1fr] gap-2.5">
              <div className="space-y-1">
                <Head>Experience</Head>
                <Line w="100%" /><Line w="92%" /><Line w="66%" tone="soft" />
              </div>
              <div className="space-y-1">
                <Head>Skills</Head>
                <span className="mark-hit font-mono text-[5px] leading-tight">terraform</span>
                <Line w="80%" tone="soft" />
              </div>
            </div>
          </div>
        );

      // Single column with a pen sidebar stripe + pen section labels.
      case 'creative-designer':
        return sheet(
          <div className="flex gap-2 h-full">
            <div className="w-[3px] rounded-full bg-pen shrink-0" />
            <div className="flex flex-col gap-2.5 flex-1">
              <div>
                <p className="font-display text-[10px] font-bold leading-none text-ink">Amara Okafor</p>
                <p className="font-mono text-[5px] text-pen mt-1">product designer</p>
              </div>
              <div className="space-y-1">
                <Head className="text-pen">Experience</Head>
                <Line w="100%" /><Line w="84%" />
              </div>
              <div className="space-y-1">
                <Head className="text-pen">Skills</Head>
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="mark-hit font-mono text-[5px] leading-tight">figma</span>
                  <Line w="20px" tone="soft" />
                </div>
              </div>
            </div>
          </div>
        );

      // Wide margins, centered header, roomy — senior.
      case 'executive-premium':
        return sheet(
          <div className="flex flex-col gap-3 px-2">
            <div className="text-center pb-2 border-b-2 border-ink/70">
              <p className="font-display text-[11px] font-bold leading-none tracking-tight text-ink">
                Amara Okafor
              </p>
              <p className="font-mono text-[5px] uppercase tracking-[0.2em] text-ink-soft mt-1.5">
                Vice President · Engineering
              </p>
            </div>
            <div className="space-y-1.5">
              <Head className="text-center">Summary</Head>
              <Line w="100%" /><Line w="90%" tone="soft" />
            </div>
            <div className="space-y-1">
              <Head className="text-center">Leadership</Head>
              <div className="flex justify-center">
                <span className="mark-hit font-mono text-[5px] leading-tight">strategy</span>
              </div>
            </div>
          </div>,
          'p-4 pt-3'
        );

      default:
        return sheet(
          <div className="paper-rule h-full rounded-[2px] opacity-40" />
        );
    }
  };

  return <div className={className}>{content()}</div>;
}

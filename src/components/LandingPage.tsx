import Link from 'next/link';
import { TemplatePreview } from './TemplatePreview';
import { TEMPLATES } from '@/config/templates';
import { LogoMark } from './Logo';
import { TemplatesModalProvider, TemplatesModalTrigger } from './landing/TemplatesModal';
import { PricingCards } from './landing/PricingCards';
import { HeroDemo } from './landing/HeroDemo';
import { ScrollReveal } from './landing/ScrollReveal';

// Machine-strip captions for the landing template cards, keyed by template id.
const TEMPLATE_STRIPS: Record<string, string> = {
  'modern-professional': 'single column · sans-serif · ats safe',
  'classic-traditional': 'two column · conservative · ats safe',
  'creative-designer': 'accent sidebar · portfolio · ats safe',
  'executive-premium': 'wide margins · senior · ats safe',
};

// The real sequence the product runs — build, then score, then export. A
// numbered flow earns its numerals only because the order is real.
const FLOW = [
  {
    n: '01',
    verb: 'Build',
    line: 'Draft on paper or upload what you have. The sheet typesets itself as you type.',
  },
  {
    n: '02',
    verb: 'Score',
    line: 'Paste a job posting. Get a 0–100 match and the exact keywords you are missing.',
  },
  {
    n: '03',
    verb: 'Export',
    line: 'Download a print-ready PDF that reads cleanly on both sides of the screen.',
  },
];

// What you get. No icons — the mono index carries the structure, the way a
// résumé numbers nothing and lets its headings do the work.
const FEATURES = [
  {
    title: 'Structured builder',
    description: 'Guided sections for experience, education, and skills, with a live preview as you type.',
  },
  {
    title: 'ATS match scoring',
    description: 'Paste a job description and get a 0–100 match score with the exact keywords you are missing.',
  },
  {
    title: 'AI rewrite',
    description: 'GPT-4o rewrites your resume against the posting — every change listed, nothing invented.',
  },
  {
    title: 'Four typeset templates',
    description: 'Modern, Classic, Creative, Executive — parser-safe layouts a human still wants to read.',
  },
  {
    title: 'PDF export',
    description: 'Download a print-ready PDF that matches the preview exactly. No watermarks, no limits.',
  },
  {
    title: 'Application auto-fill',
    description: 'Extract your details once and paste them into any application form with one click.',
  },
];

export function LandingPage() {
  return (
    <TemplatesModalProvider>
      <ScrollReveal />
      <div className="min-h-screen bg-bench">
        {/* Hero: the thesis — one document, two readers. Ink stage; the
            resume is the lit object on it. */}
        <section className="ink-field overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="grid lg:grid-cols-[1.05fr_minmax(0,520px)] gap-14 lg:gap-12 items-center">
              <div>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-paper/55 mb-6">
                  Resume studio · ATS scoring · Cover letters
                </p>
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.02] text-paper">
                  Written for people.
                  <br />
                  <span className="mark-hit">Read by machines.</span>
                </h1>
                <p className="mt-7 text-lg md:text-xl text-paper/70 max-w-xl leading-relaxed">
                  Most resumes are screened by software before a person sees them. Build a cleanly
                  typeset resume, score it against any job description, and fix what the parser
                  can&apos;t see — before you apply.
                </p>

                <div className="mt-9 flex flex-col sm:flex-row gap-3">
                  <Link href="/builder" className="btn-pen px-7 py-3.5 text-base">
                    Start your resume <span aria-hidden="true">→</span>
                  </Link>
                  <TemplatesModalTrigger className="inline-flex items-center justify-center gap-2 rounded-[3px] px-7 py-3.5 text-base font-semibold border border-paper/30 text-paper hover:border-paper/70 hover:bg-paper/5 transition-colors">
                    Browse templates
                  </TemplatesModalTrigger>
                </div>

                <p className="mt-9 font-mono text-xs text-paper/60">
                  2 free templates&ensp;·&ensp;bring your own OpenAI key&ensp;·&ensp;Pro is $2, once
                </p>
              </div>

              <div className="flex justify-center lg:justify-end">
                <HeroDemo />
              </div>
            </div>
          </div>
        </section>

        {/* How it works: the real build → score → export sequence, in the
            machine voice. A different shape from the sections below — breaks
            the stack of equal blocks. */}
        <section className="border-b border-rule bg-paper">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="grid gap-px bg-rule md:grid-cols-3 overflow-hidden rounded-[3px]" data-reveal>
              {FLOW.map((step) => (
                <div key={step.n} className="bg-paper px-6 py-7 md:px-8" data-stagger>
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-3xl font-bold tracking-tight tabular-nums text-pen">
                      {step.n}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">
                      {step.verb}
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink">{step.line}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features: a ledger, not a card fan. Mono index tokens instead of
            decorative icons. */}
        <section id="features" className="py-20 lg:py-24 bench-grid">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12" data-reveal>
              <p className="eyebrow eyebrow-rule mb-4">
                <span>What you get</span>
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-ink">
                Everything between the blank page and the application.
              </h2>
            </div>

            <div className="paper overflow-hidden" data-reveal>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-rule">
                {FEATURES.map((feature, i) => (
                  <div
                    key={feature.title}
                    className="bg-paper p-7 transition-colors duration-200 hover:bg-pen-wash/40"
                    data-stagger
                  >
                    <span className="index-token">[{String(i + 1).padStart(2, '0')}]</span>
                    <h3 className="font-semibold text-ink mt-3 mb-1.5">{feature.title}</h3>
                    <p className="text-sm text-ink-soft leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Templates — real typeset miniatures, not wireframe bars. */}
        <section id="templates" className="py-20 lg:py-24 border-t border-rule">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12" data-reveal>
              <p className="eyebrow eyebrow-rule mb-4">
                <span>Templates</span>
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-ink">
                Four layouts. All of them get past the parser.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-reveal>
              {TEMPLATES.map((template) => (
                <div key={template.id} className="paper paper-hover overflow-hidden flex flex-col" data-stagger>
                  <div className="h-52 p-5 bg-bench border-b border-rule">
                    <TemplatePreview templateId={template.id} className="h-full" />
                  </div>
                  <div className="p-5 flex-1">
                    <h3 className="font-semibold text-ink mb-1">{template.name}</h3>
                    <p className="text-sm text-ink-soft leading-relaxed mb-4">{template.description}</p>
                    <Link href={`/builder?template=${template.id}`} className="btn-ghost w-full px-4 py-2 text-sm">
                      Use this template
                    </Link>
                  </div>
                  <div className="machine-strip">
                    <span className="machine-token">[layout]</span>
                    <span>{TEMPLATE_STRIPS[template.id] ?? 'ats safe'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 lg:py-24 border-t border-rule bench-grid">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12" data-reveal>
              <p className="eyebrow eyebrow-rule mb-4">
                <span>Pricing</span>
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-ink">
                Pay{' '}
                <span className="relative inline-block">
                  once.
                  <svg
                    className="absolute -left-3 -right-3 -top-2 -bottom-2 w-[calc(100%+24px)] h-[calc(100%+16px)]"
                    viewBox="0 0 120 56"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      className="circle-draw"
                      d="M10,36 C8,16 44,5 74,7 C102,9 116,20 112,33 C108,48 72,55 42,51 C20,48 11,44 10,36 Z"
                      stroke="#4B41D6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      pathLength="1"
                    />
                  </svg>
                </span>{' '}
                Keep it.
              </h2>
              <p className="mt-3 text-lg text-ink-soft">
                No subscriptions, no hidden fees. Every listed feature is enforced in code.
              </p>
            </div>

            <div data-reveal>
              <PricingCards />
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="ink-field">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-4xl" data-reveal>
              <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-paper leading-[1.05]">
                The next screen your resume faces is a parser.
                <br />
                Walk in prepared.
              </h2>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/builder" className="btn-pen px-7 py-3.5 text-base">
                  Start your resume <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/optimize"
                  className="px-7 py-3.5 text-base font-semibold text-paper/80 hover:text-paper underline decoration-paper/30 hover:decoration-paper underline-offset-4 transition-colors"
                >
                  Score the one you have
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-ink border-t border-paper/10 text-paper py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2.5 mb-2">
                  <LogoMark size={30} />
                  <span className="font-display text-xl font-bold tracking-tight text-paper">
                    ResumeAI<span className="text-pen-light"> Pro</span>
                  </span>
                </span>
                <p className="text-paper/60 max-w-md text-sm leading-relaxed">
                  A resume studio with a parser&apos;s-eye view: build, score, and export the one
                  page that gets you the interview.
                </p>
              </div>

              <nav aria-label="Footer" className="flex flex-wrap gap-6 text-sm">
                <Link href="/builder" className="text-paper/60 hover:text-paper transition-colors">
                  Resume Builder
                </Link>
                <Link href="/optimize" className="text-paper/60 hover:text-paper transition-colors">
                  AI Optimizer
                </Link>
                <Link href="/autofill" className="text-paper/60 hover:text-paper transition-colors">
                  Auto-Fill
                </Link>
                <Link href="/privacy" className="text-paper/60 hover:text-paper transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="text-paper/60 hover:text-paper transition-colors">
                  Terms
                </Link>
              </nav>
            </div>

            <div className="border-t border-paper/10 mt-10 pt-6">
              <p className="font-mono text-xs text-paper/65">
                <span className="text-pen-light">[resumeai]</span> © {new Date().getFullYear()} ·
                written for people · read by machines
              </p>
            </div>
          </div>
        </footer>
      </div>
    </TemplatesModalProvider>
  );
}

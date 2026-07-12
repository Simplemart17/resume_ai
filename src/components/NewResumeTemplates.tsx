'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { NewPDFGenerator } from '@/utils/newPdfGenerator';
import { TemplatePreview } from './TemplatePreview';
import { TEMPLATES } from '@/config/templates';
import { canUseTemplate } from '@/lib/tiers';
import { useUserTier } from '@/lib/useUserTier';
import toast from 'react-hot-toast';
import type { ResumeData } from '@/types/resume';

const EMPTY_RESUME_DATA: ResumeData = {
  personalInfo: { fullName: '', email: '', phone: '', location: '', website: '', linkedin: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
};

// Machine-strip captions for the template cards, keyed by template id.
// Mirrors TEMPLATE_STRIPS on the landing page.
const TEMPLATE_STRIPS: Record<string, string> = {
  'modern-professional': 'single column · sans-serif · ats safe',
  'classic-traditional': 'two column · conservative · ats safe',
  'creative-designer': 'accent sidebar · portfolio · ats safe',
  'executive-premium': 'wide margins · senior · ats safe',
};

interface NewResumeTemplatesProps {
  resumeText: string;
  resumeData?: ResumeData;
  onTemplateSelect?: (templateId: string) => void;
  selectedTemplate?: string;
}

export function NewResumeTemplates({
  resumeText,
  resumeData = EMPTY_RESUME_DATA,
  onTemplateSelect,
  selectedTemplate = 'modern-professional'
}: NewResumeTemplatesProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const { tier, loading: tierLoading, accountsEnabled } = useUserTier();

  // CLIENT-ONLY template gating. There is no server-side enforcement and
  // none is possible here: PDFs are generated entirely in the browser by
  // jsPDF, so a determined user can bypass this via devtools. The gate is a
  // purchase prompt, not a security boundary — keep the tier feature lists
  // honest about that. Only gate when accounts are enabled (Clerk env
  // present) — self-hosted installs without accounts keep every template.
  const isTemplateLocked = (templateId: string) =>
    accountsEnabled && !tierLoading && !canUseTemplate(tier, templateId);

  // While the tier is still loading, disable actions on premium templates
  // instead of flashing either the locked or unlocked state.
  const isTemplatePending = (templateId: string) =>
    accountsEnabled && tierLoading && !canUseTemplate('free', templateId);

  // Close the preview modal on Escape, and lock body scroll while it's open.
  useEffect(() => {
    if (!previewTemplate) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewTemplate(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [previewTemplate]);

  const handleTemplateSelect = (templateId: string) => {
    // Locked templates never render a Select button, but guard here too so a
    // tier flip mid-render (or a future call site) can't select one anyway —
    // handleDownloadPDF re-checks the same way.
    if (isTemplateLocked(templateId) || isTemplatePending(templateId)) {
      toast.error('This template requires Pro. Unlock all templates for a one-time $2 payment.');
      return;
    }
    onTemplateSelect?.(templateId);
    toast.success(`${TEMPLATES.find(t => t.id === templateId)?.name} template selected!`);
  };

  const handleDownloadPDF = async (templateId: string) => {
    if (isTemplateLocked(templateId)) {
      toast.error('This template requires Pro. Unlock all templates for a one-time $2 payment.');
      return;
    }
    if (isTemplatePending(templateId)) {
      // Tier still loading; the buttons are disabled, this is a fallback guard.
      return;
    }
    if (!resumeText.trim() && !resumeData.personalInfo.fullName) {
      toast.error('No resume content to export. Please upload a resume or build one first.');
      return;
    }

    setIsGenerating(true);
    try {
      const filename = `resume-${templateId}-${Date.now()}.pdf`;
      await NewPDFGenerator.generatePDF(resumeData, resumeText, templateId, filename);
      toast.success('Resume PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = (templateId: string) => {
    setPreviewTemplate(templateId);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="max-w-2xl mb-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink mb-2">
          Choose a template
        </h2>
        <p className="text-ink-soft">
          Four layouts. All of them parse cleanly in applicant tracking systems.
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {TEMPLATES.map((template) => (
          <div
            key={template.id}
            className={`paper overflow-hidden flex flex-col ${selectedTemplate === template.id
                ? 'border-2 !border-pen'
                : ''
              }`}
          >
            {/* Template Preview */}
            <div className="h-48 p-4 bg-bench border-b border-rule relative">
              <TemplatePreview templateId={template.id} className="h-full" />

              {isTemplateLocked(template.id) && (
                <div className="absolute top-3 left-3 bg-ink/80 text-paper font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-[2px]">
                  [pro]
                </div>
              )}

              {selectedTemplate === template.id && (
                <div className="absolute top-3 right-3 bg-pen rounded-[2px] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-paper" aria-hidden="true">
                  ✓
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-semibold text-ink mb-1">
                {template.name}
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed mb-4">
                {template.description}
              </p>

              {/* Features */}
              <div className="mb-5">
                <div className="flex flex-wrap gap-1.5">
                  {template.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="inline-block font-mono text-[10px] uppercase tracking-wider bg-bench border border-rule text-ink-soft px-2 py-0.5 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {isTemplateLocked(template.id) ? (
                <div className="mt-auto space-y-2">
                  <button
                    onClick={() => handlePreview(template.id)}
                    className="btn-ghost w-full px-4 py-2 text-sm"
                  >
                    Preview
                  </button>

                  <Link
                    href="/#pricing"
                    className="btn-pen w-full px-4 py-2 text-sm"
                  >
                    Unlock with Pro — $2 one-time
                  </Link>
                </div>
              ) : (
                <div className="mt-auto space-y-2">
                  <button
                    onClick={() => handleTemplateSelect(template.id)}
                    disabled={isTemplatePending(template.id)}
                    className={`btn-ghost w-full px-4 py-2 text-sm ${selectedTemplate === template.id
                        ? 'bg-pen-wash text-pen border-pen'
                        : ''
                      }`}
                  >
                    {selectedTemplate === template.id ? 'Selected' : 'Select template'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(template.id)}
                      className="btn-ghost flex-1 px-3 py-2 text-sm"
                    >
                      Preview
                    </button>

                    <button
                      onClick={() => handleDownloadPDF(template.id)}
                      disabled={isGenerating || isTemplatePending(template.id)}
                      className="btn-ghost flex-1 px-3 py-2 text-sm"
                    >
                      {isGenerating ? 'Generating…' : 'Download'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* the machine's view of the layout */}
            <div className="machine-strip">
              <span className="machine-token">[layout]</span>
              <span>{TEMPLATE_STRIPS[template.id] ?? 'ats safe'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="paper max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="template-preview-title"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-5">
                  <h3 id="template-preview-title" className="font-display text-xl font-semibold tracking-tight text-ink">
                    Preview: {TEMPLATES.find(t => t.id === previewTemplate)?.name}
                  </h3>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="text-ink-soft hover:text-ink transition-colors"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Large Template Preview */}
                  <div className="bg-bench border border-rule rounded-[3px] p-8">
                    <TemplatePreview templateId={previewTemplate} className="h-96" />
                  </div>

                  {/* Template Details */}
                  <div className="border border-rule rounded-[3px] p-6">
                    <h4 className="eyebrow eyebrow-rule mb-4">
                      <span>Features</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {TEMPLATES.find(t => t.id === previewTemplate)?.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="ok-token" aria-hidden="true">✓</span>
                          <span className="text-sm text-ink">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isTemplateLocked(previewTemplate) ? (
                    <Link
                      href="/#pricing"
                      onClick={() => setPreviewTemplate(null)}
                      className="btn-pen w-full px-6 py-3"
                    >
                      Unlock with Pro — $2 one-time
                    </Link>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          handleTemplateSelect(previewTemplate);
                          setPreviewTemplate(null);
                        }}
                        disabled={isTemplatePending(previewTemplate)}
                        className="btn-pen flex-1 px-6 py-3"
                      >
                        Use this template
                      </button>
                      <button
                        onClick={() => {
                          handleDownloadPDF(previewTemplate);
                          setPreviewTemplate(null);
                        }}
                        disabled={isGenerating || isTemplatePending(previewTemplate)}
                        className="btn-ghost flex-1 px-6 py-3"
                      >
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50">
          <div className="paper p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pen mx-auto mb-4"></div>
            <p className="font-mono text-xs text-ink-soft">
              <span className="text-pen">[pdf]</span> generating your resume…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

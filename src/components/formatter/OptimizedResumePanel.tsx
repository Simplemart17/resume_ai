'use client';

import { motion } from 'framer-motion';
import { CoverLetterPanel } from './CoverLetterPanel';

interface OptimizedResumePanelProps {
  optimizedResume: string;
  /** Sanitized cover-letter HTML (already passed through DOMPurify). */
  safeCoverLetter: string;
  coverLetterError: string | null;
}

export function OptimizedResumePanel({
  optimizedResume,
  safeCoverLetter,
  coverLetterError,
}: OptimizedResumePanelProps) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-gray-200"
        style={{
          backgroundColor: '#ffffff',
          padding: '40px',
          maxWidth: '816px',
          margin: '0 auto',
          boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
        }}
      >
        <div
          className="whitespace-pre-wrap text-base leading-relaxed"
          style={{
            fontFamily: 'Times New Roman, serif',
            color: '#1f2937',
            margin: '0 auto'
          }}
        >
          {optimizedResume}
        </div>
      </motion.div>

      {coverLetterError && (
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          <div className="flex items-start">
            <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{coverLetterError}</span>
          </div>
        </div>
      )}

      {safeCoverLetter && (
        <CoverLetterPanel safeCoverLetter={safeCoverLetter} />
      )}
    </div>
  );
}

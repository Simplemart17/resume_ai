'use client';

import { motion } from 'framer-motion';

interface CoverLetterPanelProps {
  safeCoverLetter: string;
}

export function CoverLetterPanel({ safeCoverLetter }: CoverLetterPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Cover Letter</h2>
      <div
        className="prose max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: safeCoverLetter }}
      />
    </motion.div>
  );
}

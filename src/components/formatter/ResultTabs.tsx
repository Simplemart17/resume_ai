'use client';

import { motion } from 'framer-motion';
import { FormatterTab } from './types';

interface ResultTabsProps {
  activeTab: FormatterTab;
  onTabChange: (tab: FormatterTab) => void;
  generatingCoverLetter: boolean;
  hasCoverLetter: boolean;
  onGenerateCoverLetter: () => void;
}

export function ResultTabs({
  activeTab,
  onTabChange,
  generatingCoverLetter,
  hasCoverLetter,
  onGenerateCoverLetter,
}: ResultTabsProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'resume', label: 'Resume', icon: '📄' },
          { id: 'analysis', label: 'Analysis', icon: '📊' },
          { id: 'dashboard', label: 'Dashboard', icon: '📈' },
          { id: 'templates', label: 'Templates', icon: '🎨' },
          { id: 'autofill', label: 'Auto-Fill', icon: '🚀' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id as FormatterTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === tab.id
              ? 'text-white shadow-lg transform scale-105'
              : 'text-gray-700 hover:bg-gray-200 bg-gray-100 hover:scale-[1.02]'
            }`}
            style={activeTab === tab.id ? {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
            } : {}}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'resume' && (
        <motion.button
          onClick={onGenerateCoverLetter}
          disabled={generatingCoverLetter}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 cursor-pointer disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {generatingCoverLetter ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {hasCoverLetter ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}

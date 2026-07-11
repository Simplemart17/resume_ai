'use client';

import { motion } from 'framer-motion';
import { FormattedResult } from './types';

interface AnalysisPanelProps {
  result: FormattedResult;
}

export function AnalysisPanel({ result }: AnalysisPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Match Score</h2>
        <div className="relative pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold" style={{ color: '#4f46e5' }}>{result.matchScore}%</span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mt-4 text-xs flex rounded bg-gray-200">
            <motion.div
              className="rounded"
              style={{
                background: 'linear-gradient(to right, rgb(99, 102, 241), rgb(168, 85, 247))'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${result.matchScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center mb-2">
          <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#6366f1' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-lg font-medium text-gray-900">Matching Skills</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {result.matchingSkills.map((skill, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-200 hover:bg-green-200 transition-colors duration-200"
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center mb-2">
          <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#6366f1' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <h2 className="text-lg font-medium text-gray-900">Missing Skills</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {result.missingSkills.map((skill, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full border border-red-200 hover:bg-red-200 transition-colors duration-200"
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center mb-2">
          <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#6366f1' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-medium text-gray-900">Changes Made</h2>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
          <ul className="space-y-3">
            {result.changes.map((change, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start"
              >
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#6366f1' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-600">{change}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

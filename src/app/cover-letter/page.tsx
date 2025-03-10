'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CoverLetterPage() {
  const searchParams = useSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const jobTitle = searchParams.get('jobTitle') || '';
  const company = searchParams.get('company') || '';
  const jobDesc = searchParams.get('jobDesc') || '';

  const generateCoverLetter = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle,
          company,
          jobDescription: jobDesc,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate cover letter');
      }

      setCoverLetter(data.coverLetter);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate cover letter');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (jobTitle && company && jobDesc) {
      generateCoverLetter();
    }
  }, [jobTitle, company, jobDesc]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cover Letter Generator</h1>
          <p className="text-gray-600">
            Generating a tailored cover letter for {jobTitle} position at {company}
          </p>
        </div>

        {isGenerating ? (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex flex-col items-center justify-center">
              <motion.div
                className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="mt-4 text-gray-600">Generating your cover letter...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-700">
            <div className="flex items-start">
              <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        ) : coverLetter ? (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="prose max-w-none text-gray-900">
              <div dangerouslySetInnerHTML={{ __html: coverLetter }} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 
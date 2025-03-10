'use client';

import { useState, useRef } from 'react';
import { FileUploader } from './FileUploader';
import { motion } from 'framer-motion';

interface FormattedResult {
  optimizedResume: string;
  matchScore: number;
  changes: string[];
  matchingSkills: string[];
  missingSkills: string[];
}

export function ResumeFormatter() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormattedResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'resume' | 'analysis'>('resume');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (file: File | null) => {
    setResumeFile(file);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCoverLetter('');
    setCoverLetterError(null);
    
    try {
      if (!resumeFile) {
        throw new Error('Please upload a resume file');
      }

      // First, upload the file and get the text content
      const formData = new FormData();
      formData.append('file', resumeFile);
      
      const uploadResponse = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to process resume file');
      }
      
      const { text } = await uploadResponse.json();

      // Now format the resume
      const formatResponse = await fetch('/api/format-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume: text, jobDescription }),
      });
      
      if (!formatResponse.ok) {
        const errorData = await formatResponse.json();
        throw new Error(errorData.error || 'Failed to format resume');
      }

      const data = await formatResponse.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!result || !jobDescription) return;
    
    setGeneratingCoverLetter(true);
    setCoverLetterError(null);

    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: jobDescription.match(/(?:position|job title|role):?\s*([^.;\n]+)/i)?.[1] || 'the position',
          company: jobDescription.match(/(?:at|with|for)\s+([^.;\n]+)/i)?.[1] || 'the company',
          jobDescription: jobDescription
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate cover letter');
      }

      setCoverLetter(data.coverLetter);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      setCoverLetterError(error instanceof Error ? error.message : 'Failed to generate cover letter');
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div 
        className="py-8 px-6 rounded-t-xl text-white"
        style={{
          background: 'linear-gradient(to right, rgb(79, 70, 229), rgb(147, 51, 234))'
        }}
      >
        <h1 className="text-3xl font-bold text-center mb-2">AI Resume Optimizer</h1>
        <p className="text-center opacity-90">Upload your resume and job description to get AI-powered optimization</p>
      </div>

      <div className="bg-white shadow-xl rounded-b-xl p-6">
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Resume
              </label>
              <FileUploader
                onFileSelect={handleFileChange}
                selectedFile={resumeFile}
                accept=".pdf,.doc,.docx,.txt"
              />
              {error && (
                <motion.p 
                  className="mt-2 text-sm text-red-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="jobDescription" className="mb-2 block text-sm font-semibold text-gray-700 text-right">
                Job Description
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                rows={12}
                className="mt-1 block w-full rounded-lg border-gray-900 text-gray-700 p-3 shadow-sm resize-none"
                style={{
                  outline: 'none',
                  borderColor: '#d1d5db',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading || !resumeFile}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white disabled:opacity-50 transition-all duration-200"
            style={{
              background: 'linear-gradient(to right, rgb(79, 70, 229), rgb(147, 51, 234))'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : 'Optimize Resume'}
          </motion.button>
        </motion.form>

        {result && (
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex space-x-2 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('resume')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'resume'
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-200 bg-gray-100'
                  }`}
                  style={activeTab === 'resume' ? { backgroundColor: '#4f46e5' } : {}}
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'analysis'
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-200 bg-gray-100'
                  }`}
                  style={activeTab === 'analysis' ? { backgroundColor: '#4f46e5' } : {}}
                >
                  Analysis
                </button>
              </div>

              {activeTab === 'resume' && !coverLetter && (
                <motion.button
                  onClick={handleGenerateCoverLetter}
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
                      Generate Cover Letter
                    </>
                  )}
                </motion.button>
              )}
            </div>

            {activeTab === 'resume' ? (
              <div className="space-y-8">
                <motion.div
                  ref={resumeRef}
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
                    {result.optimizedResume}
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

                {coverLetter && (
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
                      dangerouslySetInnerHTML={{ __html: coverLetter }}
                    />
                  </motion.div>
                )}
              </div>
            ) : (
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
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
} 
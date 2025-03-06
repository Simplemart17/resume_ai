'use client';

import { useState } from 'react';
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

  const handleFileChange = (file: File | null) => {
    setResumeFile(file);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-6 rounded-t-xl">
        <h1 className="text-3xl font-bold text-center mb-2">AI Resume Optimizer</h1>
        <p className="text-center text-indigo-100">Upload your resume and job description to get AI-powered optimization</p>
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
              <label htmlFor="jobDescription" className="block text-sm font-semibold text-gray-700">
                Job Description
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                rows={12}
                className="mt-1 block w-full rounded-lg border-gray-300 text-gray-700 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none"
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
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
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
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setActiveTab('resume')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all duration-200 ${
                    activeTab === 'resume' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Optimized Resume
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'analysis' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Analysis
                </button>
              </div>
            </div>

            {activeTab === 'resume' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 p-6 rounded-xl shadow-inner"
              >
                <pre className="whitespace-pre-wrap text-sm font-mono">{result.optimizedResume}</pre>
              </motion.div>
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
                        <span className="text-3xl font-bold text-indigo-600">{result.matchScore}%</span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mt-4 text-xs flex rounded bg-gray-200">
                      <motion.div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.matchScore}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Matching Skills</h2>
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
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Missing Skills</h2>
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
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Improvements Made</h2>
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
                          <svg className="h-6 w-6 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
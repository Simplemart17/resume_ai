'use client';

import { FileUploader } from '../FileUploader';
import { motion } from 'framer-motion';

interface OptimizeFormProps {
  resumeFile: File | null;
  onFileChange: (file: File | null) => void;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  jobTitle: string;
  onJobTitleChange: (value: string) => void;
  company: string;
  onCompanyChange: (value: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function OptimizeForm({
  resumeFile,
  onFileChange,
  jobDescription,
  onJobDescriptionChange,
  jobTitle,
  onJobTitleChange,
  company,
  onCompanyChange,
  loading,
  error,
  onSubmit,
}: OptimizeFormProps) {
  return (
    <motion.form
      onSubmit={onSubmit}
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
          onFileSelect={onFileChange}
          selectedFile={resumeFile}
          accept=".pdf,.docx,.txt"
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
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="jobTitle" className="mb-2 block text-sm font-semibold text-gray-700">
          Job Title <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <input
          id="jobTitle"
          name="jobTitle"
          type="text"
          className="mt-1 block w-full rounded-lg border border-gray-300 text-gray-700 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g. Senior Software Engineer"
          value={jobTitle}
          onChange={(e) => onJobTitleChange(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="company" className="mb-2 block text-sm font-semibold text-gray-700">
          Company <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <input
          id="company"
          name="company"
          type="text"
          className="mt-1 block w-full rounded-lg border border-gray-300 text-gray-700 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g. Acme Corp"
          value={company}
          onChange={(e) => onCompanyChange(e.target.value)}
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
  );
}

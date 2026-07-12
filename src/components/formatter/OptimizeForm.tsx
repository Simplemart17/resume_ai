'use client';

import { FileUploader } from '../FileUploader';
import { RESUME_ACCEPT } from '@/config/uploads';
import { MAX_JOB_DESCRIPTION_CHARS } from '@/config/apiLimits';

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
    <form onSubmit={onSubmit} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <label className="eyebrow mb-2 block">
          Your resume
        </label>
        <FileUploader
          onFileSelect={onFileChange}
          selectedFile={resumeFile}
          accept={RESUME_ACCEPT}
        />
        {error && (
          <p className="mt-2 text-sm text-fail">
            {error}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="jobDescription" className="eyebrow mb-2 block">
          Job description
        </label>
        <textarea
          id="jobDescription"
          name="jobDescription"
          rows={12}
          className="input-flat mt-1 block w-full p-3 text-sm resize-none"
          placeholder="Paste the job description here…"
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          maxLength={MAX_JOB_DESCRIPTION_CHARS}
          required
        />
        {jobDescription.length > MAX_JOB_DESCRIPTION_CHARS * 0.8 && (
          <p className="mt-1 font-mono text-xs text-ink-soft tabular-nums text-right" aria-live="polite">
            {jobDescription.length.toLocaleString()} / {MAX_JOB_DESCRIPTION_CHARS.toLocaleString()}
          </p>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="jobTitle" className="eyebrow mb-2 block">
          Job title <span className="opacity-60">(optional)</span>
        </label>
        <input
          id="jobTitle"
          name="jobTitle"
          type="text"
          className="input-flat mt-1 block w-full p-3 text-sm"
          placeholder="e.g. Senior Software Engineer"
          value={jobTitle}
          onChange={(e) => onJobTitleChange(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="company" className="eyebrow mb-2 block">
          Company <span className="opacity-60">(optional)</span>
        </label>
        <input
          id="company"
          name="company"
          type="text"
          className="input-flat mt-1 block w-full p-3 text-sm"
          placeholder="e.g. Acme Corp"
          value={company}
          onChange={(e) => onCompanyChange(e.target.value)}
        />
      </div>
    </div>

    <button
      type="submit"
      disabled={loading || !resumeFile}
      className="btn-pen w-full px-4 py-3 text-sm"
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Scoring…
        </span>
      ) : 'Score my resume'}
    </button>
  </form>
  );
}

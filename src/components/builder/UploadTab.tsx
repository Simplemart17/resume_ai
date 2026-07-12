'use client';

import { FileUploader } from '../FileUploader';
import { RESUME_ACCEPT } from '@/config/uploads';

interface UploadTabProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  loading: boolean;
}

export function UploadTab({ onFileSelect, selectedFile, loading }: UploadTabProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-1.5">
        Upload your resume
      </h2>
      <p className="text-sm text-ink-soft mb-6">
        We parse it into sections you can edit under the Build tab.
      </p>
      <FileUploader
        onFileSelect={onFileSelect}
        selectedFile={selectedFile}
        accept={RESUME_ACCEPT}
      />
      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="inline-flex items-center gap-2.5 px-3 py-2 bg-bench border border-rule rounded-[3px] font-mono text-xs text-ink-soft">
            <svg className="animate-spin h-4 w-4 text-pen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>
              <span className="text-pen">[parse]</span> reading your resume…
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

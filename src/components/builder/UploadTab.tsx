'use client';

import { FileUploader } from '../FileUploader';

interface UploadTabProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  loading: boolean;
}

export function UploadTab({ onFileSelect, selectedFile, loading }: UploadTabProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
        Upload Your Existing Resume
      </h2>
      <FileUploader
        onFileSelect={onFileSelect}
        selectedFile={selectedFile}
        accept=".pdf,.doc,.docx,.txt"
      />
      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-600 bg-blue-100">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Parsing resume...
          </div>
        </div>
      )}
    </div>
  );
}

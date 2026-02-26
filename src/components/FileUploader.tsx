'use client';

import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept: string;
}

export function FileUploader({ onFileSelect, selectedFile, accept }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (accept.split(',').some(type => file.name.toLowerCase().endsWith(type.replace('*', '').trim()))) {
        onFileSelect(file);
      } else {
        toast.error('Unsupported file type. Please upload a PDF, DOC, DOCX, or TXT file.');
      }
    }
  }, [accept, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  }, [onFileSelect]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg mt-1 min-h-[200px] py-8 flex items-center justify-center ${
        !isDragging ? 'border-gray-300 hover:border-gray-400' : ''
      }`}
      style={isDragging ? { borderColor: '#6366f1', backgroundColor: '#eef2ff' } : {}}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="hidden"
        onChange={handleFileInput}
        accept={accept}
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer inline-flex flex-col items-center p-6 text-center"
      >
        <svg
          className="w-12 h-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <span className="text-gray-600 text-base mb-2">
          {selectedFile
            ? selectedFile.name
            : 'Drop your resume here, or click to select'}
        </span>
        <span className="text-sm text-gray-500">
          Supported formats: PDF, DOC, DOCX, TXT
        </span>
      </label>
    </div>
  );
}

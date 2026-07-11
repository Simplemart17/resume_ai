'use client';

import { useCallback, useId, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { MAX_UPLOAD_BYTES, RESUME_ACCEPT } from '@/config/uploads';

// ".pdf,.docx,.txt" -> "PDF, DOCX, TXT". Derived from the actual accept
// prop so the visible copy can never contradict what validation allows.
function formatsLabelFromAccept(accept: string): string {
  return accept
    .split(',')
    .map(ext => ext.replace('*', '').trim().replace(/^\./, '').toUpperCase())
    .filter(Boolean)
    .join(', ');
}

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string;
}

export function FileUploader({ onFileSelect, selectedFile, accept = RESUME_ACCEPT }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  // Depth counter: dragging over child elements fires dragleave on the parent,
  // so a plain boolean flickers. Only reset when we've left the outermost element.
  const dragDepth = useRef(0);
  const inputId = useId();
  const formatsLabel = formatsLabelFromAccept(accept);

  const validateFile = useCallback((file: File): boolean => {
    const allowedExtensions = accept
      .split(',')
      .map(type => type.replace('*', '').trim().toLowerCase())
      .filter(Boolean);
    const hasAllowedExtension = allowedExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );
    if (!hasAllowedExtension) {
      toast.error(`Unsupported file type. Supported formats: ${formatsLabelFromAccept(accept)}.`);
      return false;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(`File is too large. The maximum size is ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`);
      return false;
    }
    return true;
  }, [accept]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  }, [validateFile, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      onFileSelect(null);
      return;
    }
    if (validateFile(file)) {
      onFileSelect(file);
    } else {
      // Clear the input so re-selecting the same file fires onChange again
      e.target.value = '';
    }
  }, [validateFile, onFileSelect]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg mt-1 min-h-[200px] py-8 flex items-center justify-center ${
        !isDragging ? 'border-gray-300 hover:border-gray-400' : ''
      }`}
      style={isDragging ? { borderColor: '#6366f1', backgroundColor: '#eef2ff' } : {}}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="hidden"
        onChange={handleFileInput}
        accept={accept}
        id={inputId}
      />
      <label
        htmlFor={inputId}
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
          Supported formats: {formatsLabel}
        </span>
      </label>
    </div>
  );
}

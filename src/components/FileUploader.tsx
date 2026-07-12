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
      className={`border-2 border-dashed rounded-[3px] mt-1 min-h-[200px] py-8 flex items-center justify-center transition-colors ${
        isDragging ? 'border-pen bg-pen-wash' : 'border-rule hover:border-ink/40 bg-paper'
      }`}
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
        {/* A sheet, not a cloud — a résumé goes here. */}
        <svg className="w-7 h-7 mb-3" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect x="8.5" y="4.5" width="17" height="22" rx="2" fill="#ffffff" stroke="rgb(22 24 29 / 0.3)" strokeWidth="1.5" />
          <rect x="5.5" y="7.5" width="17" height="22" rx="2" fill="#ffffff" stroke="#16181d" strokeWidth="1.5" />
          <rect x="9" y="13" width="10.5" height="1.6" rx="0.8" fill="#4b41d6" />
          <rect x="9" y="17" width="8" height="1.4" rx="0.7" fill="rgb(22 24 29 / 0.28)" />
          <rect x="9" y="20.5" width="10" height="1.4" rx="0.7" fill="rgb(22 24 29 / 0.28)" />
        </svg>
        <span className="text-ink text-sm font-medium mb-2">
          {selectedFile
            ? selectedFile.name
            : 'Drop your resume here, or click to select'}
        </span>
        <span className="font-mono text-xs text-ink-soft">
          <span className="text-pen">[accepts]</span> {formatsLabel}
        </span>
      </label>
    </div>
  );
}

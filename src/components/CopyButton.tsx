'use client';

import { useEffect, useRef, useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CopyButtonProps {
  /** The text to copy to the clipboard. */
  text: string;
  /** Human-readable name of the field being copied (used in tooltips, toasts, and the aria-label). */
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = 'text', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied to clipboard!`);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`p-1 text-gray-400 hover:text-blue-600 transition-colors ${className}`}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      {copied ? (
        <FiCheck className="w-4 h-4 text-green-600" aria-hidden="true" />
      ) : (
        <FiCopy className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  );
}

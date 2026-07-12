'use client';

import { useEffect, useRef, useState } from 'react';
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
      className={`btn-ghost px-2.5 py-1.5 text-xs font-mono ${className}`}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      {copied ? (
        <span className="text-pass" aria-hidden="true">✓ copied</span>
      ) : (
        <span aria-hidden="true">copy</span>
      )}
    </button>
  );
}

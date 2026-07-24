'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export interface DownloadOption {
  /** Uppercased in the trigger/menu; e.g. 'pdf', 'docx', 'txt'. */
  format: string;
  /** Runs on select; may be async (DOCX generation returns a promise). */
  onSelect: () => void | Promise<void>;
}

interface DownloadMenuProps {
  options: DownloadOption[];
  /** Trigger label; defaults to "download". */
  label?: string;
  className?: string;
}

/**
 * The single download affordance across the app: a mono, paper-styled menu of
 * export formats (PDF / DOCX / TXT). Used by the optimized-résumé panel, the
 * cover-letter panel, and the /documents hub so every "get the file" control
 * looks and behaves the same.
 */
export function DownloadMenu({ options, label = 'download', className = '' }: DownloadMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSelect = async (option: DownloadOption) => {
    setOpen(false);
    setBusy(true);
    try {
      await option.onSelect();
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(`Couldn't create the ${option.format.toUpperCase()} file`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        className="btn-ghost px-2.5 py-1.5 text-xs font-mono disabled:opacity-60"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {busy ? 'preparing…' : `${label} ▾`}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1.5 min-w-[120px] overflow-hidden rounded-[3px] border border-rule bg-paper shadow-[0_8px_24px_-12px_rgb(22_24_29/0.5)]"
        >
          {options.map((option) => (
            <button
              key={option.format}
              type="button"
              role="menuitem"
              onClick={() => handleSelect(option)}
              className="block w-full px-3.5 py-2 text-left font-mono text-xs uppercase tracking-[0.12em] text-ink-soft hover:bg-bench hover:text-ink"
            >
              {option.format}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

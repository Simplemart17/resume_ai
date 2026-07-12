'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { TemplatePreview } from '../TemplatePreview';
import { TEMPLATES } from '@/config/templates';

const TemplatesModalContext = createContext<(() => void) | null>(null);

interface TemplatesModalTriggerProps {
  className?: string;
  children: ReactNode;
}

/** Button that opens the templates modal. Must be rendered inside TemplatesModalProvider. */
export function TemplatesModalTrigger({ className, children }: TemplatesModalTriggerProps) {
  const open = useContext(TemplatesModalContext);
  return (
    <button onClick={() => open?.()} className={className}>
      {children}
    </button>
  );
}

/**
 * Client island that owns the templates modal state. Server-rendered page
 * content is passed through as `children`, so only the modal and its
 * triggers ship interactive JS.
 */
export function TemplatesModalProvider({ children }: { children: ReactNode }) {
  const [showTemplates, setShowTemplates] = useState(false);
  const open = useCallback(() => setShowTemplates(true), []);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape, lock body scroll, and move focus into the dialog on open.
  useEffect(() => {
    if (!showTemplates) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowTemplates(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [showTemplates]);

  return (
    <TemplatesModalContext.Provider value={open}>
      {children}

      {/* Template Modal */}
      {showTemplates && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-modal-overlay"
          onClick={() => setShowTemplates(false)}
        >
          <div
            ref={panelRef}
            tabIndex={-1}
            className="paper max-w-6xl max-h-[90vh] overflow-auto animate-modal-panel outline-none"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="templates-modal-title"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="eyebrow mb-1.5">Templates</p>
                  <h3 id="templates-modal-title" className="font-display text-2xl font-bold tracking-tight text-ink">
                    Four layouts, all parser-safe
                  </h3>
                </div>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-ink-soft hover:text-ink p-2 text-2xl leading-none transition-colors"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="border border-rule rounded-[3px] overflow-hidden hover:border-pen transition-colors duration-200"
                  >
                    <div className="h-64 p-6 bg-bench border-b border-rule">
                      <TemplatePreview templateId={template.id} className="h-full" />
                    </div>
                    <div className="p-5">
                      <h4 className="font-semibold text-ink mb-1">
                        {template.name}
                      </h4>
                      <p className="text-sm text-ink-soft leading-relaxed mb-4">
                        {template.description}
                      </p>
                      <Link
                        href={`/builder?template=${template.id}`}
                        className="btn-ghost w-full px-4 py-2 text-sm"
                        onClick={() => setShowTemplates(false)}
                      >
                        Use this template
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/builder"
                  className="btn-pen px-7 py-3 text-base"
                  onClick={() => setShowTemplates(false)}
                >
                  Start your resume <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </TemplatesModalContext.Provider>
  );
}

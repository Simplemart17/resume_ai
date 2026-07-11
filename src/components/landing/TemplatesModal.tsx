'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiX } from 'react-icons/fi';
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

  // Close the templates modal on Escape
  useEffect(() => {
    if (!showTemplates) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowTemplates(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
            className="bg-white rounded-xl max-w-6xl max-h-[90vh] overflow-auto animate-modal-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="templates-modal-title"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 id="templates-modal-title" className="text-2xl font-bold text-gray-900">
                  Professional Resume Templates
                </h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                  aria-label="Close"
                >
                  <FiX className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {TEMPLATES.map((template, index) => (
                  <div
                    key={template.id}
                    className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors duration-300 animate-fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="h-64 p-6 bg-gray-50">
                      <TemplatePreview templateId={template.id} className="h-full" />
                    </div>
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {template.name}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {template.description}
                      </p>
                      <Link
                        href="/builder"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200 block text-center"
                        onClick={() => setShowTemplates(false)}
                      >
                        Use This Template
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/builder"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2"
                  onClick={() => setShowTemplates(false)}
                >
                  Start Building Your Resume <FiArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </TemplatesModalContext.Provider>
  );
}

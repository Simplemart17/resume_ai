'use client';

import { useState } from 'react';
import type { Education } from '@/types/resume';

interface EducationEditorProps {
  education: Education[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Education, value: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

export function EducationEditor({ education, onAdd, onUpdate, onRemove, onMove }: EducationEditorProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center gap-4 mb-4">
        <h3 className="eyebrow eyebrow-rule flex-1">
          <span>Education</span>
        </h3>
        <button onClick={onAdd} className="btn-ghost px-3.5 py-2 text-sm shrink-0">
          <span aria-hidden="true" className="font-mono">+</span> Add education
        </button>
      </div>

      {education.length === 0 && (
        <button
          type="button"
          onClick={onAdd}
          className="w-full rounded-[3px] border border-dashed border-rule bg-bench/40 px-5 py-6 text-left transition-colors hover:border-pen hover:bg-pen-wash/30"
        >
          <p className="font-mono text-xs text-pen mb-1">+ add a school</p>
          <p className="text-sm text-ink-soft">Degree, field, and year — optional, but it rounds out the page.</p>
        </button>
      )}

      {education.map((edu, index) => {
        const isCollapsed = collapsed.has(edu.id);
        return (
          <div key={edu.id} className="paper-hover border border-rule rounded-[3px] p-5 mb-4 bg-paper">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => toggle(edu.id)}
                aria-expanded={!isCollapsed}
                className="flex min-w-0 items-center gap-2.5 text-left"
              >
                <span className="index-token">{String(index + 1).padStart(2, '0')}</span>
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft truncate">
                  {isCollapsed ? edu.institution || edu.degree || `Education ${index + 1}` : `Education ${index + 1}`}
                </span>
                <span aria-hidden="true" className="font-mono text-xs text-ink-soft">{isCollapsed ? '▸' : '▾'}</span>
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onMove(edu.id, 'up')}
                  disabled={index === 0}
                  aria-label="Move education up"
                  className="font-mono text-sm px-1.5 py-0.5 rounded-[2px] text-ink-soft hover:text-pen disabled:opacity-30 disabled:hover:text-ink-soft transition-colors"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMove(edu.id, 'down')}
                  disabled={index === education.length - 1}
                  aria-label="Move education down"
                  className="font-mono text-sm px-1.5 py-0.5 rounded-[2px] text-ink-soft hover:text-pen disabled:opacity-30 disabled:hover:text-ink-soft transition-colors"
                >
                  ↓
                </button>
                <button
                  onClick={() => onRemove(edu.id)}
                  aria-label="Remove education"
                  className="ml-1 text-sm font-medium text-fail hover:underline transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>

            {isCollapsed ? (
              <p className="mt-3 text-sm text-ink-soft truncate">
                {[edu.degree && `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`, edu.endDate]
                  .filter(Boolean)
                  .join(' · ') || 'Untitled — click to edit'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor={`edu-${edu.id}-institution`} className="eyebrow block mb-1.5">Institution</label>
                  <input
                    id={`edu-${edu.id}-institution`}
                    type="text"
                    value={edu.institution}
                    onChange={(e) => onUpdate(edu.id, 'institution', e.target.value)}
                    className="input-flat px-3.5 py-2.5 text-sm w-full"
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <label htmlFor={`edu-${edu.id}-degree`} className="eyebrow block mb-1.5">Degree</label>
                  <input
                    id={`edu-${edu.id}-degree`}
                    type="text"
                    value={edu.degree}
                    onChange={(e) => onUpdate(edu.id, 'degree', e.target.value)}
                    className="input-flat px-3.5 py-2.5 text-sm w-full"
                    placeholder="Bachelor of Science"
                  />
                </div>
                <div>
                  <label htmlFor={`edu-${edu.id}-field`} className="eyebrow block mb-1.5">Field of study</label>
                  <input
                    id={`edu-${edu.id}-field`}
                    type="text"
                    value={edu.field}
                    onChange={(e) => onUpdate(edu.id, 'field', e.target.value)}
                    className="input-flat px-3.5 py-2.5 text-sm w-full"
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label htmlFor={`edu-${edu.id}-end-date`} className="eyebrow block mb-1.5">Graduation year</label>
                  <input
                    id={`edu-${edu.id}-end-date`}
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => onUpdate(edu.id, 'endDate', e.target.value)}
                    className="input-flat px-3.5 py-2.5 text-sm w-full"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

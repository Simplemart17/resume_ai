'use client';

import { useState } from 'react';
import type { Experience } from '@/types/resume';

interface ExperienceEditorProps {
  experience: Experience[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Experience, value: string | boolean) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

export function ExperienceEditor({ experience, onAdd, onUpdate, onRemove, onMove }: ExperienceEditorProps) {
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
          <span>Experience</span>
        </h3>
        <button onClick={onAdd} className="btn-ghost px-3.5 py-2 text-sm shrink-0">
          <span aria-hidden="true" className="font-mono">+</span> Add experience
        </button>
      </div>

      {experience.length === 0 && (
        <button
          type="button"
          onClick={onAdd}
          className="w-full rounded-[3px] border border-dashed border-rule bg-bench/40 px-5 py-6 text-left transition-colors hover:border-pen hover:bg-pen-wash/30"
        >
          <p className="font-mono text-xs text-pen mb-1">+ add your first role</p>
          <p className="text-sm text-ink-soft">
            It typesets onto the sheet on the right as you fill it in.
          </p>
        </button>
      )}

      {experience.map((exp, index) => {
        const isCollapsed = collapsed.has(exp.id);
        return (
          <div key={exp.id} className="paper-hover border border-rule rounded-[3px] p-5 mb-4 bg-paper">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => toggle(exp.id)}
                aria-expanded={!isCollapsed}
                className="flex min-w-0 items-center gap-2.5 text-left"
              >
                <span className="index-token">{String(index + 1).padStart(2, '0')}</span>
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft truncate">
                  {isCollapsed ? exp.position || exp.company || `Experience ${index + 1}` : `Experience ${index + 1}`}
                </span>
                <span aria-hidden="true" className="font-mono text-xs text-ink-soft">{isCollapsed ? '▸' : '▾'}</span>
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onMove(exp.id, 'up')}
                  disabled={index === 0}
                  aria-label="Move experience up"
                  className="font-mono text-sm px-1.5 py-0.5 rounded-[2px] text-ink-soft hover:text-pen disabled:opacity-30 disabled:hover:text-ink-soft transition-colors"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMove(exp.id, 'down')}
                  disabled={index === experience.length - 1}
                  aria-label="Move experience down"
                  className="font-mono text-sm px-1.5 py-0.5 rounded-[2px] text-ink-soft hover:text-pen disabled:opacity-30 disabled:hover:text-ink-soft transition-colors"
                >
                  ↓
                </button>
                <button
                  onClick={() => onRemove(exp.id)}
                  aria-label="Remove experience"
                  className="ml-1 text-sm font-medium text-fail hover:underline transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>

            {isCollapsed ? (
              <p className="mt-3 text-sm text-ink-soft truncate">
                {[exp.company, exp.startDate && `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate || '…'}`]
                  .filter(Boolean)
                  .join(' · ') || 'Untitled role — click to edit'}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">
                  <div>
                    <label htmlFor={`exp-${exp.id}-position`} className="eyebrow block mb-1.5">Job title</label>
                    <input
                      id={`exp-${exp.id}-position`}
                      type="text"
                      value={exp.position}
                      onChange={(e) => onUpdate(exp.id, 'position', e.target.value)}
                      className="input-flat px-3.5 py-2.5 text-sm w-full"
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <label htmlFor={`exp-${exp.id}-company`} className="eyebrow block mb-1.5">Company</label>
                    <input
                      id={`exp-${exp.id}-company`}
                      type="text"
                      value={exp.company}
                      onChange={(e) => onUpdate(exp.id, 'company', e.target.value)}
                      className="input-flat px-3.5 py-2.5 text-sm w-full"
                      placeholder="Tech Company Inc."
                    />
                  </div>
                  <div>
                    <label htmlFor={`exp-${exp.id}-start-date`} className="eyebrow block mb-1.5">Start date</label>
                    <input
                      id={`exp-${exp.id}-start-date`}
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => onUpdate(exp.id, 'startDate', e.target.value)}
                      className="input-flat px-3.5 py-2.5 text-sm w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor={`exp-${exp.id}-end-date`} className="eyebrow block mb-1.5">End date</label>
                    <input
                      id={`exp-${exp.id}-end-date`}
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => onUpdate(exp.id, 'endDate', e.target.value)}
                      disabled={exp.current}
                      className="input-flat px-3.5 py-2.5 text-sm w-full disabled:bg-bench disabled:text-ink-soft"
                    />
                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => onUpdate(exp.id, 'current', e.target.checked)}
                        className="mr-2 accent-pen"
                      />
                      <span className="text-sm text-ink-soft">Currently working here</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor={`exp-${exp.id}-description`} className="eyebrow block mb-1.5">Description</label>
                  <textarea
                    id={`exp-${exp.id}-description`}
                    value={exp.description}
                    onChange={(e) => onUpdate(exp.id, 'description', e.target.value)}
                    rows={3}
                    className="input-flat px-3.5 py-2.5 text-sm w-full"
                    placeholder="Describe your responsibilities and achievements..."
                  />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

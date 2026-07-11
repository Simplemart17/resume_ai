'use client';

import { FiPlus, FiTrash2 } from 'react-icons/fi';
import type { Experience } from '@/types/resume';

interface ExperienceEditorProps {
  experience: Experience[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Experience, value: string | boolean) => void;
  onRemove: (id: string) => void;
}

export function ExperienceEditor({ experience, onAdd, onUpdate, onRemove }: ExperienceEditorProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
        <button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {experience.map((exp, index) => (
        <div key={exp.id} className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
            <button
              onClick={() => onRemove(exp.id)}
              aria-label="Remove experience"
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor={`exp-${exp.id}-position`} className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                id={`exp-${exp.id}-position`}
                type="text"
                value={exp.position}
                onChange={(e) => onUpdate(exp.id, 'position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label htmlFor={`exp-${exp.id}-company`} className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                id={`exp-${exp.id}-company`}
                type="text"
                value={exp.company}
                onChange={(e) => onUpdate(exp.id, 'company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tech Company Inc."
              />
            </div>
            <div>
              <label htmlFor={`exp-${exp.id}-start-date`} className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                id={`exp-${exp.id}-start-date`}
                type="month"
                value={exp.startDate}
                onChange={(e) => onUpdate(exp.id, 'startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor={`exp-${exp.id}-end-date`} className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                id={`exp-${exp.id}-end-date`}
                type="month"
                value={exp.endDate}
                onChange={(e) => onUpdate(exp.id, 'endDate', e.target.value)}
                disabled={exp.current}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => onUpdate(exp.id, 'current', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Currently working here</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor={`exp-${exp.id}-description`} className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id={`exp-${exp.id}-description`}
              value={exp.description}
              onChange={(e) => onUpdate(exp.id, 'description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>
        </div>
      ))}
    </div>
  );
}

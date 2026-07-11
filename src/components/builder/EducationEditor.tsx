'use client';

import { FiPlus, FiTrash2 } from 'react-icons/fi';
import type { Education } from '@/types/resume';

interface EducationEditorProps {
  education: Education[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Education, value: string) => void;
  onRemove: (id: string) => void;
}

export function EducationEditor({ education, onAdd, onUpdate, onRemove }: EducationEditorProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Education</h3>
        <button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      {education.map((edu, index) => (
        <div key={edu.id} className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
            <button
              onClick={() => onRemove(edu.id)}
              aria-label="Remove education"
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`edu-${edu.id}-institution`} className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
              <input
                id={`edu-${edu.id}-institution`}
                type="text"
                value={edu.institution}
                onChange={(e) => onUpdate(edu.id, 'institution', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="University Name"
              />
            </div>
            <div>
              <label htmlFor={`edu-${edu.id}-degree`} className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
              <input
                id={`edu-${edu.id}-degree`}
                type="text"
                value={edu.degree}
                onChange={(e) => onUpdate(edu.id, 'degree', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bachelor of Science"
              />
            </div>
            <div>
              <label htmlFor={`edu-${edu.id}-field`} className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
              <input
                id={`edu-${edu.id}-field`}
                type="text"
                value={edu.field}
                onChange={(e) => onUpdate(edu.id, 'field', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label htmlFor={`edu-${edu.id}-end-date`} className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
              <input
                id={`edu-${edu.id}-end-date`}
                type="month"
                value={edu.endDate}
                onChange={(e) => onUpdate(edu.id, 'endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

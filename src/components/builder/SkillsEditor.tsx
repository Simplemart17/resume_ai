'use client';

import { FiTrash2 } from 'react-icons/fi';

interface SkillsEditorProps {
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
}

export function SkillsEditor({ skills, onAdd, onRemove }: SkillsEditorProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Add a skill and press Enter"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAdd(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {skill}
            <button
              onClick={() => onRemove(skill)}
              aria-label={`Remove skill ${skill}`}
              className="text-blue-600 hover:text-blue-800"
            >
              <FiTrash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

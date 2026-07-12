'use client';

interface SkillsEditorProps {
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
}

export function SkillsEditor({ skills, onAdd, onRemove }: SkillsEditorProps) {
  return (
    <div>
      <h3 className="eyebrow eyebrow-rule mb-4">
        <span>Skills</span>
      </h3>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Add a skill and press Enter"
          className="input-flat px-3.5 py-2.5 text-sm w-full"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAdd(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="group bg-pen-wash text-pen font-mono text-xs pl-2.5 pr-1.5 py-1 rounded-full inline-flex items-center gap-1.5"
            >
              {skill}
              <button
                onClick={() => onRemove(skill)}
                aria-label={`Remove skill ${skill}`}
                className="leading-none text-pen/60 hover:text-fail transition-colors text-sm"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="font-mono text-xs text-ink-soft">
          No skills yet — the parser weighs these heavily. Add the ones the job asks for.
        </p>
      )}
    </div>
  );
}

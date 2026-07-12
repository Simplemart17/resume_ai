'use client';

interface SummaryEditorProps {
  summary: string;
  onChange: (value: string) => void;
}

export function SummaryEditor({ summary, onChange }: SummaryEditorProps) {
  return (
    <div className="mb-8">
      <h3 className="eyebrow eyebrow-rule mb-4">
        <span>Summary</span>
      </h3>
      <textarea
        value={summary}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="input-flat px-3.5 py-2.5 text-sm w-full"
        placeholder="Write a brief summary of your professional background and key achievements..."
      />
    </div>
  );
}

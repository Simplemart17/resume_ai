'use client';

interface SummaryEditorProps {
  summary: string;
  onChange: (value: string) => void;
}

export function SummaryEditor({ summary, onChange }: SummaryEditorProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
      <textarea
        value={summary}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Write a brief summary of your professional background and key achievements..."
      />
    </div>
  );
}

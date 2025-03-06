'use client';

import { useState } from 'react';

export function ResumeFormatter() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [formattedResume, setFormattedResume] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Implement AI formatting logic here
      const response = await fetch('/api/format-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume, jobDescription }),
      });
      
      const data = await response.json();
      setFormattedResume(data.formattedResume);
    } catch (error) {
      console.error('Error formatting resume:', error);
      alert('Error formatting resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
            Your Resume
          </label>
          <textarea
            id="resume"
            name="resume"
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Paste your current resume here..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
            Job Description
          </label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Formatting...' : 'Format Resume'}
          </button>
        </div>
      </form>

      {formattedResume && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Formatted Resume</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="whitespace-pre-wrap">{formattedResume}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 
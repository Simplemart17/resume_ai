'use client';

import { useState } from 'react';
import { FileUploader } from './FileUploader';

export function ResumeFormatter() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [formattedResume, setFormattedResume] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (file: File | null) => {
    setResumeFile(file);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!resumeFile) {
        throw new Error('Please upload a resume file');
      }

      // First, upload the file and get the text content
      const formData = new FormData();
      formData.append('file', resumeFile);
      
      const uploadResponse = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to process resume file');
      }
      
      const { text } = await uploadResponse.json();
      
      // Now format the resume
      const formatResponse = await fetch('/api/format-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume: text, jobDescription }),
      });
      
      if (!formatResponse.ok) {
        throw new Error('Failed to format resume');
      }

      const data = await formatResponse.json();
      setFormattedResume(data.formattedResume);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Resume
          </label>
          <FileUploader
            onFileSelect={handleFileChange}
            selectedFile={resumeFile}
            accept=".pdf,.doc,.docx,.txt"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
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
            disabled={loading || !resumeFile}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Format Resume'}
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
'use client';

import { useState } from 'react';
import { FileUploader } from './FileUploader';
import { JobApplicationFiller } from './JobApplicationFiller';
import { PageHeader } from './PageHeader';
import toast from 'react-hot-toast';
import { RESUME_ACCEPT } from '@/config/uploads';

// Intentionally separate from ResumeData (see CLAUDE.md): this mirrors the
// parts of the parse-resume API response that this page actually renders.
interface ExtractedData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
  };
  summary: string;
  skills: string[];
}

export function AutoFillApp() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async (file: File | null) => {
    setResumeFile(file);
    if (file) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/parse-resume', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          // Surface the server's guidance (e.g. "convert .doc to .docx")
          // instead of a blanket generic message
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || 'Failed to extract resume data. Please try again.');
        }

        const data = await response.json();

        // Keep the raw parsed text for downstream consumers (e.g. JobApplicationFiller)
        setResumeText(data.text || '');

        // Transform the parsed data into the format we need
        setExtractedData({
          personalInfo: data.structured?.personalInfo || {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            website: '',
            linkedin: ''
          },
          summary: data.structured?.summary || '',
          skills: data.structured?.skills || []
        });

        toast.success('Resume data extracted successfully!');
      } catch (error) {
        console.error('Error parsing resume:', error);
        toast.error(
          error instanceof Error ? error.message : 'Failed to extract resume data. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Auto-fill"
          title="Auto-fill assistant"
          sub="Extract your resume details once and copy them into any job application with one click."
          strip={{ token: 'autofill', text: 'extract once · paste anywhere · nothing is submitted for you' }}
        />

        {/* Upload — a document intake, not a form. */}
        {!extractedData && (
          <div className="max-w-2xl mx-auto">
            <div className="paper overflow-hidden">
              <div className="p-8">
                <p className="eyebrow eyebrow-rule mb-4"><span>Upload your résumé</span></p>
                <FileUploader
                  onFileSelect={handleFileSelect}
                  selectedFile={resumeFile}
                  accept={RESUME_ACCEPT}
                />
              </div>
              <div className="machine-strip">
                <span className="machine-token">[parse]</span>
                {loading ? (
                  <>
                    <span>reading name · email · skills…</span>
                    <span className="machine-caret text-pen">▍</span>
                  </>
                ) : (
                  <span>drop a file to read its fields</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* One canonical field manifest, fed by the structured parse. */}
        {extractedData && (
          <div className="space-y-8">
            <JobApplicationFiller
              resumeText={resumeText}
              structuredData={{
                personalInfo: extractedData.personalInfo,
                skills: extractedData.skills,
                summary: extractedData.summary,
              }}
            />

            <div className="text-center">
              <button
                onClick={() => {
                  setExtractedData(null);
                  setResumeText('');
                  setResumeFile(null);
                }}
                className="btn-ghost px-6 py-3"
              >
                Upload a different résumé
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiUser } from 'react-icons/fi';
import { FileUploader } from './FileUploader';
import { JobApplicationFiller } from './JobApplicationFiller';
import { CopyButton } from './CopyButton';
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
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Auto-Fill Assistant
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Extract your resume details once and copy them into any job application with one click
            </p>
          </motion.div>
        </div>

        {/* Upload Section */}
        {!extractedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
                <FiUpload className="w-6 h-6 text-blue-600" />
                Upload Your Resume
              </h2>
              <FileUploader
                onFileSelect={handleFileSelect}
                selectedFile={resumeFile}
                accept={RESUME_ACCEPT}
              />
              {loading && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-600 bg-blue-100">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Extracting data...
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Extracted Data Display */}
        {extractedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-blue-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extractedData.personalInfo.fullName && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-gray-900">{extractedData.personalInfo.fullName}</p>
                    </div>
                    <CopyButton text={extractedData.personalInfo.fullName} label="Full Name" className="ml-2" />
                  </div>
                )}
                
                {extractedData.personalInfo.email && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{extractedData.personalInfo.email}</p>
                    </div>
                    <CopyButton text={extractedData.personalInfo.email} label="Email" className="ml-2" />
                  </div>
                )}
                
                {extractedData.personalInfo.phone && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{extractedData.personalInfo.phone}</p>
                    </div>
                    <CopyButton text={extractedData.personalInfo.phone} label="Phone" className="ml-2" />
                  </div>
                )}
                
                {extractedData.personalInfo.location && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-900">{extractedData.personalInfo.location}</p>
                    </div>
                    <CopyButton text={extractedData.personalInfo.location} label="Location" className="ml-2" />
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {extractedData.skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {extractedData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <CopyButton text={extractedData.skills.join(', ')} label="Skills" />
              </div>
            )}

            {/* Summary */}
            {extractedData.summary && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Summary</h3>
                <div className="flex justify-between items-start">
                  <p className="text-gray-700 flex-1">{extractedData.summary}</p>
                  <CopyButton text={extractedData.summary} label="Summary" className="ml-2" />
                </div>
              </div>
            )}

            {/* Job Application Filler */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <JobApplicationFiller resumeText={resumeText} structuredData={extractedData} />
            </div>

            {/* Reset Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setExtractedData(null);
                  setResumeText('');
                  setResumeFile(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Upload Different Resume
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiCopy, FiCheck, FiUser } from 'react-icons/fi';
import { FileUploader } from './FileUploader';
import { JobApplicationFiller } from './JobApplicationFiller';
import toast, { Toaster } from 'react-hot-toast';

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
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
  }>;
  skills: string[];
}

export function AutoFillApp() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
          throw new Error('Failed to parse resume');
        }
        
        const data = await response.json();
        
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
          experience: data.structured?.experience || [],
          education: data.structured?.education || [],
          skills: data.structured?.skills || []
        });
        
        toast.success('Resume data extracted successfully!');
      } catch (error) {
        console.error('Error parsing resume:', error);
        toast.error('Failed to extract resume data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <button
      onClick={() => copyToClipboard(text, fieldName)}
      className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
      title={`Copy ${fieldName}`}
    >
      {copiedField === fieldName ? (
        <FiCheck className="w-4 h-4 text-green-600" />
      ) : (
        <FiCopy className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Job Application Auto-Fill
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Extract information from your resume to quickly fill job application forms
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
                accept=".pdf,.doc,.docx,.txt"
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
                    <CopyButton text={extractedData.personalInfo.fullName} fieldName="Full Name" />
                  </div>
                )}
                
                {extractedData.personalInfo.email && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{extractedData.personalInfo.email}</p>
                    </div>
                    <CopyButton text={extractedData.personalInfo.email} fieldName="Email" />
                  </div>
                )}
                
                {extractedData.personalInfo.phone && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{extractedData.personalInfo.phone}</p>
                    </div>
                    <CopyButton text={extractedData.personalInfo.phone} fieldName="Phone" />
                  </div>
                )}
                
                {extractedData.personalInfo.location && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-900">{extractedData.personalInfo.location}</p>
                    </div>
                    <CopyButton text={extractedData.personalInfo.location} fieldName="Location" />
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
                <CopyButton text={extractedData.skills.join(', ')} fieldName="Skills" />
              </div>
            )}

            {/* Summary */}
            {extractedData.summary && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Summary</h3>
                <div className="flex justify-between items-start">
                  <p className="text-gray-700 flex-1">{extractedData.summary}</p>
                  <CopyButton text={extractedData.summary} fieldName="Summary" />
                </div>
              </div>
            )}

            {/* Job Application Filler */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <JobApplicationFiller resumeText={JSON.stringify(extractedData)} />
            </div>

            {/* Reset Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setExtractedData(null);
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

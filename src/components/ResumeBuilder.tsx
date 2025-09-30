'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFileText, FiEye, FiSettings, FiUser, FiPlus, FiTrash2, FiEdit3 } from 'react-icons/fi';
import { FileUploader } from './FileUploader';
import { ApiKeyManager } from './ApiKeyManager';
import { NewResumeTemplates } from './NewResumeTemplates';
import { apiKeyManager } from '@/utils/apiKeyManager';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';



interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState<'upload' | 'build' | 'templates' | 'preview'>('upload');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  // Resume builder state
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: []
  });

  useEffect(() => {
    setHasApiKey(apiKeyManager.hasApiKey());
  }, []);

  const tabs = [
    { id: 'upload', label: 'Upload Resume', icon: <FiUpload className="w-5 h-5" /> },
    { id: 'build', label: 'Build Resume', icon: <FiEdit3 className="w-5 h-5" /> },
    { id: 'templates', label: 'Templates', icon: <FiFileText className="w-5 h-5" /> },
    { id: 'preview', label: 'Preview', icon: <FiEye className="w-5 h-5" /> }
  ];

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
        setResumeText(data.text);

        // Try to parse structured data if available
        if (data.structured) {
          setResumeData(data.structured);
        }

        toast.success('Resume uploaded and parsed successfully!');
      } catch (error) {
        console.error('Error parsing resume:', error);
        toast.error('Failed to parse resume. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean | string[]) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Resume Builder
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create, optimize, and download professional resumes with our AI-powered platform
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-2 flex gap-2">
            <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
              Resume Builder
            </div>
            <Link
              href="/optimize"
              className="px-4 py-2 text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
            >
              AI Optimizer
            </Link>
            <Link
              href="/autofill"
              className="px-4 py-2 text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
            >
              Auto-Fill
            </Link>
          </div>
        </div>

        {/* API Key Manager */}
        {!hasApiKey && (
          <div className="mb-8">
            <ApiKeyManager onApiKeySet={() => setHasApiKey(true)} />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'upload' | 'build' | 'templates' | 'preview')}
                  className={`${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                      Upload Your Existing Resume
                    </h2>
                    <FileUploader
                      onFileSelect={handleFileSelect}
                      selectedFile={resumeFile}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    {loading && (
                      <div className="mt-4 text-center">
                        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-600 bg-blue-100">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Parsing resume...
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'build' && (
                <motion.div
                  key="build"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                      Build Your Resume
                    </h2>

                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FiUser className="w-5 h-5" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={resumeData.personalInfo.fullName}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={resumeData.personalInfo.email}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, email: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={resumeData.personalInfo.phone}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, phone: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input
                            type="text"
                            value={resumeData.personalInfo.location}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, location: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="New York, NY"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Professional Summary */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
                      <textarea
                        value={resumeData.summary}
                        onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Write a brief summary of your professional background and key achievements..."
                      />
                    </div>

                    {/* Experience Section */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                        <button
                          onClick={addExperience}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <FiPlus className="w-4 h-4" />
                          Add Experience
                        </button>
                      </div>

                      {resumeData.experience.map((exp, index) => (
                        <div key={exp.id} className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
                            <button
                              onClick={() => removeExperience(exp.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                              <input
                                type="text"
                                value={exp.position}
                                onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Software Engineer"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tech Company Inc."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                              <input
                                type="month"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                              <input
                                type="month"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                disabled={exp.current}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                              />
                              <label className="flex items-center mt-2">
                                <input
                                  type="checkbox"
                                  checked={exp.current}
                                  onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-600">Currently working here</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              value={exp.description}
                              onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Describe your responsibilities and achievements..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Education Section */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                        <button
                          onClick={addEducation}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <FiPlus className="w-4 h-4" />
                          Add Education
                        </button>
                      </div>

                      {resumeData.education.map((edu, index) => (
                        <div key={edu.id} className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
                            <button
                              onClick={() => removeEducation(edu.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                              <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="University Name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Bachelor of Science"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                              <input
                                type="text"
                                value={edu.field}
                                onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Computer Science"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                              <input
                                type="month"
                                value={edu.endDate}
                                onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Skills Section */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Add a skill and press Enter"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addSkill(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'templates' && (
                <motion.div
                  key="templates"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <NewResumeTemplates
                    resumeText={resumeText}
                    resumeData={resumeData}
                    onTemplateSelect={setSelectedTemplate}
                    selectedTemplate={selectedTemplate}
                  />
                </motion.div>
              )}

              {activeTab === 'preview' && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                      Resume Preview
                    </h2>

                    {resumeData.personalInfo.fullName || resumeText ? (
                      <div className="bg-white rounded-xl shadow-lg p-8 border">
                        <div className="prose max-w-none">
                          {resumeData.personalInfo.fullName ? (
                            <div>
                              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {resumeData.personalInfo.fullName}
                              </h1>
                              <div className="text-gray-600 mb-6">
                                {[
                                  resumeData.personalInfo.email,
                                  resumeData.personalInfo.phone,
                                  resumeData.personalInfo.location
                                ].filter(Boolean).join(' | ')}
                              </div>

                              {resumeData.summary && (
                                <div className="mb-6">
                                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Professional Summary</h2>
                                  <p className="text-gray-700">{resumeData.summary}</p>
                                </div>
                              )}

                              {resumeData.experience.length > 0 && (
                                <div className="mb-6">
                                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Experience</h2>
                                  {resumeData.experience.map((exp, index) => (
                                    <div key={index} className="mb-4">
                                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                                      <p className="text-gray-600">{exp.company}</p>
                                      <p className="text-sm text-gray-500 mb-2">
                                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                      </p>
                                      {exp.description && <p className="text-gray-700">{exp.description}</p>}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {resumeData.education.length > 0 && (
                                <div className="mb-6">
                                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Education</h2>
                                  {resumeData.education.map((edu, index) => (
                                    <div key={index} className="mb-3">
                                      <h3 className="font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                                      <p className="text-gray-600">{edu.institution}</p>
                                      <p className="text-sm text-gray-500">{edu.endDate}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {resumeData.skills.length > 0 && (
                                <div>
                                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Skills</h2>
                                  <div className="flex flex-wrap gap-2">
                                    {resumeData.skills.map((skill, index) => (
                                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap text-gray-700">{resumeText}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <FiFileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Resume Content
                        </h3>
                        <p className="text-gray-600">
                          Upload a resume or build one to see the preview here.
                        </p>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="mt-8 flex justify-center gap-4">
                      <Link
                        href="/optimize"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                      >
                        <FiSettings className="w-4 h-4" />
                        AI Optimize
                      </Link>
                      <Link
                        href="/autofill"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                      >
                        <FiEdit3 className="w-4 h-4" />
                        Auto-Fill Jobs
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

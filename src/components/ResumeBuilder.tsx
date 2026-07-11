'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFileText, FiEye, FiEdit3 } from 'react-icons/fi';
import { ApiKeyManager } from './ApiKeyManager';
import { NewResumeTemplates } from './NewResumeTemplates';
import toast from 'react-hot-toast';
import type { ResumeData, Experience, Education, PersonalInfo } from '@/types/resume';
import { mapParsedResume } from './builder/mapParsedResume';
import { UploadTab } from './builder/UploadTab';
import { PersonalInfoForm } from './builder/PersonalInfoForm';
import { SummaryEditor } from './builder/SummaryEditor';
import { ExperienceEditor } from './builder/ExperienceEditor';
import { EducationEditor } from './builder/EducationEditor';
import { SkillsEditor } from './builder/SkillsEditor';
import { ResumePreview } from './builder/ResumePreview';

export function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState<'upload' | 'build' | 'templates' | 'preview'>('upload');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  // No reader on this page yet — ApiKeyManager reports key status via the setter
  const [, setHasApiKey] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern-professional');

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
          setResumeData(mapParsedResume(data.structured));
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

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateSummary = (value: string) => {
    setResumeData(prev => ({ ...prev, summary: value }));
  };

  const addExperience = () => {
    const newExperience: Experience = {
      id: crypto.randomUUID(),
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

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
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
      id: crypto.randomUUID(),
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

        {/* API Key Manager */}
        <div className="mb-8">
          <ApiKeyManager onApiKeySet={setHasApiKey} />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
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
                  <UploadTab
                    onFileSelect={handleFileSelect}
                    selectedFile={resumeFile}
                    loading={loading}
                  />
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

                    <PersonalInfoForm
                      personalInfo={resumeData.personalInfo}
                      onFieldChange={updatePersonalInfo}
                    />

                    <SummaryEditor
                      summary={resumeData.summary}
                      onChange={updateSummary}
                    />

                    <ExperienceEditor
                      experience={resumeData.experience}
                      onAdd={addExperience}
                      onUpdate={updateExperience}
                      onRemove={removeExperience}
                    />

                    <EducationEditor
                      education={resumeData.education}
                      onAdd={addEducation}
                      onUpdate={updateEducation}
                      onRemove={removeEducation}
                    />

                    <SkillsEditor
                      skills={resumeData.skills}
                      onAdd={addSkill}
                      onRemove={removeSkill}
                    />
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
                  <ResumePreview resumeData={resumeData} resumeText={resumeText} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { TEMPLATE_IDS_ALL } from '@/lib/tiers';
import { NewResumeTemplates } from './NewResumeTemplates';
import toast from 'react-hot-toast';
import type { ResumeData, Experience, Education, PersonalInfo } from '@/types/resume';
import { mapParsedResume } from './builder/mapParsedResume';
import { PageHeader } from './PageHeader';
import { UploadTab } from './builder/UploadTab';
import { PersonalInfoForm } from './builder/PersonalInfoForm';
import { SummaryEditor } from './builder/SummaryEditor';
import { ExperienceEditor } from './builder/ExperienceEditor';
import { EducationEditor } from './builder/EducationEditor';
import { SkillsEditor } from './builder/SkillsEditor';
import { ResumePreview, ResumeSheet } from './builder/ResumePreview';

export function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState<'upload' | 'build' | 'templates' | 'preview'>('upload');
  // Quick-peek preview drawer for tablet/mobile (below lg, where the rail is hidden).
  const [previewOpen, setPreviewOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern-professional');

  // Carry a template choice made on the landing page (/builder?template=id)
  // into the builder so picking a specific layout isn't a dead end.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('template');
    if (requested && TEMPLATE_IDS_ALL.includes(requested)) {
      setSelectedTemplate(requested);
      setActiveTab('templates');
    }
  }, []);

  // Preview drawer: Escape to close + lock body scroll while open.
  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPreviewOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [previewOpen]);

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

  // On lg+ the sheet is always visible in the side rail, so the Preview tab
  // only exists on smaller screens (mobileOnly → lg:hidden).
  const tabs = [
    { id: 'upload', label: 'Upload', mobileOnly: false },
    { id: 'build', label: 'Build', mobileOnly: false },
    { id: 'templates', label: 'Templates', mobileOnly: false },
    { id: 'preview', label: 'Preview', mobileOnly: true }
  ];

  // The bench layout: form on the left, the live sheet on the right. The
  // templates tab needs the full width for its card grid, so the rail steps
  // aside there (the cards preview themselves).
  const showRail = activeTab === 'upload' || activeTab === 'build';

  // How much of the sheet is set — feeds the Build tab readout.
  const setSections = [
    resumeData.personalInfo.fullName,
    resumeData.summary,
    resumeData.experience.length > 0,
    resumeData.education.length > 0,
    resumeData.skills.length > 0,
  ].filter(Boolean).length;
  const hasContent = Boolean(resumeData.personalInfo.fullName || resumeText);

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
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || 'Failed to parse resume');
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

  const moveExperience = (id: string, direction: 'up' | 'down') => {
    setResumeData(prev => {
      const arr = [...prev.experience];
      const i = arr.findIndex(exp => exp.id === id);
      const j = direction === 'up' ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= arr.length) return prev;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...prev, experience: arr };
    });
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

  const moveEducation = (id: string, direction: 'up' | 'down') => {
    setResumeData(prev => {
      const arr = [...prev.education];
      const i = arr.findIndex(edu => edu.id === id);
      const j = direction === 'up' ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= arr.length) return prev;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...prev, education: arr };
    });
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
        <PageHeader
          eyebrow="Builder"
          title="Build your resume"
          sub="Upload an existing resume or start from a blank page — the sheet typesets itself as you work."
          strip={{ token: 'builder', text: 'upload · edit · pick a template · export the pdf' }}
        />

        {/* The bench: work surface left, live sheet right (lg+). */}
        <div
          className={
            showRail ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8 lg:items-start' : ''
          }
        >
        <div className="paper mb-8 overflow-hidden lg:mb-0">
          <div className="border-b border-rule">
            <nav className="flex gap-4 sm:gap-8 px-6 overflow-x-auto" aria-label="Tabs" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id as 'upload' | 'build' | 'templates' | 'preview')}
                  className={`${activeTab === tab.id
                    ? 'border-pen text-pen'
                    : 'border-transparent text-ink-soft hover:text-ink'
                    } ${tab.mobileOnly ? 'lg:hidden' : ''} whitespace-nowrap py-4 px-1 border-b-2 font-mono text-xs font-medium uppercase tracking-[0.14em] flex items-center gap-2 transition-colors`}
                >
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="machine-strip mb-8 rounded-[3px] border border-rule">
                      <span className="machine-token">[draft]</span>
                      <span className="tabular-nums">{setSections}/5</span>
                      <span>sections set</span>
                      <span>·</span>
                      <span>{resumeData.skills.length} skill{resumeData.skills.length === 1 ? '' : 's'}</span>
                      <span className="machine-caret text-pen">▍</span>
                    </div>

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
                      onMove={moveExperience}
                    />

                    <EducationEditor
                      education={resumeData.education}
                      onAdd={addEducation}
                      onUpdate={updateEducation}
                      onRemove={removeEducation}
                      onMove={moveEducation}
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="lg:hidden"
                >
                  <ResumePreview resumeData={resumeData} resumeText={resumeText} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Live preview rail: the sheet updates as you type. */}
        {showRail && (
          <aside
            className="hidden lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
            aria-label="Live resume preview"
          >
            <p className="eyebrow eyebrow-rule mb-3">
              <span>Live preview</span>
            </p>
            <ResumeSheet resumeData={resumeData} resumeText={resumeText} compact />

            {/* The finished document's obvious next steps — surfaced here so
                users don't have to hunt through tabs to export or optimize. */}
            {hasContent && (
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab('templates')}
                  className="btn-pen w-full px-4 py-2.5 text-sm"
                >
                  Pick a template &amp; export <span aria-hidden="true">→</span>
                </button>
                <Link href="/optimize" className="btn-ghost w-full px-4 py-2.5 text-sm">
                  Score against a job
                </Link>
              </div>
            )}
          </aside>
        )}
        </div>
      </div>

      {/* Quick-peek preview — tablet/mobile only (the rail is hidden below lg). */}
      {showRail && hasContent && !previewOpen && (
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="lg:hidden fixed bottom-5 right-5 z-40 btn-pen px-5 py-3 text-sm shadow-[0_10px_30px_-10px_rgb(75_65_214/0.6)]"
        >
          Preview
        </button>
      )}
      {previewOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-ink/40 animate-modal-overlay"
          onClick={() => setPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Live resume preview"
        >
          <div
            className="bg-bench rounded-t-[3px] max-h-[85vh] overflow-y-auto p-4 animate-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="eyebrow">Live preview</p>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                aria-label="Close preview"
                className="text-ink-soft hover:text-ink text-2xl leading-none transition-colors"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <ResumeSheet resumeData={resumeData} resumeText={resumeText} compact />
          </div>
        </div>
      )}
    </div>
  );
}

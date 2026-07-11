'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiEye, FiCheck, FiUpload, FiFileText } from 'react-icons/fi';
import { NewPDFGenerator } from '@/utils/newPdfGenerator';
import { TemplatePreview } from './TemplatePreview';
import { TEMPLATES } from '@/config/templates';
import toast from 'react-hot-toast';
import type { ResumeData } from '@/types/resume';

const EMPTY_RESUME_DATA: ResumeData = {
  personalInfo: { fullName: '', email: '', phone: '', location: '', website: '', linkedin: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
};

interface NewResumeTemplatesProps {
  resumeText: string;
  resumeData?: ResumeData;
  onTemplateSelect?: (templateId: string) => void;
  selectedTemplate?: string;
}

export function NewResumeTemplates({
  resumeText,
  resumeData = EMPTY_RESUME_DATA,
  onTemplateSelect,
  selectedTemplate = 'modern-professional'
}: NewResumeTemplatesProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [customTemplate, setCustomTemplate] = useState<File | null>(null);

  // Close the preview modal on Escape
  useEffect(() => {
    if (!previewTemplate) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewTemplate(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [previewTemplate]);

  const handleTemplateSelect = (templateId: string) => {
    onTemplateSelect?.(templateId);
    toast.success(`${TEMPLATES.find(t => t.id === templateId)?.name} template selected!`);
  };

  const handleDownloadPDF = async (templateId: string) => {
    if (!resumeText.trim() && !resumeData.personalInfo.fullName) {
      toast.error('No resume content to export. Please upload a resume or build one first.');
      return;
    }

    setIsGenerating(true);
    try {
      const filename = `resume-${templateId}-${Date.now()}.pdf`;
      await NewPDFGenerator.generatePDF(resumeData, resumeText, templateId, filename);
      toast.success('Resume PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = (templateId: string) => {
    setPreviewTemplate(templateId);
  };

  const handleCustomTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type.includes('image/')) {
        setCustomTemplate(file);
        toast.success('Custom template uploaded successfully!');
      } else {
        toast.error('Please upload a PDF or image file for the template.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Resume Template
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Select from our professionally designed templates or upload your own custom template.
          All templates are ATS-friendly and optimized for modern hiring systems.
        </p>
      </div>

      {/* Custom Template Upload */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8 border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FiUpload className="w-5 h-5 text-purple-600" />
              Upload Custom Template
            </h3>
            <p className="text-gray-600">
              Have your own template? Upload it here and we&apos;ll format your resume to match.
            </p>
          </div>
          <div>
            <input
              type="file"
              id="custom-template"
              accept=".pdf,image/*"
              onChange={handleCustomTemplateUpload}
              className="hidden"
            />
            <label
              htmlFor="custom-template"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors duration-200 flex items-center gap-2"
            >
              <FiUpload className="w-4 h-4" />
              Upload Template
            </label>
          </div>
        </div>
        {customTemplate && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiFileText className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">{customTemplate.name}</span>
              </div>
              <button
                onClick={() => handleDownloadPDF('custom')}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                Generate PDF
              </button>
            </div>
            <p className="text-sm text-amber-700 mt-3">
              Custom template rendering is coming soon. Your resume will be generated using the Modern Professional layout.
            </p>
          </div>
        )}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {TEMPLATES.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border-2 ${selectedTemplate === template.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            {/* Template Preview */}
            <div className="h-48 p-4 bg-gray-50 relative">
              <TemplatePreview templateId={template.id} className="h-full" />

              {selectedTemplate === template.id && (
                <div className="absolute top-3 right-3 bg-blue-600 rounded-full p-2">
                  <FiCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {template.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {template.description}
              </p>

              {/* Features */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ${selectedTemplate === template.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                >
                  {selectedTemplate === template.id ? 'Selected' : 'Select Template'}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview(template.id)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <FiEye className="w-4 h-4" />
                    Preview
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(template.id)}
                    disabled={isGenerating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiDownload className="w-4 h-4" />
                    {isGenerating ? 'Generating...' : 'Download'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="template-preview-title"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 id="template-preview-title" className="text-xl font-semibold text-gray-900">
                    Template Preview: {TEMPLATES.find(t => t.id === previewTemplate)?.name}
                  </h3>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Large Template Preview */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
                    <TemplatePreview templateId={previewTemplate} className="h-96" />
                  </div>

                  {/* Template Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Template Features:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {TEMPLATES.find(t => t.id === previewTemplate)?.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <FiCheck className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleTemplateSelect(previewTemplate);
                        setPreviewTemplate(null);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                    >
                      Use This Template
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadPDF(previewTemplate);
                        setPreviewTemplate(null);
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating your resume PDF...</p>
          </div>
        </div>
      )}
    </div>
  );
}

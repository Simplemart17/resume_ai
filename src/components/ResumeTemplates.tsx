'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiEye, FiCheck } from 'react-icons/fi';
import { PDFGenerator, resumeTemplates, ResumeTemplate } from '@/utils/pdfGenerator';
import toast from 'react-hot-toast';

interface ResumeTemplatesProps {
  resumeText: string;
  onTemplateSelect?: (templateId: string) => void;
}

export function ResumeTemplates({ resumeText, onTemplateSelect }: ResumeTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    onTemplateSelect?.(templateId);
  };

  const handleDownloadPDF = async (templateId: string) => {
    if (!resumeText.trim()) {
      toast.error('No resume content to export');
      return;
    }

    setIsGenerating(true);
    try {
      const filename = `resume-${templateId}-${Date.now()}.pdf`;
      await PDFGenerator.generatePDF(resumeText, templateId, filename);
      toast.success('Resume PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getTemplatePreview = (template: ResumeTemplate) => {
    // Generate a preview based on template style
    switch (template.id) {
      case 'modern':
        return (
          <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-indigo-200">
            <div className="border-b-2 border-indigo-500 pb-2 mb-3">
              <div className="h-4 bg-gray-800 rounded mb-1"></div>
              <div className="h-2 bg-gray-400 rounded w-1/2"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-indigo-500 rounded w-1/3"></div>
              <div className="h-2 bg-gray-300 rounded"></div>
              <div className="h-2 bg-gray-300 rounded w-4/5"></div>
            </div>
          </div>
        );
      case 'classic':
        return (
          <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-400">
            <div className="text-center border-b border-black pb-2 mb-3">
              <div className="h-4 bg-black rounded mb-1 mx-auto w-1/2"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-black rounded w-1/4"></div>
              <div className="h-2 bg-gray-600 rounded ml-4"></div>
              <div className="h-2 bg-gray-600 rounded ml-4 w-4/5"></div>
            </div>
          </div>
        );
      case 'creative':
        return (
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-lg shadow-sm">
            <div className="text-center mb-3">
              <div className="h-4 bg-white rounded mb-1 mx-auto w-2/3"></div>
            </div>
            <div className="bg-white bg-opacity-90 p-3 rounded-lg">
              <div className="space-y-2">
                <div className="h-3 bg-purple-500 rounded w-1/3"></div>
                <div className="h-2 bg-gray-400 rounded"></div>
                <div className="h-2 bg-gray-400 rounded w-4/5"></div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Resume Template</h2>
        <p className="text-gray-600">Select a professional template and download your optimized resume as PDF</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resumeTemplates.map((template) => (
          <motion.div
            key={template.id}
            className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 ${
              selectedTemplate === template.id
                ? 'border-indigo-500 shadow-lg scale-105'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => handleTemplateSelect(template.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-6">
              {/* Template Preview */}
              <div className="mb-4 h-32 flex items-center justify-center">
                {getTemplatePreview(template)}
              </div>

              {/* Template Info */}
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                {/* Selection Indicator */}
                {selectedTemplate === template.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 bg-indigo-500 text-white rounded-full p-1"
                  >
                    <FiCheck size={16} />
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPreview(template.id);
                    }}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FiEye className="mr-1" size={14} />
                    Preview
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPDF(template.id);
                    }}
                    disabled={isGenerating || !resumeText.trim()}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <FiDownload className="mr-1" size={14} />
                        PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Download Button for Selected Template */}
      {resumeText.trim() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={() => handleDownloadPDF(selectedTemplate)}
            disabled={isGenerating}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <FiDownload className="mr-2" size={18} />
                Download {resumeTemplates.find(t => t.id === selectedTemplate)?.name} Resume
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {resumeTemplates.find(t => t.id === showPreview)?.name} Preview
                </h3>
                <button
                  onClick={() => setShowPreview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-gray-600 text-center">
                  Full preview will be available in the downloaded PDF
                </p>
              </div>
              
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreview(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownloadPDF(showPreview);
                    setShowPreview(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Download PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

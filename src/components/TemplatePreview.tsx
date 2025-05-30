'use client';

import { motion } from 'framer-motion';

interface TemplatePreviewProps {
  templateId: string;
  className?: string;
}

export function TemplatePreview({ templateId, className = "" }: TemplatePreviewProps) {
  const getPreviewContent = () => {
    switch (templateId) {
      case 'modern-professional':
        return (
          <div className="bg-white p-3 rounded-lg shadow-sm border h-full">
            {/* Header with blue accent */}
            <div className="bg-blue-600 text-white p-2 rounded-t-lg mb-2">
              <div className="h-3 bg-white bg-opacity-90 rounded mb-1"></div>
              <div className="h-2 bg-white bg-opacity-70 rounded w-2/3"></div>
            </div>
            
            {/* Content sections */}
            <div className="space-y-2">
              <div>
                <div className="h-2 bg-blue-600 rounded w-1/3 mb-1"></div>
                <div className="h-1.5 bg-gray-300 rounded mb-0.5"></div>
                <div className="h-1.5 bg-gray-300 rounded w-4/5"></div>
              </div>
              
              <div>
                <div className="h-2 bg-blue-600 rounded w-1/4 mb-1"></div>
                <div className="h-1.5 bg-gray-300 rounded mb-0.5"></div>
                <div className="h-1.5 bg-gray-300 rounded w-3/4"></div>
              </div>
              
              <div className="flex gap-1">
                <div className="h-1.5 bg-blue-200 rounded-full px-2 w-1/4"></div>
                <div className="h-1.5 bg-blue-200 rounded-full px-2 w-1/4"></div>
                <div className="h-1.5 bg-blue-200 rounded-full px-2 w-1/4"></div>
              </div>
            </div>
          </div>
        );

      case 'classic-traditional':
        return (
          <div className="bg-white p-3 rounded-lg shadow-sm border h-full">
            {/* Header */}
            <div className="text-center border-b border-gray-300 pb-2 mb-2">
              <div className="h-3 bg-gray-800 rounded mb-1 mx-auto w-2/3"></div>
              <div className="h-2 bg-gray-500 rounded mx-auto w-1/2"></div>
            </div>
            
            {/* Two column layout */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-2">
                <div>
                  <div className="h-2 bg-gray-800 rounded w-1/2 mb-1"></div>
                  <div className="h-1.5 bg-gray-300 rounded mb-0.5"></div>
                  <div className="h-1.5 bg-gray-300 rounded w-4/5"></div>
                </div>
                
                <div>
                  <div className="h-2 bg-gray-800 rounded w-1/3 mb-1"></div>
                  <div className="h-1.5 bg-gray-300 rounded mb-0.5"></div>
                  <div className="h-1.5 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="h-2 bg-gray-800 rounded w-full mb-1"></div>
                  <div className="h-1.5 bg-gray-300 rounded mb-0.5"></div>
                  <div className="h-1.5 bg-gray-300 rounded"></div>
                </div>
                
                <div>
                  <div className="h-2 bg-gray-800 rounded w-3/4 mb-1"></div>
                  <div className="h-1.5 bg-gray-300 rounded mb-0.5"></div>
                  <div className="h-1.5 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'creative-designer':
        return (
          <div className="bg-white p-3 rounded-lg shadow-sm border h-full">
            {/* Creative header with pink accent */}
            <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white p-2 rounded-lg mb-2">
              <div className="h-3 bg-white bg-opacity-90 rounded mb-1"></div>
              <div className="h-2 bg-white bg-opacity-70 rounded w-2/3"></div>
            </div>
            
            {/* Creative layout */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="w-1 bg-pink-500 rounded"></div>
                <div className="flex-1">
                  <div className="h-2 bg-pink-500 rounded w-1/3 mb-1"></div>
                  <div className="h-1.5 bg-gray-300 rounded mb-0.5"></div>
                  <div className="h-1.5 bg-gray-300 rounded w-4/5"></div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="w-1 bg-orange-500 rounded"></div>
                <div className="flex-1">
                  <div className="h-2 bg-orange-500 rounded w-1/4 mb-1"></div>
                  <div className="h-1.5 bg-gray-300 rounded mb-0.5"></div>
                  <div className="h-1.5 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
              
              <div className="flex gap-1 justify-center">
                <div className="h-1.5 bg-pink-300 rounded-full w-4"></div>
                <div className="h-1.5 bg-orange-300 rounded-full w-4"></div>
                <div className="h-1.5 bg-pink-300 rounded-full w-4"></div>
              </div>
            </div>
          </div>
        );

      case 'executive-premium':
        return (
          <div className="bg-white p-3 rounded-lg shadow-sm border h-full">
            {/* Executive header */}
            <div className="border-b-2 border-indigo-600 pb-2 mb-2">
              <div className="h-3 bg-gray-900 rounded mb-1 w-2/3"></div>
              <div className="h-2 bg-gray-600 rounded w-1/2"></div>
            </div>
            
            {/* Executive content */}
            <div className="space-y-2">
              <div>
                <div className="h-2 bg-indigo-600 rounded w-1/3 mb-1"></div>
                <div className="h-1.5 bg-gray-300 rounded mb-0.5"></div>
                <div className="h-1.5 bg-gray-300 rounded w-4/5"></div>
                <div className="h-1.5 bg-gray-300 rounded w-3/4"></div>
              </div>
              
              <div>
                <div className="h-2 bg-indigo-600 rounded w-1/4 mb-1"></div>
                <div className="h-1.5 bg-gray-300 rounded mb-0.5"></div>
                <div className="h-1.5 bg-gray-300 rounded w-4/5"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="h-2 bg-indigo-600 rounded w-full mb-1"></div>
                  <div className="h-1.5 bg-gray-300 rounded"></div>
                </div>
                <div>
                  <div className="h-2 bg-indigo-600 rounded w-3/4 mb-1"></div>
                  <div className="h-1.5 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-100 p-3 rounded-lg h-full flex items-center justify-center">
            <div className="text-gray-500 text-xs text-center">
              <div className="w-8 h-8 bg-gray-300 rounded mb-1 mx-auto"></div>
              Preview
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div 
      className={`${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {getPreviewContent()}
    </motion.div>
  );
}

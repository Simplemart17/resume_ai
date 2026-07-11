'use client';

import { FiFileText, FiSettings, FiEdit3 } from 'react-icons/fi';
import Link from 'next/link';
import type { ResumeData } from '@/types/resume';

interface ResumePreviewProps {
  resumeData: ResumeData;
  resumeText: string;
}

export function ResumePreview({ resumeData, resumeText }: ResumePreviewProps) {
  return (
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
                    {resumeData.experience.map((exp) => (
                      <div key={exp.id} className="mb-4">
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
                    {resumeData.education.map((edu) => (
                      <div key={edu.id} className="mb-3">
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
  );
}

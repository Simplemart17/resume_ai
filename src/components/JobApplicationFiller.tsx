'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLink, FiExternalLink, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { CopyButton } from './CopyButton';

/**
 * Structured resume data already extracted upstream (e.g. by the
 * parse-resume API). When provided, it takes precedence over the
 * regex-based extraction from raw resume text.
 */
export interface StructuredResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
  skills: string[];
}

interface JobApplicationFillerProps {
  /** Raw (plain) resume text, used for regex-based extraction. */
  resumeText: string;
  /** Optional structured data; skips regex re-extraction for the fields it covers. */
  structuredData?: StructuredResumeData | null;
}

interface ExtractedInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  experience: string;
  skills: string[];
  education: string;
}

// Module-level so re-renders of JobApplicationFiller (e.g. typing in the URL
// input) don't remount InfoField subtrees and wipe CopyButton copied-state.
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <CopyButton text={value} label={label} />
      </div>
      <div className="text-gray-900 text-sm bg-white rounded border p-2 min-h-[40px] max-h-32 overflow-y-auto">
        {value || <span className="text-gray-400">Not found</span>}
      </div>
    </div>
  );
}

export function JobApplicationFiller({ resumeText, structuredData }: JobApplicationFillerProps) {
  const [jobUrl, setJobUrl] = useState('');
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null);

  const extractResumeInfo = (text: string): ExtractedInfo => {
    // Basic extraction logic - in a real app, this would be more sophisticated
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    // Extract email
    const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : '';

    // Extract phone
    const phoneMatch = text.match(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // Extract name (usually first line or after "Name:")
    let name = '';
    for (const line of lines) {
      if (line.toLowerCase().includes('name:')) {
        name = line.replace(/name:/i, '').trim();
        break;
      } else if (line.length < 50 && line.split(' ').length >= 2 && line.split(' ').length <= 4) {
        // Likely a name if it's short and has 2-4 words
        name = line;
        break;
      }
    }

    // Extract skills
    const skillsSection = text.match(/skills?:?\s*([^]*?)(?=\n\s*[A-Z][^:]*:|$)/i);
    const skillsText = skillsSection ? skillsSection[1] : '';
    const skills = skillsText.split(/[,\n•-]/).map(s => s.trim()).filter(s => s && s.length > 1);

    // Extract experience summary
    const expSection = text.match(/(?:experience|employment):?\s*([^]*?)(?=\n\s*[A-Z][^:]*:|$)/i);
    const experience = expSection ? expSection[1].substring(0, 500) : '';

    // Extract education
    const eduSection = text.match(/education:?\s*([^]*?)(?=\n\s*[A-Z][^:]*:|$)/i);
    const education = eduSection ? eduSection[1].substring(0, 300) : '';

    return {
      name,
      email,
      phone,
      address: '', // Would need more sophisticated parsing
      experience,
      skills: skills.slice(0, 10), // Limit to top 10 skills
      education
    };
  };

  const handleAnalyzeResume = () => {
    if (!resumeText.trim() && !structuredData) {
      toast.error('No resume content to analyze');
      return;
    }

    // Regex extraction from raw text; structured data (when provided)
    // overrides the fields it covers so we don't re-derive them.
    const regexInfo = extractResumeInfo(resumeText);
    const info: ExtractedInfo = structuredData
      ? {
          name: structuredData.personalInfo.fullName || regexInfo.name,
          email: structuredData.personalInfo.email || regexInfo.email,
          phone: structuredData.personalInfo.phone || regexInfo.phone,
          address: structuredData.personalInfo.location || regexInfo.address,
          experience: regexInfo.experience,
          skills: structuredData.skills.length > 0 ? structuredData.skills : regexInfo.skills,
          education: regexInfo.education,
        }
      : regexInfo;

    setExtractedInfo(info);
    toast.success('Resume information extracted successfully!');
  };

  const isValidJobUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const validDomains = [
        'greenhouse.io',
        'lever.co',
        'workday.com',
        'bamboohr.com',
        'smartrecruiters.com',
        'indeed.com',
        'linkedin.com'
      ];

      return validDomains.some(
        domain => urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  };

  const copySkill = async (skill: string) => {
    try {
      await navigator.clipboard.writeText(skill);
      toast.success(`${skill} copied to clipboard!`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Application Assistant</h2>
        <p className="text-gray-600">Extract information from your resume to quickly fill job applications</p>
      </div>

      {/* Job URL Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Application URL</h3>
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://company.greenhouse.io/jobs/..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            {jobUrl && !isValidJobUrl(jobUrl) && (
              <p className="text-sm text-amber-600 mt-1 flex items-center">
                <FiInfo className="mr-1" size={14} />
                URL may not be supported. Supported: Greenhouse, Lever, Workday, etc.
              </p>
            )}
          </div>
          {jobUrl && isValidJobUrl(jobUrl) && (
            <a
              href={jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiExternalLink size={18} />
            </a>
          )}
        </div>
      </div>

      {/* Extract Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Resume Information</h3>
          <button
            onClick={handleAnalyzeResume}
            disabled={!resumeText.trim() && !structuredData}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiLink className="mr-2" size={16} />
            Extract Info
          </button>
        </div>

        {extractedInfo ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <InfoField label="Full Name" value={extractedInfo.name} />
            <InfoField label="Email" value={extractedInfo.email} />
            <InfoField label="Phone" value={extractedInfo.phone} />
            <InfoField label="Address" value={extractedInfo.address} />

            <div className="md:col-span-2">
              <InfoField label="Work Experience Summary" value={extractedInfo.experience} />
            </div>

            <div className="md:col-span-2">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <label className="text-sm font-medium text-gray-700">Skills</label>
                  <CopyButton text={extractedInfo.skills.join(', ')} label="Skills" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedInfo.skills.length > 0 ? (
                    extractedInfo.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full cursor-pointer hover:bg-indigo-200 transition-colors"
                        onClick={() => copySkill(skill)}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No skills found</span>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <InfoField label="Education" value={extractedInfo.education} />
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiInfo size={48} className="mx-auto mb-4 opacity-50" />
            <p>Click &quot;Extract Info&quot; to analyze your resume and extract key information for job applications</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
          <li>Click &quot;Extract Info&quot; to analyze your resume and extract key information</li>
          <li>Copy the job application URL from the company&apos;s career page</li>
          <li>Open the job application in a new tab</li>
          <li>Use the copy buttons to quickly fill in the application form fields</li>
          <li>Review and customize the information as needed before submitting</li>
        </ol>

        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Tip:</strong> This tool works best with applications from Greenhouse, Lever, Workday, and other major ATS platforms.
          </p>
        </div>
      </div>
    </div>
  );
}

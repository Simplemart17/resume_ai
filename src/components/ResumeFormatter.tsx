'use client';

import { useState, useEffect, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { ApiKeyManager } from './ApiKeyManager';
import { NewResumeTemplates } from './NewResumeTemplates';
import { JobApplicationFiller } from './JobApplicationFiller';
import { motion } from 'framer-motion';
import { apiKeyManager } from '@/utils/apiKeyManager';
import { useUserTier } from '@/lib/useUserTier';
import toast from 'react-hot-toast';
import {
  MAX_RESUME_CHARS,
  MAX_JOB_DESCRIPTION_CHARS,
  MAX_TITLE_COMPANY_CHARS,
} from '@/config/apiLimits';
import { FormattedResult, FormatterTab } from './formatter/types';
import { OptimizeForm } from './formatter/OptimizeForm';
import { ResultTabs } from './formatter/ResultTabs';
import { OptimizedResumePanel } from './formatter/OptimizedResumePanel';
import { AnalysisPanel } from './formatter/AnalysisPanel';
import { DashboardPanel } from './formatter/DashboardPanel';

export function ResumeFormatter() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormattedResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<FormatterTab>('resume');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const { accountsEnabled } = useUserTier();

  useEffect(() => {
    setHasApiKey(apiKeyManager.hasApiKey());
  }, []);

  // Sanitize cover letter HTML client-side to prevent XSS. Derived
  // synchronously so a new letter can never render with a stale value.
  const safeCoverLetter = useMemo(
    () => (coverLetter ? DOMPurify.sanitize(coverLetter) : ''),
    [coverLetter]
  );

  // Attach the user's key whenever one is set (routes fall back to the server
  // key when the header is absent)
  const buildRequestHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const apiKey = apiKeyManager.getApiKey();
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    return headers;
  };

  const handleFileChange = (file: File | null) => {
    setResumeFile(file);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Pre-block only in production WITHOUT accounts, where a browser key is
    // genuinely the only way a request can succeed. With accounts enabled,
    // paid tiers may use the server key with no browser key at all — send
    // the request and let the server's 401/403/429 messages guide the user.
    if (process.env.NODE_ENV === 'production' && !hasApiKey && !accountsEnabled) {
      toast.error('Please provide an OpenAI API key to use AI features');
      return;
    }

    setLoading(true);
    setError('');
    setCoverLetter('');
    setCoverLetterError(null);

    try {
      if (!resumeFile) {
        throw new Error('Please upload a resume file');
      }

      // First, upload the file and get the text content
      const formData = new FormData();
      formData.append('file', resumeFile);

      const uploadResponse = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to process resume file');
      }

      const { text } = await uploadResponse.json();
      setResumeText(text);

      // Pre-flight input caps: fail fast with a specific message instead of
      // letting the server reject the request with a 413
      if (text.length > MAX_RESUME_CHARS) {
        throw new Error(
          `Your resume is ${text.length.toLocaleString()} characters; the maximum is ${MAX_RESUME_CHARS.toLocaleString()}.`
        );
      }
      if (jobDescription.length > MAX_JOB_DESCRIPTION_CHARS) {
        throw new Error(
          `The job description is ${jobDescription.length.toLocaleString()} characters; the maximum is ${MAX_JOB_DESCRIPTION_CHARS.toLocaleString()}.`
        );
      }

      // Now format the resume, forwarding the user's API key if one is set
      const formatResponse = await fetch('/api/format-resume', {
        method: 'POST',
        headers: buildRequestHeaders(),
        body: JSON.stringify({ resume: text, jobDescription }),
      });

      if (!formatResponse.ok) {
        const errorData = await formatResponse.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to format resume');
      }

      const data = await formatResponse.json();
      setResult(data);
      toast.success('Resume optimized successfully!');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!result || !jobDescription) return;

    setGeneratingCoverLetter(true);
    setCoverLetterError(null);

    try {
      // Regex-derived fallbacks: trimmed and capped so they can never trip
      // the server's title/company length limit (HTTP 413)
      const fallbackJobTitle = jobDescription
        .match(/(?:position|job title|role):?\s*([^.;\n]+)/i)?.[1]
        ?.trim()
        .slice(0, MAX_TITLE_COMPANY_CHARS);
      const fallbackCompany = jobDescription
        .match(/\b(?:at|with|for)\s+([^.;\n]+)/i)?.[1]
        ?.trim()
        .slice(0, MAX_TITLE_COMPANY_CHARS);

      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: buildRequestHeaders(),
        body: JSON.stringify({
          jobTitle: jobTitle.trim() || fallbackJobTitle || 'the position',
          company: company.trim() || fallbackCompany || 'the company',
          jobDescription: jobDescription,
          resume: result.optimizedResume
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate cover letter');
      }

      if (!data?.coverLetter) {
        throw new Error('Received an unexpected response while generating the cover letter. Please try again.');
      }

      setCoverLetter(data.coverLetter);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      setCoverLetterError(error instanceof Error ? error.message : 'Failed to generate cover letter');
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div
        className="py-8 px-6 rounded-t-xl text-white"
        style={{
          background: 'linear-gradient(135deg, rgb(79, 70, 229) 0%, rgb(147, 51, 234) 50%, rgb(236, 72, 153) 100%)'
        }}
      >
        <h1 className="text-4xl font-bold text-center mb-2">AI Resume Optimizer Pro</h1>
        <p className="text-center opacity-90 text-lg">Transform your resume with AI-powered optimization, templates, and job application tools</p>
      </div>

      <div className="bg-white shadow-xl rounded-b-xl">
        {/* API Key Management */}
        <div className="p-6 border-b border-gray-200">
          <ApiKeyManager onApiKeySet={setHasApiKey} />
        </div>
        {/* Main Form */}
        <div className="p-6">
          <OptimizeForm
            resumeFile={resumeFile}
            onFileChange={handleFileChange}
            jobDescription={jobDescription}
            onJobDescriptionChange={setJobDescription}
            jobTitle={jobTitle}
            onJobTitleChange={setJobTitle}
            company={company}
            onCompanyChange={setCompany}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
          />

        {result && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ResultTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              generatingCoverLetter={generatingCoverLetter}
              hasCoverLetter={!!coverLetter}
              onGenerateCoverLetter={handleGenerateCoverLetter}
            />

            {/* Tab Content */}
            {activeTab === 'resume' ? (
              <OptimizedResumePanel
                optimizedResume={result.optimizedResume}
                safeCoverLetter={safeCoverLetter}
                coverLetterError={coverLetterError}
              />
            ) : activeTab === 'analysis' ? (
              <AnalysisPanel result={result} />
            ) : activeTab === 'dashboard' ? (
              <DashboardPanel result={result} />
            ) : activeTab === 'templates' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <NewResumeTemplates
                  resumeText={result?.optimizedResume || resumeText}
                />
              </motion.div>
            ) : activeTab === 'autofill' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <JobApplicationFiller
                  resumeText={result?.optimizedResume || resumeText}
                />
              </motion.div>
            ) : null}
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { ApiKeyManager } from './ApiKeyManager';
import { NewResumeTemplates } from './NewResumeTemplates';
import { JobApplicationFiller } from './JobApplicationFiller';
import { apiKeyManager } from '@/utils/apiKeyManager';
import { useUserTier } from '@/lib/useUserTier';
import toast from 'react-hot-toast';
import {
  MAX_RESUME_CHARS,
  MAX_JOB_DESCRIPTION_CHARS,
  MAX_TITLE_COMPANY_CHARS,
} from '@/config/apiLimits';
import { PageHeader } from './PageHeader';
import { FormattedResult, FormatterTab } from './formatter/types';
import { OptimizeForm } from './formatter/OptimizeForm';
import { OptimizedResumePanel } from './formatter/OptimizedResumePanel';
import { CoverLetterPanel } from './formatter/CoverLetterPanel';
import { ScoringTheater } from './formatter/ScoringTheater';

export function ResumeFormatter() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormattedResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<FormatterTab>('coverLetter');
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
      <PageHeader
        eyebrow="AI optimizer"
        title="Score your resume against the job"
        sub="Upload your resume and paste the posting. The parser scores the match, shows the keywords it found — and the ones it didn't."
        strip={{ token: 'ats', text: 'paste a posting · get the machine’s read · fix it before you apply' }}
      />

      <div className="paper">
        {/* API Key Management */}
        <div className="p-6 sm:p-8 border-b border-rule">
          <ApiKeyManager onApiKeySet={setHasApiKey} />
        </div>
        {/* Main Form */}
        <div className="p-6 sm:p-8">
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
        </div>
      </div>

      {loading && <ScoringTheater />}

      {!loading && result && (
        <div className="mt-10 space-y-12">
          {/* The one canonical result: the annotated document + marginalia. */}
          <OptimizedResumePanel result={result} />

          {/* Next steps — clearly separated from the result itself. */}
          <section aria-label="Next steps">
            <p className="eyebrow eyebrow-rule mb-6">
              <span>Next steps</span>
            </p>

            <div className="mb-8 flex flex-wrap gap-2" role="tablist">
              {NEXT_STEPS.map((step) => (
                <button
                  key={step.id}
                  role="tab"
                  aria-selected={activeTab === step.id}
                  onClick={() => setActiveTab(step.id)}
                  className={`rounded-[3px] px-4 py-2 font-mono text-xs font-medium uppercase tracking-[0.12em] border transition-colors ${
                    activeTab === step.id
                      ? 'border-pen bg-pen-wash text-pen'
                      : 'border-rule bg-paper text-ink-soft hover:text-ink hover:border-ink/40'
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </div>

            {activeTab === 'coverLetter' && (
              <div className="space-y-6">
                <div className="paper flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                      Draft a matching cover letter
                    </h3>
                    <p className="mt-1 text-sm text-ink-soft">
                      Grounded in your optimized résumé and the posting — edit before you send.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={generatingCoverLetter}
                    className="btn-pen shrink-0 px-5 py-2.5 text-sm"
                  >
                    {generatingCoverLetter
                      ? 'Generating…'
                      : coverLetter
                        ? 'Regenerate letter'
                        : 'Generate cover letter'}
                  </button>
                </div>

                {coverLetterError && (
                  <p className="text-sm text-fail" role="alert">
                    {coverLetterError}
                  </p>
                )}
                {safeCoverLetter && <CoverLetterPanel safeCoverLetter={safeCoverLetter} />}
              </div>
            )}

            {activeTab === 'templates' && (
              <NewResumeTemplates resumeText={result.optimizedResume || resumeText} />
            )}

            {activeTab === 'autofill' && (
              <JobApplicationFiller resumeText={result.optimizedResume || resumeText} />
            )}
          </section>
        </div>
      )}
    </div>
  );
}

const NEXT_STEPS: { id: FormatterTab; label: string }[] = [
  { id: 'coverLetter', label: 'Cover letter' },
  { id: 'templates', label: 'Templates' },
  { id: 'autofill', label: 'Auto-fill' },
];

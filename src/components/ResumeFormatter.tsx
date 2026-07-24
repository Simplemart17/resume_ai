'use client';

import { useState, useEffect, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { ApiKeyManager } from './ApiKeyManager';
import { NewResumeTemplates } from './NewResumeTemplates';
import { JobApplicationFiller } from './JobApplicationFiller';
import { apiKeyManager } from '@/utils/apiKeyManager';
import { useUserTier } from '@/lib/useUserTier';
import {
  getBaseResume,
  isLimitError,
  saveBaseResumeFile,
  saveCoverLetter,
  saveOptimizedResume,
  useSavedResumes,
} from '@/lib/documents';
import toast from 'react-hot-toast';
import {
  MAX_RESUME_CHARS,
  MAX_JOB_DESCRIPTION_CHARS,
  MAX_TITLE_COMPANY_CHARS,
} from '@/config/apiLimits';
import { PageHeader } from './PageHeader';
import { FormattedResult, FormatterTab } from './formatter/types';
import { OptimizeForm, FormatterMode } from './formatter/OptimizeForm';
import { ResumeSource } from './formatter/ResumeSourcePicker';
import { OptimizedResumePanel } from './formatter/OptimizedResumePanel';
import { CoverLetterPanel } from './formatter/CoverLetterPanel';
import { ScoringTheater } from './formatter/ScoringTheater';

export function ResumeFormatter() {
  const [mode, setMode] = useState<FormatterMode>('optimize');
  const [source, setSource] = useState<ResumeSource | null>(null);
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
  // Links persisted docs together so a cover letter can point back at the base
  // resume / optimized resume it was grounded in.
  const [baseResumeId, setBaseResumeId] = useState<string | null>(null);
  const [savedOptimizedId, setSavedOptimizedId] = useState<string | null>(null);

  const { user, accountsEnabled } = useUserTier();
  const signedIn = accountsEnabled && !!user;
  const savedResumes = useSavedResumes(user?.id ?? null);

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

  // Pre-block only in production WITHOUT accounts, where a browser key is the
  // only way a request can succeed. With accounts, paid tiers may use the server
  // key with no browser key — send it and let the server's 401 guide the user.
  const keyGuardBlocks = (): boolean => {
    if (process.env.NODE_ENV === 'production' && !hasApiKey && !accountsEnabled) {
      toast.error('Please provide an OpenAI API key to use AI features');
      return true;
    }
    return false;
  };

  // Auto-saves are best-effort: a tier-cap 403 gets a visible upgrade prompt
  // (the AI result itself still renders); anything else is logged, not shown.
  const notifySaveError = (context: string, err: unknown) => {
    if (isLimitError(err)) {
      // Stable id so re-running while at the cap replaces the prompt instead of
      // stacking a new toast on every attempt.
      toast.error(err.message, { id: 'doc-limit' });
    } else {
      console.warn(context, err);
    }
  };

  const handleModeChange = (next: FormatterMode) => {
    if (next === mode) return;
    setMode(next);
    setError('');
    setCoverLetterError(null);
  };

  /**
   * Resolves the resume text from the current source. Uploading a new file
   * persists it as a base resume when signed in (keeping the original), so it
   * shows up in the picker next time; otherwise it falls back to the text-only
   * upload route. Returns the text plus the base-resume id (null when not saved).
   */
  const resolveResumeText = async (
    src: ResumeSource
  ): Promise<{ text: string; baseResumeId: string | null }> => {
    if (src.kind === 'saved') {
      const full = await getBaseResume(src.id);
      return { text: full.resumeText, baseResumeId: src.id };
    }

    if (signedIn) {
      // Persisting the base resume is best-effort: on failure (storage/DB
      // outage, or the tier's saved-resume cap reached) still let the user
      // optimize with a text-only extract instead of blocking the whole run.
      try {
        const saved = await saveBaseResumeFile(src.file);
        if (saved) {
          savedResumes.add(saved);
          return { text: saved.resumeText, baseResumeId: saved.id };
        }
      } catch (err) {
        notifySaveError('Could not save base resume; using a text-only extract:', err);
      }
    }

    // Anonymous / no accounts / save failed: extract text only, nothing persisted.
    const formData = new FormData();
    formData.append('file', src.file);
    const uploadResponse = await fetch('/api/upload-resume', { method: 'POST', body: formData });
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => null);
      throw new Error(errorData?.error || 'Failed to process resume file');
    }
    const { text } = await uploadResponse.json();
    return { text, baseResumeId: null };
  };

  const enforceLengths = (text: string) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (keyGuardBlocks()) return;

    setLoading(true);
    setError('');
    setCoverLetter('');
    setCoverLetterError(null);
    setSavedOptimizedId(null);

    try {
      if (!source) throw new Error('Please add a resume');

      const { text, baseResumeId: resolvedBaseId } = await resolveResumeText(source);
      setResumeText(text);
      setBaseResumeId(resolvedBaseId);
      enforceLengths(text);

      const formatResponse = await fetch('/api/format-resume', {
        method: 'POST',
        headers: buildRequestHeaders(),
        body: JSON.stringify({ resume: text, jobDescription }),
      });

      if (!formatResponse.ok) {
        const errorData = await formatResponse.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to format resume');
      }

      const data: FormattedResult = await formatResponse.json();
      setResult(data);
      toast.success('Resume optimized successfully!');

      // Best-effort persistence — never block the result on a failed save.
      if (signedIn) {
        saveOptimizedResume({
          baseResumeId: resolvedBaseId,
          jobTitle: jobTitle.trim() || undefined,
          company: company.trim() || undefined,
          jobDescription,
          optimizedText: data.optimizedResume,
          matchScore: data.matchScore,
          changes: data.changes,
          matchingSkills: data.matchingSkills,
          missingSkills: data.missingSkills,
        })
          .then((item) => item && setSavedOptimizedId(item.id))
          .catch((err) => notifySaveError('Could not save optimized resume:', err));
      }
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generates a cover letter grounded in `resumeSource` text, renders it, and
   * (when signed in) persists it linked to the base/optimized resume it came
   * from. Shared by the standalone Cover-letter mode and the post-optimization
   * next-step tab.
   */
  const generateCoverLetter = async (
    resumeSourceText: string,
    link: { baseResumeId: string | null; optimizedResumeId: string | null }
  ) => {
    const fallbackJobTitle = jobDescription
      .match(/(?:position|job title|role):?\s*([^.;\n]+)/i)?.[1]
      ?.trim()
      .slice(0, MAX_TITLE_COMPANY_CHARS);
    const fallbackCompany = jobDescription
      .match(/\b(?:at|with|for)\s+([^.;\n]+)/i)?.[1]
      ?.trim()
      .slice(0, MAX_TITLE_COMPANY_CHARS);

    const resolvedTitle = jobTitle.trim() || fallbackJobTitle || 'the position';
    const resolvedCompany = company.trim() || fallbackCompany || 'the company';

    const response = await fetch('/api/generate-cover-letter', {
      method: 'POST',
      headers: buildRequestHeaders(),
      body: JSON.stringify({
        jobTitle: resolvedTitle,
        company: resolvedCompany,
        jobDescription,
        resume: resumeSourceText,
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

    if (signedIn) {
      saveCoverLetter({
        baseResumeId: link.baseResumeId,
        optimizedResumeId: link.optimizedResumeId,
        jobTitle: jobTitle.trim() || undefined,
        company: company.trim() || undefined,
        jobDescription,
        contentHtml: DOMPurify.sanitize(data.coverLetter),
      }).catch((err) => notifySaveError('Could not save cover letter:', err));
    }
  };

  // Standalone Cover-letter mode: resume + JD → letter, no optimization step.
  const handleCoverLetterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (keyGuardBlocks()) return;

    setLoading(true);
    setError('');
    setCoverLetter('');
    setCoverLetterError(null);

    try {
      if (!source) throw new Error('Please add a resume');
      const { text, baseResumeId: resolvedBaseId } = await resolveResumeText(source);
      setResumeText(text);
      setBaseResumeId(resolvedBaseId);
      enforceLengths(text);
      await generateCoverLetter(text, { baseResumeId: resolvedBaseId, optimizedResumeId: null });
      toast.success('Cover letter generated!');
    } catch (err) {
      console.error('Error generating cover letter:', err);
      const message = err instanceof Error ? err.message : 'Failed to generate cover letter';
      setCoverLetterError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Post-optimization tab: ground the letter in the already-optimized résumé.
  const handleGenerateCoverLetter = async () => {
    if (!result || !jobDescription) return;
    setGeneratingCoverLetter(true);
    setCoverLetterError(null);
    try {
      await generateCoverLetter(result.optimizedResume, {
        baseResumeId,
        optimizedResumeId: savedOptimizedId,
      });
    } catch (err) {
      console.error('Error generating cover letter:', err);
      setCoverLetterError(err instanceof Error ? err.message : 'Failed to generate cover letter');
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const coverLetterFileBase = company.trim()
    ? `cover-letter-${company.trim()}`
    : 'cover-letter';

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        eyebrow="AI optimizer"
        title="Score your resume against the job"
        sub="Upload your resume and paste the posting. The parser scores the match, shows the keywords it found — and the ones it didn't."
        strip={{ token: 'ats', text: 'paste a posting · get the machine’s read · fix it before you apply' }}
      />

      {/* Mode toggle: optimize the résumé, or jump straight to a cover letter. */}
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="What do you want to make?">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => handleModeChange(m.id)}
            className={`rounded-[3px] px-4 py-2 font-mono text-xs font-medium uppercase tracking-[0.12em] border transition-colors ${
              mode === m.id
                ? 'border-pen bg-pen-wash text-pen'
                : 'border-rule bg-paper text-ink-soft hover:text-ink hover:border-ink/40'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="paper">
        {/* API Key Management */}
        <div className="p-6 sm:p-8 border-b border-rule">
          <ApiKeyManager onApiKeySet={setHasApiKey} />
        </div>
        {/* Main Form */}
        <div className="p-6 sm:p-8">
          <OptimizeForm
            mode={mode}
            source={source}
            onSourceChange={setSource}
            savedResumes={savedResumes.resumes}
            showSaved={signedIn}
            savedLoading={savedResumes.loading}
            jobDescription={jobDescription}
            onJobDescriptionChange={setJobDescription}
            jobTitle={jobTitle}
            onJobTitleChange={setJobTitle}
            company={company}
            onCompanyChange={setCompany}
            loading={loading}
            error={error}
            onSubmit={mode === 'optimize' ? handleSubmit : handleCoverLetterSubmit}
          />
        </div>
      </div>

      {/* Standalone cover-letter mode result. */}
      {mode === 'coverLetter' && (
        <div className="mt-10 space-y-6">
          {loading && (
            <p className="font-mono text-sm text-ink-soft" aria-live="polite">
              [doc] drafting your cover letter…
            </p>
          )}
          {coverLetterError && !loading && (
            <p className="text-sm text-fail" role="alert">
              {coverLetterError}
            </p>
          )}
          {!loading && safeCoverLetter && (
            <CoverLetterPanel safeCoverLetter={safeCoverLetter} fileBase={coverLetterFileBase} />
          )}
        </div>
      )}

      {/* Optimize mode result. */}
      {mode === 'optimize' && loading && <ScoringTheater />}

      {mode === 'optimize' && !loading && result && (
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
                {safeCoverLetter && (
                  <CoverLetterPanel safeCoverLetter={safeCoverLetter} fileBase={coverLetterFileBase} />
                )}
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

const MODES: { id: FormatterMode; label: string }[] = [
  { id: 'optimize', label: 'Optimize résumé' },
  { id: 'coverLetter', label: 'Cover letter' },
];

const NEXT_STEPS: { id: FormatterTab; label: string }[] = [
  { id: 'coverLetter', label: 'Cover letter' },
  { id: 'templates', label: 'Templates' },
  { id: 'autofill', label: 'Auto-fill' },
];

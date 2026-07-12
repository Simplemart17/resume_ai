'use client';

import Link from 'next/link';
import type { ResumeData } from '@/types/resume';

interface ResumeSheetProps {
  resumeData: ResumeData;
  resumeText: string;
  /** Tighter paddings/type for the builder's live side rail. */
  compact?: boolean;
}

/** Count the sections the sheet currently carries — feeds the machine strip. */
function sectionCount(resumeData: ResumeData): number {
  return [
    resumeData.personalInfo.fullName,
    resumeData.summary,
    resumeData.experience.length > 0,
    resumeData.education.length > 0,
    resumeData.skills.length > 0,
  ].filter(Boolean).length;
}

/**
 * The typeset resume sheet itself — paper, document typography, and the
 * machine strip reading it live. Used full-size in the Preview tab and
 * compact in the builder's always-on side rail.
 */
export function ResumeSheet({ resumeData, resumeText, compact = false }: ResumeSheetProps) {
  const hasContent = Boolean(resumeData.personalInfo.fullName || resumeText);
  const sections = sectionCount(resumeData);

  if (!hasContent) {
    return (
      <div className="paper overflow-hidden">
        <div className={compact ? 'p-6' : 'p-8 sm:p-12'}>
          {/* A blank sheet that already reads as a document waiting to be set. */}
          <div className="h-4 w-2/5 rounded-[2px] bg-ink/10 mb-5" />
          <div className="paper-rule h-40 rounded-[2px] opacity-70" />
        </div>
        <div className="machine-strip">
          <span className="machine-token">[live]</span>
          <span>empty sheet · start typing on the left</span>
          <span className="machine-caret text-pen">▍</span>
        </div>
      </div>
    );
  }

  return (
    <div className="paper overflow-hidden">
      <div className={compact ? 'p-6' : 'p-8 sm:p-12'}>
        {resumeData.personalInfo.fullName ? (
          <div>
            <h1
              className={`font-display font-bold tracking-tight text-ink mb-1 break-words ${
                compact ? 'text-xl' : 'text-3xl'
              }`}
            >
              {resumeData.personalInfo.fullName}
            </h1>
            <div className={`font-mono text-xs text-ink-soft break-words ${compact ? 'mb-5' : 'mb-8'}`}>
              {[
                resumeData.personalInfo.email,
                resumeData.personalInfo.phone,
                resumeData.personalInfo.location,
                resumeData.personalInfo.website,
                resumeData.personalInfo.linkedin,
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>

            {resumeData.summary && (
              <div className={`typeset-line ${compact ? 'mb-5' : 'mb-8'}`}>
                <h2 className="eyebrow eyebrow-rule mb-3">
                  <span>Summary</span>
                </h2>
                <p className="text-sm text-ink leading-relaxed break-words">{resumeData.summary}</p>
              </div>
            )}

            {resumeData.experience.length > 0 && (
              <div className={compact ? 'mb-5' : 'mb-8'}>
                <h2 className="eyebrow eyebrow-rule mb-4">
                  <span>Experience</span>
                </h2>
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className={`typeset-line ${compact ? 'mb-4' : 'mb-5'}`}>
                    <h3 className="font-semibold text-ink break-words">{exp.position}</h3>
                    <p className="text-sm text-ink-soft break-words">{exp.company}</p>
                    <p className="font-mono text-xs text-ink-soft mb-2">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-ink leading-relaxed break-words">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {resumeData.education.length > 0 && (
              <div className={compact ? 'mb-5' : 'mb-8'}>
                <h2 className="eyebrow eyebrow-rule mb-4">
                  <span>Education</span>
                </h2>
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="typeset-line mb-4">
                    <h3 className="font-semibold text-ink break-words">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="text-sm text-ink-soft break-words">{edu.institution}</p>
                    <p className="font-mono text-xs text-ink-soft">{edu.endDate}</p>
                  </div>
                ))}
              </div>
            )}

            {resumeData.skills.length > 0 && (
              <div className="typeset-line">
                <h2 className="eyebrow eyebrow-rule mb-3">
                  <span>Skills</span>
                </h2>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {resumeData.skills.map((skill, index) => (
                    <span key={index} className="font-mono text-xs text-ink break-words">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-sm text-ink leading-relaxed break-words">
            {resumeText}
          </div>
        )}
      </div>

      {/* the machine's live read of the sheet */}
      <div className="machine-strip">
        <span className="machine-token">[live]</span>
        <span>
          {sections} section{sections === 1 ? '' : 's'}
        </span>
        {resumeData.skills.length > 0 && (
          <>
            <span>·</span>
            <span>{resumeData.skills.length} skills</span>
          </>
        )}
      </div>
    </div>
  );
}

interface ResumePreviewProps {
  resumeData: ResumeData;
  resumeText: string;
}

/** Full-page preview (mobile Preview tab): the sheet plus next-step actions. */
export function ResumePreview({ resumeData, resumeText }: ResumePreviewProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink mb-6">Preview</h2>

      <ResumeSheet resumeData={resumeData} resumeText={resumeText} />

      {/* Quick Actions */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
        <Link href="/optimize" className="btn-pen px-6 py-3 text-sm">
          Optimize with AI <span aria-hidden="true">→</span>
        </Link>
        <Link href="/autofill" className="btn-ghost px-6 py-3 text-sm">
          Auto-fill applications
        </Link>
      </div>
    </div>
  );
}

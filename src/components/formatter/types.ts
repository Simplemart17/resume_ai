export interface FormattedResult {
  optimizedResume: string;
  matchScore: number;
  changes: string[];
  matchingSkills: string[];
  missingSkills: string[];
}

/** The result itself is always shown; these are the "next steps" beneath it. */
export type FormatterTab = 'coverLetter' | 'templates' | 'autofill';

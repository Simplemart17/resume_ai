export interface FormattedResult {
  optimizedResume: string;
  matchScore: number;
  changes: string[];
  matchingSkills: string[];
  missingSkills: string[];
}

export type FormatterTab = 'resume' | 'analysis' | 'templates' | 'autofill' | 'dashboard';

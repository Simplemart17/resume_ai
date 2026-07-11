import type { ResumeData, Experience, Education, PersonalInfo } from '@/types/resume';
import { monthNumberFromName } from '@/utils/date';

// Shape returned by /api/parse-resume in `structured` — differs from ResumeData
interface ParsedExperience {
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface ParsedEducation {
  institution?: string;
  degree?: string;
  field?: string;
  graduationDate?: string;
}

export interface ParsedResume {
  personalInfo?: Partial<PersonalInfo>;
  summary?: string;
  experience?: ParsedExperience[];
  education?: ParsedEducation[];
  skills?: string[];
}

// Normalize a parsed date toward the YYYY-MM format required by <input type="month">.
// Only converts confidently ("May 2020", "2020-05", "05/2020"); anything else
// (e.g. a bare year) returns '' so the user can fill it in rather than getting wrong data.
function toMonthInputValue(raw?: string): string {
  if (!raw) return '';
  const value = raw.trim();

  const isoMatch = value.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (isoMatch) return value;

  const monthNameMatch = value.match(/^([A-Za-z]+)\.?\s+(\d{4})$/);
  if (monthNameMatch) {
    const month = monthNumberFromName(monthNameMatch[1]);
    if (month) return `${monthNameMatch[2]}-${month}`;
  }

  const numericMatch = value.match(/^(\d{1,2})\/(\d{4})$/);
  if (numericMatch) {
    const month = Number(numericMatch[1]);
    if (month >= 1 && month <= 12) {
      return `${numericMatch[2]}-${String(month).padStart(2, '0')}`;
    }
  }

  return '';
}

// Map the parse-resume API response into ResumeData: generate ids, derive
// `current`, and rename education graduationDate -> endDate.
export function mapParsedResume(parsed: ParsedResume): ResumeData {
  return {
    personalInfo: {
      fullName: parsed.personalInfo?.fullName ?? '',
      email: parsed.personalInfo?.email ?? '',
      phone: parsed.personalInfo?.phone ?? '',
      location: parsed.personalInfo?.location ?? '',
      website: parsed.personalInfo?.website ?? '',
      linkedin: parsed.personalInfo?.linkedin ?? ''
    },
    summary: parsed.summary ?? '',
    experience: (parsed.experience ?? []).map((exp): Experience => {
      const current = /present/i.test(exp.endDate ?? '');
      return {
        id: crypto.randomUUID(),
        company: exp.company ?? '',
        position: exp.position ?? '',
        startDate: toMonthInputValue(exp.startDate),
        endDate: current ? '' : toMonthInputValue(exp.endDate),
        current,
        description: exp.description ?? ''
      };
    }),
    education: (parsed.education ?? []).map((edu): Education => ({
      id: crypto.randomUUID(),
      institution: edu.institution ?? '',
      degree: edu.degree ?? '',
      field: edu.field ?? '',
      startDate: '',
      endDate: toMonthInputValue(edu.graduationDate),
      gpa: ''
    })),
    skills: parsed.skills ?? []
  };
}

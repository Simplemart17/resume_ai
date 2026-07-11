import { NextRequest, NextResponse } from 'next/server';
import { extractResumeText } from '@/utils/extractResumeText';
import { checkRateLimit } from '@/utils/rateLimit';
import { rateLimitResponse } from '@/utils/apiHelpers';

export async function POST(request: NextRequest) {
  try {
    // Rate limit before doing any work — parsing 10 MB uploads is expensive
    const rateLimit = checkRateLimit(request, { limit: 10, windowMs: 60000, bucket: 'parse-resume' });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    const formData = await request.formData();

    // Shared validation + text extraction (same rules as upload-resume)
    const extraction = await extractResumeText(formData.get('file'));
    if (!extraction.ok) {
      return NextResponse.json({ error: extraction.error }, { status: extraction.status });
    }
    const { text } = extraction;

    // Basic parsing to extract structured data
    const structured = parseResumeText(text);

    return NextResponse.json({
      text,
      structured,
      success: true
    });
  } catch (error) {
    console.error('Error parsing resume:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume' },
      { status: 500 }
    );
  }
}

function parseResumeText(text: string) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  const result = {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: ''
    },
    summary: '',
    experience: [] as Array<{
      company: string;
      position: string;
      startDate: string;
      endDate: string;
      description: string;
    }>,
    education: [] as Array<{
      institution: string;
      degree: string;
      field: string;
      graduationDate: string;
    }>,
    skills: [] as string[]
  };

  // Enhanced email extraction with multiple patterns
  const emailPatterns = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    /Email:\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/gi,
    /E-mail:\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/gi
  ];

  for (const pattern of emailPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.personalInfo.email = match[0].replace(/^(Email|E-mail):\s*/i, '');
      break;
    }
  }

  // Enhanced phone extraction with multiple formats
  const phonePatterns = [
    /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    /Phone:\s*([\+\-\.\s\(\)0-9]+)/gi,
    /Tel:\s*([\+\-\.\s\(\)0-9]+)/gi,
    /Mobile:\s*([\+\-\.\s\(\)0-9]+)/gi,
    /Cell:\s*([\+\-\.\s\(\)0-9]+)/gi
  ];

  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.personalInfo.phone = match[0].replace(/^(Phone|Tel|Mobile|Cell):\s*/i, '').trim();
      break;
    }
  }

  // Enhanced name extraction
  const namePatterns = [
    // Look for name at the very beginning
    /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/m,
    // Look for name before contact info
    /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s*\n.*@/m,
    // Look for name in header format
    /^([A-Z\s]{10,50})/m
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      const name = match[1].trim();
      if (name.split(' ').length >= 2 && name.length < 50) {
        result.personalInfo.fullName = name;
        break;
      }
    }
  }

  // Fallback: first substantial line
  if (!result.personalInfo.fullName && lines.length > 0) {
    for (const line of lines.slice(0, 3)) {
      if (line.length > 5 && line.length < 50 &&
          !line.includes('@') &&
          !line.match(/\d{3}/) &&
          line.split(' ').length >= 2 &&
          !line.toLowerCase().includes('resume') &&
          !line.toLowerCase().includes('cv')) {
        result.personalInfo.fullName = line;
        break;
      }
    }
  }

  // Enhanced location extraction
  const locationPatterns = [
    /Address:\s*([^,\n]+(?:,\s*[^,\n]+)*)/gi,
    /Location:\s*([^,\n]+(?:,\s*[^,\n]+)*)/gi,
    /([A-Z][a-z]+,\s*[A-Z]{2}(?:\s+\d{5})?)/g,
    /([A-Z][a-z]+\s+[A-Z][a-z]+,\s*[A-Z]{2})/g
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.personalInfo.location = match[0].replace(/^(Address|Location):\s*/i, '').trim();
      break;
    }
  }

  // Enhanced LinkedIn extraction
  const linkedinPatterns = [
    /linkedin\.com\/in\/[\w-]+/gi,
    /LinkedIn:\s*(linkedin\.com\/in\/[\w-]+)/gi,
    /LinkedIn:\s*([\w-]+)/gi
  ];

  for (const pattern of linkedinPatterns) {
    const match = text.match(pattern);
    if (match) {
      let linkedin = match[0].replace(/^LinkedIn:\s*/i, '');
      if (!linkedin.includes('linkedin.com')) {
        linkedin = `linkedin.com/in/${linkedin}`;
      }
      result.personalInfo.linkedin = linkedin;
      break;
    }
  }

  // Enhanced website extraction
  const websitePatterns = [
    /(?:Website|Portfolio|URL):\s*(https?:\/\/[^\s]+)/gi,
    /(https?:\/\/[^\s]+)/g,
    /(?:www\.)([^\s]+\.[a-z]{2,})/gi
  ];

  for (const pattern of websitePatterns) {
    const match = text.match(pattern);
    if (match) {
      let website = match[0].replace(/^(Website|Portfolio|URL):\s*/i, '');
      if (!website.startsWith('http') && !website.includes('linkedin')) {
        website = `https://${website}`;
      }
      if (!website.includes('linkedin')) {
        result.personalInfo.website = website;
        break;
      }
    }
  }

  // Enhanced summary extraction
  const summarySection = extractSection(text, [
    'summary', 'professional summary', 'profile', 'objective',
    'career objective', 'about', 'overview', 'career summary'
  ]);
  if (summarySection) {
    result.summary = summarySection.trim();
  }

  // Enhanced skills extraction
  const skillsSection = extractSection(text, [
    'skills', 'technical skills', 'core competencies', 'technologies',
    'programming languages', 'software', 'tools', 'expertise'
  ]);

  if (skillsSection) {
    // Multiple parsing strategies
    let skills: string[] = [];

    // Strategy 1: Comma/bullet separated
    const commaSkills = skillsSection.split(/[,•\-\*\n]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 1 && skill.length < 30);

    // Strategy 2: Line by line
    const lineSkills = skillsSection.split('\n')
      .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
      .filter(skill => skill.length > 1 && skill.length < 30);

    // Strategy 3: Common tech skills pattern matching
    const techSkillsPattern = /\b(JavaScript|Python|Java|React|Node\.js|SQL|HTML|CSS|Git|AWS|Docker|Kubernetes|TypeScript|Angular|Vue|PHP|C\+\+|C#|Ruby|Go|Swift|Kotlin|MongoDB|PostgreSQL|MySQL|Redis|GraphQL|REST|API|Agile|Scrum|DevOps|CI\/CD|Linux|Windows|macOS|Photoshop|Illustrator|Figma|Sketch|Excel|PowerPoint|Word|Salesforce|HubSpot|Google Analytics|SEO|SEM|PPC|Social Media|Marketing|Sales|Project Management|Leadership|Communication|Problem Solving|Team Work|Critical Thinking|Time Management|Analytical|Creative|Detail Oriented|Multitasking|Adaptable|Collaborative|Innovative|Strategic|Results Driven)\b/gi;
    const techMatches = skillsSection.match(techSkillsPattern) || [];

    // Combine and deduplicate
    skills = [...new Set([...commaSkills, ...lineSkills, ...techMatches])]
      .filter(skill => skill.length > 1 && skill.length < 30)
      .slice(0, 25);

    result.skills = skills;
  }

  // Enhanced experience extraction
  const experienceSection = extractSection(text, [
    'experience', 'work experience', 'employment', 'professional experience',
    'career history', 'work history', 'employment history'
  ]);

  if (experienceSection) {
    const experiences = parseExperience(experienceSection);
    result.experience = experiences;
  }

  // Enhanced education extraction
  const educationSection = extractSection(text, [
    'education', 'academic background', 'qualifications', 'degrees',
    'certifications', 'academic qualifications'
  ]);

  if (educationSection) {
    const education = parseEducation(educationSection);
    result.education = education;
  }

  return result;
}

function parseExperience(experienceText: string): Array<{
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}> {
  const experiences: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }> = [];

  // Split by common job separators
  const jobBlocks = experienceText.split(/\n\s*\n|\n(?=[A-Z][^a-z]*[A-Z])/);

  for (const block of jobBlocks) {
    if (block.trim().length < 10) continue;

    const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 2) continue;

    const experience = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    };

    // Try to identify position and company
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i];

      // Look for date patterns
      const dateMatch = line.match(/(\d{4}|\w+\s+\d{4}|\d{1,2}\/\d{4})/g);
      if (dateMatch && dateMatch.length >= 1) {
        experience.startDate = dateMatch[0];
        if (dateMatch.length >= 2) {
          experience.endDate = dateMatch[1];
        } else if (line.toLowerCase().includes('present') || line.toLowerCase().includes('current')) {
          experience.endDate = 'Present';
        }
        continue;
      }

      // First non-date line is likely position
      if (!experience.position && !dateMatch) {
        experience.position = line;
      } else if (!experience.company && !dateMatch && experience.position) {
        experience.company = line;
      }
    }

    // Remaining lines are description
    const descriptionLines = lines.slice(2).filter(line =>
      !line.match(/(\d{4}|\w+\s+\d{4}|\d{1,2}\/\d{4})/) &&
      line.length > 10
    );
    experience.description = descriptionLines.join(' ');

    if (experience.position || experience.company) {
      experiences.push(experience);
    }
  }

  return experiences.slice(0, 5); // Limit to 5 experiences
}

function parseEducation(educationText: string): Array<{
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
}> {
  const education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
  }> = [];

  // Split by common education separators
  const eduBlocks = educationText.split(/\n\s*\n|\n(?=[A-Z][^a-z]*[A-Z])/);

  for (const block of eduBlocks) {
    if (block.trim().length < 10) continue;

    const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 1) continue;

    const edu = {
      institution: '',
      degree: '',
      field: '',
      graduationDate: ''
    };

    for (const line of lines) {
      // Look for graduation date
      const dateMatch = line.match(/(\d{4}|\w+\s+\d{4})/);
      if (dateMatch) {
        edu.graduationDate = dateMatch[0];
      }

      // Look for degree patterns
      const degreePatterns = [
        /\b(Bachelor|Master|PhD|Doctorate|Associate|Certificate|Diploma|B\.?A\.?|B\.?S\.?|M\.?A\.?|M\.?S\.?|Ph\.?D\.?)\b/i,
        /\b(Bachelor of|Master of|Doctor of)\s+([^,\n]+)/i
      ];

      for (const pattern of degreePatterns) {
        const match = line.match(pattern);
        if (match && !edu.degree) {
          edu.degree = match[0];
          // Try to extract field
          const fieldMatch = line.match(/(?:in|of)\s+([^,\n]+)/i);
          if (fieldMatch) {
            edu.field = fieldMatch[1].trim();
          }
          break;
        }
      }

      // Institution is usually the longest line without degree/date info
      if (!edu.institution && line.length > 10 &&
          !line.match(/\b(Bachelor|Master|PhD|Doctorate|Associate|Certificate|Diploma)\b/i) &&
          !line.match(/\d{4}/)) {
        edu.institution = line;
      }
    }

    if (edu.institution || edu.degree) {
      education.push(edu);
    }
  }

  return education.slice(0, 3); // Limit to 3 education entries
}

function extractSection(text: string, sectionNames: string[]): string {
  const lines = text.split('\n');

  for (const sectionName of sectionNames) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(sectionName.toLowerCase())) {
        // Found section header, extract content until next section
        const sectionContent = [];
        for (let j = i + 1; j < lines.length; j++) {
          const line = lines[j].trim();
          if (line.length === 0) continue;

          // Stop if we hit another section header
          if (isLikelySectionHeader(line)) break;

          sectionContent.push(line);
          if (sectionContent.length > 10) break; // Limit section size
        }
        return sectionContent.join('\n');
      }
    }
  }

  return '';
}

function isLikelySectionHeader(line: string): boolean {
  const commonHeaders = [
    'experience', 'education', 'skills', 'summary', 'objective',
    'work experience', 'employment', 'qualifications', 'certifications',
    'projects', 'achievements', 'awards'
  ];

  const lowerLine = line.toLowerCase();
  return commonHeaders.some(header => lowerLine.includes(header)) && line.length < 50;
}

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/utils/rateLimit';
import {
  getOpenAIKey,
  openAIErrorResponse,
  parseJsonBody,
  rateLimitResponse,
} from '@/utils/apiHelpers';
import { MAX_JOB_DESCRIPTION_CHARS, MAX_RESUME_CHARS } from '@/config/apiLimits';

export async function POST(request: NextRequest) {
  try {
    // Rate limit before doing any work — this route can spend the server's OpenAI key
    const rateLimit = checkRateLimit(request, { limit: 10, windowMs: 60000, bucket: 'format-resume' });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    const parsedBody = await parseJsonBody<{ resume?: unknown; jobDescription?: unknown }>(request);
    if (parsedBody.errorResponse) {
      return parsedBody.errorResponse;
    }
    const { resume, jobDescription } = parsedBody.body;

    if (!resume || typeof resume !== 'string' || !jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json(
        { error: 'Resume and job description are required' },
        { status: 400 }
      );
    }

    if (resume.length > MAX_RESUME_CHARS) {
      return NextResponse.json(
        { error: `Resume is too long. Maximum is ${MAX_RESUME_CHARS.toLocaleString()} characters.` },
        { status: 413 }
      );
    }

    if (jobDescription.length > MAX_JOB_DESCRIPTION_CHARS) {
      return NextResponse.json(
        { error: `Job description is too long. Maximum is ${MAX_JOB_DESCRIPTION_CHARS.toLocaleString()} characters.` },
        { status: 413 }
      );
    }

    // Get API key from Authorization header or environment
    const apiKey = getOpenAIKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 401 }
      );
    }

    // Initialize OpenAI client with the provided API key
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) specialist and professional resume writer with deep knowledge of:
- Modern ATS algorithms and keyword optimization
- Industry-specific requirements and terminology
- Professional resume formatting standards
- Achievement quantification and impact metrics
- Recruiter psychology and screening patterns

Your task is to analyze and optimize resumes to maximize their match with specific job descriptions while maintaining authenticity and professionalism.`;

    const userPrompt = `
    Please analyze and optimize the following resume to perfectly match the job description provided. Follow this comprehensive process:

    1. DEEP JOB ANALYSIS:
    - Extract core requirements, skills, and qualifications
    - Identify primary and secondary keywords
    - Note specific industry terminology and tools
    - Understand the company's priorities from the language used
    - Recognize both explicit and implicit requirements

    2. RESUME EVALUATION:
    - Compare existing skills and experiences with job requirements
    - Identify alignment opportunities in the candidate's background
    - Note areas where experience could be better presented
    - Find potential skill gaps and transferable skills

    3. STRATEGIC OPTIMIZATION:
    - Reorganize content to prioritize most relevant experiences
    - Mirror the job description's language and terminology
    - Transform generic statements into job-specific achievements
    - Quantify results and impacts wherever possible
    - Incorporate ATS-friendly keywords naturally
    - Ensure all critical job requirements are addressed
    - Add relevant technical skills and certifications prominently

    4. ATS OPTIMIZATION:
    - Use standard section headings
    - Incorporate primary keywords in context
    - Ensure proper formatting for ATS parsing
    - Balance keyword optimization with readability
    - Include both abbreviated and full versions of technical terms

    5. PROVIDE DETAILED ANALYSIS:
    - Calculate match percentage based on key requirements
    - List all matching skills found in both documents
    - Identify important missing skills or qualifications
    - Detail all optimization changes made
    - Suggest areas for candidate's future development

    Job Description:
    ${jobDescription}

    Original Resume:
    ${resume}

    Format the response as a JSON object with:
    {
      "optimizedResume": "the professionally formatted and optimized resume content",
      "matchScore": number (calculated based on key requirement matches),
      "changes": ["detailed list of strategic changes made"],
      "matchingSkills": ["all matching skills and keywords found"],
      "missingSkills": ["critical skills from job description not found in resume"]
    }

    Ensure the optimizedResume maintains a professional format with clear sections for:
    - Professional Summary (tailored to the role)
    - Work Experience (with quantified achievements)
    - Skills (organized by relevance)
    - Education & Certifications
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4096,
    });

    if (completion.choices[0].finish_reason === 'length') {
      return NextResponse.json(
        { error: 'The resume is too long to optimize in one pass. Please shorten it and try again.' },
        { status: 422 }
      );
    }

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI model');
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 502 }
      );
    }

    // Validate the shape before responding; normalize missing fields to sane defaults
    if (typeof parsed.optimizedResume !== 'string' || parsed.optimizedResume.length === 0) {
      return NextResponse.json(
        { error: 'AI returned an invalid response. Please try again.' },
        { status: 502 }
      );
    }

    const response = {
      optimizedResume: parsed.optimizedResume,
      matchScore: typeof parsed.matchScore === 'number' ? parsed.matchScore : 0,
      changes: Array.isArray(parsed.changes) ? parsed.changes : [],
      matchingSkills: Array.isArray(parsed.matchingSkills) ? parsed.matchingSkills : [],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in resume formatting:', error);

    const openAIError = openAIErrorResponse(error);
    if (openAIError) {
      return openAIError;
    }

    return NextResponse.json(
      { error: 'Failed to format resume' },
      { status: 500 }
    );
  }
}

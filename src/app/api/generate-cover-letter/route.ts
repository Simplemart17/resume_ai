import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/utils/rateLimit';

const MAX_RESUME_CHARS = 20000;
const MAX_JOB_DESCRIPTION_CHARS = 10000;
const MAX_TITLE_COMPANY_CHARS = 200;

export async function POST(request: NextRequest) {
  try {
    // Rate limit before doing any work — this route can spend the server's OpenAI key
    const rateLimit = checkRateLimit(request, { limit: 10, windowMs: 60000, bucket: 'generate-cover-letter' });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    let body: { jobTitle?: unknown; company?: unknown; jobDescription?: unknown; resume?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    const { jobTitle, company, jobDescription, resume } = body;

    if (!jobTitle || typeof jobTitle !== 'string' ||
        !company || typeof company !== 'string' ||
        !jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json(
        { error: 'Job title, company, and job description are required' },
        { status: 400 }
      );
    }

    if (resume !== undefined && resume !== null && typeof resume !== 'string') {
      return NextResponse.json(
        { error: 'Resume must be a string' },
        { status: 400 }
      );
    }

    if (jobTitle.length > MAX_TITLE_COMPANY_CHARS || company.length > MAX_TITLE_COMPANY_CHARS) {
      return NextResponse.json(
        { error: `Job title and company must each be at most ${MAX_TITLE_COMPANY_CHARS} characters.` },
        { status: 413 }
      );
    }

    if (jobDescription.length > MAX_JOB_DESCRIPTION_CHARS) {
      return NextResponse.json(
        { error: `Job description is too long. Maximum is ${MAX_JOB_DESCRIPTION_CHARS.toLocaleString()} characters.` },
        { status: 413 }
      );
    }

    if (typeof resume === 'string' && resume.length > MAX_RESUME_CHARS) {
      return NextResponse.json(
        { error: `Resume is too long. Maximum is ${MAX_RESUME_CHARS.toLocaleString()} characters.` },
        { status: 413 }
      );
    }

    // Get API key from Authorization header or environment
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1] || process.env.OPENAI_API_KEY;

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

    const resumeSection = typeof resume === 'string' && resume.trim().length > 0
      ? `
    The candidate's resume is provided below. Base the letter on the candidate's ACTUAL experience,
    skills, and achievements from this resume — do not invent experience that is not present in it:
    ${resume}
    `
      : '';

    const prompt = `Write a professional cover letter for a ${jobTitle} position at ${company}.
    Use the following job description to tailor the cover letter:
    ${jobDescription}
    ${resumeSection}
    The cover letter should:
    1. Be professionally formatted with proper spacing and paragraphs
    2. Show enthusiasm for the role and company
    3. Highlight relevant skills and experience that match the job requirements
    4. Include a strong opening and closing
    5. Be concise but comprehensive
    6. Use formal business letter tone
    7. Format the response in HTML with appropriate tags for structure

    Do not include a header with personal contact information.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert cover letter writer with deep knowledge of professional writing, industry standards, and effective communication. Your goal is to create compelling, tailored cover letters that effectively match candidates with job requirements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    if (completion.choices[0].finish_reason === 'length') {
      return NextResponse.json(
        { error: 'The generated cover letter was cut off. Please try a shorter job description or resume.' },
        { status: 422 }
      );
    }

    const coverLetter = completion.choices[0].message.content;

    if (!coverLetter) {
      throw new Error('Failed to generate cover letter');
    }

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error('Error in cover letter generation:', error);

    if (error instanceof OpenAI.APIError) {
      const status = error.status ?? 500;
      let message = `OpenAI API error: ${error.message}`;
      if (status === 401) {
        message = 'Invalid or missing OpenAI API key';
      } else if (status === 429) {
        message = 'OpenAI rate limit or quota exceeded. Please try again later.';
      }
      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json(
      { error: 'Failed to generate cover letter. Please try again.' },
      { status: 500 }
    );
  }
}

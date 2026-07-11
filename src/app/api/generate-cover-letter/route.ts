import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/utils/rateLimit';
import {
  getBearerKey,
  openAIErrorResponse,
  parseJsonBody,
  rateLimitResponse,
} from '@/utils/apiHelpers';
import {
  MAX_JOB_DESCRIPTION_CHARS,
  MAX_RESUME_CHARS,
  MAX_TITLE_COMPANY_CHARS,
} from '@/config/apiLimits';
import { consumeAiQuota, getEntitlement } from '@/lib/entitlements';
import { isClerkConfigured } from '@/lib/entitlements';
import { isPaidTier } from '@/lib/tiers';

/**
 * Resolves the OpenAI key this request may use.
 * - BYOK (Authorization: Bearer <key>) is always allowed, free, and unmetered.
 * - Otherwise the SERVER key is gated: signed-in paid tier + monthly quota.
 * - Dev/OSS mode: when Supabase is not configured at all there are no
 *   accounts to gate on, so we keep the legacy behavior and use the server
 *   env key directly, ungated — local dev without accounts keeps working.
 * NOTE: duplicated in format-resume/route.ts — keep the two in sync.
 */
async function resolveOpenAIKey(
  request: NextRequest
): Promise<{ apiKey: string; errorResponse?: never } | { apiKey?: never; errorResponse: NextResponse }> {
  const bearerKey = getBearerKey(request);
  if (bearerKey) {
    return { apiKey: bearerKey };
  }

  if (!isClerkConfigured()) {
    const envKey = process.env.OPENAI_API_KEY;
    if (envKey) return { apiKey: envKey };
    return {
      errorResponse: NextResponse.json({ error: 'OpenAI API key is required' }, { status: 401 }),
    };
  }

  const { userId, tier } = await getEntitlement();
  if (!userId) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Add your own OpenAI API key, or sign in with a Pro or Enterprise plan to use ours.' },
        { status: 401 }
      ),
    };
  }
  if (!isPaidTier(tier)) {
    return {
      errorResponse: NextResponse.json(
        { error: 'AI without an API key requires a Pro or Enterprise plan ($2/$5 one-time), or add your own OpenAI API key.' },
        { status: 403 }
      ),
    };
  }

  const quota = await consumeAiQuota(userId, tier);
  if (!quota.allowed) {
    return {
      errorResponse: NextResponse.json(
        { error: `You've used all ${quota.quota} included AI operations this month. They reset next month — or add your own OpenAI API key for unlimited use.` },
        { status: 429 }
      ),
    };
  }

  const envKey = process.env.OPENAI_API_KEY;
  if (!envKey) {
    return {
      errorResponse: NextResponse.json(
        { error: 'AI is not configured on this server' },
        { status: 503 }
      ),
    };
  }
  return { apiKey: envKey };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit before doing any work — this route can spend the server's OpenAI key
    const rateLimit = checkRateLimit(request, { limit: 10, windowMs: 60000, bucket: 'generate-cover-letter' });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    const parsedBody = await parseJsonBody<{
      jobTitle?: unknown;
      company?: unknown;
      jobDescription?: unknown;
      resume?: unknown;
    }>(request);
    if (parsedBody.errorResponse) {
      return parsedBody.errorResponse;
    }
    const { jobTitle, company, jobDescription, resume } = parsedBody.body;

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

    // Resolve the key AFTER validation so invalid requests never burn quota:
    // user's own key (free), or the server key gated by paid-tier quota.
    const keyResult = await resolveOpenAIKey(request);
    if (keyResult.errorResponse) {
      return keyResult.errorResponse;
    }
    const apiKey = keyResult.apiKey;

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

    const openAIError = openAIErrorResponse(error);
    if (openAIError) {
      return openAIError;
    }

    return NextResponse.json(
      { error: 'Failed to generate cover letter. Please try again.' },
      { status: 500 }
    );
  }
}

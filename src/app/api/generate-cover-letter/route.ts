import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, company, jobDescription } = await request.json();

    // Get API key from Authorization header or environment
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '') || process.env.OPENAI_API_KEY;

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

    if (!jobTitle || !company || !jobDescription) {
      return NextResponse.json(
        { error: 'Job title, company, and job description are required' },
        { status: 400 }
      );
    }

    const prompt = `Write a professional cover letter for a ${jobTitle} position at ${company}.
    Use the following job description to tailor the cover letter:
    ${jobDescription}

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
      model: "gpt-4-turbo-preview",
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
      max_tokens: 1000,
    });

    const coverLetter = completion.choices[0].message.content;

    if (!coverLetter) {
      throw new Error('Failed to generate cover letter');
    }

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error('Error in cover letter generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter. Please try again.' },
      { status: 500 }
    );
  }
}
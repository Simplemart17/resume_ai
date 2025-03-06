import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { resume, jobDescription } = await request.json();

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume and job description are required' },
        { status: 400 }
      );
    }

    const prompt = `
      As an expert resume optimizer, analyze the following resume and job description.
      Provide an optimized version of the resume that:
      1. Highlights relevant skills and experiences that match the job requirements
      2. Uses industry-specific keywords from the job description
      3. Quantifies achievements where possible
      4. Maintains a professional and concise tone
      5. Follows best practices for resume formatting

      Job Description:
      ${jobDescription}

      Original Resume:
      ${resume}

      Please provide the optimized resume in a clear, well-formatted structure.
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert resume optimizer with deep knowledge of various industries and current hiring practices."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
    });

    const formattedResume = completion.choices[0].message.content;

    return NextResponse.json({ formattedResume });
  } catch (error) {
    console.error('Error in resume formatting:', error);
    return NextResponse.json(
      { error: 'Failed to format resume' },
      { status: 500 }
    );
  }
} 
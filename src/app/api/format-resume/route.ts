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

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) and resume optimization specialist with deep knowledge of various industries and current hiring practices. Your task is to analyze and optimize resumes to maximize their match with job descriptions.`;

    const userPrompt = `
    Please analyze and optimize the following resume to match the job description provided. Follow these steps:

    1. ANALYSIS:
    - Identify key requirements and skills from the job description
    - Analyze how well the current resume matches these requirements
    - Note any missing key skills or experiences

    2. OPTIMIZATION:
    - Rewrite the resume to highlight relevant experiences and skills
    - Add industry-specific keywords from the job description
    - Quantify achievements where possible
    - Ensure ATS-friendly formatting
    - Maintain professional tone and clarity

    3. PROVIDE:
    - A score out of 100 for how well the optimized resume matches the job
    - Brief explanation of major changes made
    - List of key matching skills

    Job Description:
    ${jobDescription}

    Original Resume:
    ${resume}

    Please format the response as a JSON object with the following structure:
    {
      "optimizedResume": "the formatted resume content",
      "matchScore": number,
      "changes": ["list of major changes"],
      "matchingSkills": ["list of matching skills"],
      "missingSkills": ["list of important missing skills"]
    }
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI model');
    }

    const response = JSON.parse(content);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in resume formatting:', error);
    return NextResponse.json(
      { error: 'Failed to format resume' },
      { status: 500 }
    );
  }
} 
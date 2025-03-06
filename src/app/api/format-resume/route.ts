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
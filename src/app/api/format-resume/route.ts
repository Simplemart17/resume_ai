import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { resume, jobDescription } = await request.json();



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
      // model: "gpt-4o",
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

    // Provide more specific error messages
    let errorMessage = 'Failed to format resume';

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid or missing OpenAI API key';
      } else if (error.message.includes('quota')) {
        errorMessage = 'OpenAI API quota exceeded. Please check your billing.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again in a moment.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Failed to parse AI response. Please try again.';
      } else {
        errorMessage = `AI processing error: ${error.message}`;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
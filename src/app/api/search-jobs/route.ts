import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jobCache from '@/utils/cache';
import { JOB_API } from '@/config/jobApis';

// Define the interface for job postings
interface JobPosting {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  date: string;
}

// Adzuna API response types
interface AdzunaJob {
  title: string;
  company: { display_name: string };
  location: { display_name: string; area: string[] };
  description: string;
  redirect_url: string;
  created: string;
  salary_min?: number;
  salary_max?: number;
  category: { label: string };
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

// In-memory rate limiting store
const rateLimitStore: Record<string, { count: number, timestamp: number }> = {};

// Clear expired rate limit entries every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (now - rateLimitStore[key].timestamp > 3600000) {
      delete rateLimitStore[key];
    }
  });
}, 3600000);

// Check if the user has exceeded rate limits
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  if (rateLimitStore[ip] && (now - rateLimitStore[ip].timestamp) < 60000) {
    if (rateLimitStore[ip].count >= 5) {
      return true;
    }
    rateLimitStore[ip].count += 1;
  } else {
    rateLimitStore[ip] = { count: 1, timestamp: now };
  }
  
  return false;
}

// Function to normalize Adzuna job data
function normalizeJobData(data: AdzunaResponse): JobPosting[] {
  return data.results.map(job => ({
    title: job.title,
    company: job.company.display_name,
    location: job.location.display_name,
    description: job.description,
    url: job.redirect_url,
    date: new Date(job.created).toLocaleDateString(),
    // Additional fields available but not used in current interface:
    // salary_range: job.salary_min && job.salary_max ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}` : undefined,
    // category: job.category.label
  }));
}

// Function to fetch jobs using Adzuna API
async function fetchJobs(keywords: string, location: string): Promise<JobPosting[]> {
  const params = JOB_API.buildSearchParams(keywords, location);
  const url = `${JOB_API.baseUrl}/${JOB_API.country}/search/1`; // Page 1 of results

  try {
    const response = await axios.get<AdzunaResponse>(url, {
      params,
      headers: JOB_API.headers,
      timeout: 10000
    });

    if (!response.data || !response.data.results) {
      throw new Error('Empty response from API');
    }

    return normalizeJobData(response.data);
  } catch (error) {
    console.error('Error fetching from Adzuna API:', error);
    throw new Error('Failed to fetch jobs. Please try again later.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { keywords, location } = await request.json();
    
    if (!keywords) {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }
    
    // Check rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Check cache first
    const cacheKey = jobCache.generateKey('adzuna', keywords, location || '');
    const cachedJobs = jobCache.get(cacheKey) as JobPosting[] | null;
    
    if (cachedJobs) {
      console.log(`Returning cached results for ${keywords}`);
      return NextResponse.json({ 
        jobs: cachedJobs,
        source: 'Adzuna (cached)'
      });
    }
    
    try {
      // Fetch jobs using Adzuna API
      console.log(`Searching for ${keywords} jobs...`);
      const jobs = await fetchJobs(keywords, location);
      
      if (jobs.length === 0) {
        return NextResponse.json(
          { error: 'No jobs found. Try different keywords or location.' },
          { status: 404 }
        );
      }
      
      // Cache the results
      jobCache.set(cacheKey, jobs);
      
      return NextResponse.json({ 
        jobs,
        source: 'Adzuna'
      });
    } catch (error) {
      console.error('API error:', error);
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Failed to fetch jobs. Please try again later.'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in job search API:', error);
    return NextResponse.json(
      { error: 'Failed to process job search request' },
      { status: 500 }
    );
  }
} 
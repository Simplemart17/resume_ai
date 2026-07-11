import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jobCache from '@/utils/cache';
import { JOB_API } from '@/config/jobApis';
import { checkRateLimit } from '@/utils/rateLimit';
import { parseJsonBody, rateLimitResponse } from '@/utils/apiHelpers';

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
  title?: string;
  company?: { display_name?: string };
  location?: { display_name?: string; area?: string[] };
  description?: string;
  redirect_url?: string;
  created?: string;
  salary_min?: number;
  salary_max?: number;
  category?: { label?: string };
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

// Function to normalize Adzuna job data
function normalizeJobData(data: AdzunaResponse): JobPosting[] {
  return data.results.map(job => ({
    title: job.title ?? 'Untitled position',
    company: job.company?.display_name ?? 'Unknown company',
    location: job.location?.display_name ?? 'Location not specified',
    description: job.description ?? '',
    url: job.redirect_url ?? '',
    date: job.created ? new Date(job.created).toLocaleDateString() : '',
    // Additional fields available but not used in current interface:
    // salary_range: job.salary_min && job.salary_max ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}` : undefined,
    // category: job.category?.label
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
    if (axios.isAxiosError(error)) {
      console.error(
        `Error fetching from Adzuna API (status: ${error.response?.status ?? 'no response'}):`,
        error.message
      );
    } else {
      console.error('Error fetching from Adzuna API:', error);
    }
    throw new Error('Failed to fetch jobs. Please try again later.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsedBody = await parseJsonBody<{ keywords?: unknown; location?: unknown }>(request);
    if (parsedBody.errorResponse) {
      return parsedBody.errorResponse;
    }
    const { keywords, location } = parsedBody.body;

    if (!keywords || typeof keywords !== 'string') {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimit = checkRateLimit(request, { limit: 5, windowMs: 60000, bucket: 'search-jobs' });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    // Fail fast when the server is missing Adzuna credentials
    if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
      return NextResponse.json(
        { error: 'Job search is not configured on this server' },
        { status: 500 }
      );
    }

    const searchLocation = typeof location === 'string' ? location : '';

    // Check cache first
    const cacheKey = jobCache.generateKey('adzuna', keywords, searchLocation);
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
      const jobs = await fetchJobs(keywords, searchLocation);

      // Zero results is a valid outcome — return 200 with an empty list, but
      // don't cache it: a transient empty upstream response would otherwise
      // negative-cache this search for the full 1-hour TTL.
      if (jobs.length > 0) {
        jobCache.set(cacheKey, jobs);
      }

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
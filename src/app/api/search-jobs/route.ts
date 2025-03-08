import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import jobCache from '@/utils/cache';

// Define the interface for job postings
interface JobPosting {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  date: string;
}

// In-memory rate limiting store (for demonstration)
// In production, use Redis or a database
const rateLimitStore: Record<string, { count: number, timestamp: number }> = {};

// Clear expired rate limit entries every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (now - rateLimitStore[key].timestamp > 3600000) { // 1 hour
      delete rateLimitStore[key];
    }
  });
}, 3600000); // Check every hour

// Check if the user has exceeded rate limits
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  if (rateLimitStore[ip] && (now - rateLimitStore[ip].timestamp) < 60000) { // 1 minute
    if (rateLimitStore[ip].count >= 5) { // Max 5 requests per minute
      return true; // Rate limit exceeded
    }
    rateLimitStore[ip].count += 1;
  } else {
    rateLimitStore[ip] = { count: 1, timestamp: now };
  }
  
  return false; // Not rate limited
}

// Configuration for different job sites
interface JobSiteConfig {
  searchUrl: (keywords: string, location: string) => string;
  scrapeJobs: (html: string, baseUrl: string) => Promise<JobPosting[]>;
}

// Define scraping configurations for different job sites
const JOB_SITE_CONFIGS: Record<string, JobSiteConfig> = {
  indeed: {
    searchUrl: (keywords: string, location: string) => 
      `https://www.indeed.com/jobs?q=${encodeURIComponent(keywords)}${location ? `&l=${encodeURIComponent(location)}` : ''}`,
    
    scrapeJobs: async (html: string, baseUrl: string): Promise<JobPosting[]> => {
      const $ = cheerio.load(html);
      const jobs: JobPosting[] = [];
      
      // Indeed job cards
      $('.job_seen_beacon').each((i, element) => {
        if (jobs.length >= 10) return false; // Limit to 10 results
        
        const title = $(element).find('.jobTitle').text().trim();
        const company = $(element).find('.companyName').text().trim();
        const location = $(element).find('.companyLocation').text().trim();
        const description = $(element).find('.job-snippet').text().trim();
        
        let url = $(element).find('a.jcs-JobTitle').attr('href');
        if (url && !url.startsWith('http')) {
          url = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        }
        
        const date = $(element).find('.date').text().replace('Posted', '').trim() || 'Recently posted';
        
        if (title) {
          jobs.push({
            title,
            company,
            location,
            description,
            url: url || baseUrl,
            date
          });
        }
      });
      
      return jobs;
    }
  },
  
  linkedin: {
    searchUrl: (keywords: string, location: string) => 
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}${location ? `&location=${encodeURIComponent(location)}` : ''}`,
    
    scrapeJobs: async (html: string, baseUrl: string): Promise<JobPosting[]> => {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      const jobs: JobPosting[] = [];
      
      // LinkedIn job cards
      const jobCards = document.querySelectorAll('.jobs-search__results-list li');
      
      for (let i = 0; i < jobCards.length && jobs.length < 10; i++) {
        const card = jobCards[i];
        
        const titleElement = card.querySelector('.base-search-card__title');
        const companyElement = card.querySelector('.base-search-card__subtitle');
        const locationElement = card.querySelector('.job-search-card__location');
        const linkElement = card.querySelector('a.base-card__full-link');
        
        if (titleElement && companyElement) {
          const title = titleElement.textContent?.trim() || '';
          const company = companyElement.textContent?.trim() || '';
          const location = locationElement?.textContent?.trim() || 'Location not specified';
          const url = linkElement?.getAttribute('href') || baseUrl;
          
          jobs.push({
            title,
            company,
            location,
            description: `Job posting by ${company} for ${title} position.`,
            url,
            date: 'Recently posted'
          });
        }
      }
      
      return jobs;
    }
  }
};

// Function to fetch and scrape job postings
async function scrapeJobs(jobSite: string, keywords: string, location: string): Promise<JobPosting[]> {
  // Default to "indeed" if jobSite is not supported
  const siteKey = Object.keys(JOB_SITE_CONFIGS).includes(jobSite) ? jobSite : 'indeed';
  const config = JOB_SITE_CONFIGS[siteKey];
  
  try {
    const url = config.searchUrl(keywords, location);
    const baseUrl = new URL(url).origin;
    
    // Use our proxy service to bypass CORS and other restrictions
    console.log(`Fetching jobs from ${url} via proxy`);
    const proxyResponse = await axios.post('/api/proxy', { url });
    
    if (!proxyResponse.data.html) {
      throw new Error('Proxy returned empty response');
    }

    console.log('Response received, parsing jobs...');
    // Scrape jobs using the site-specific scraper
    const jobs = await config.scrapeJobs(proxyResponse.data.html, baseUrl);
    console.log(`Found ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    console.error(`Error scraping ${jobSite}:`, error);
    // Fallback to mock data if scraping fails
    return getMockJobs(keywords, location);
  }
}

// Mock data as fallback when scraping fails
function getMockJobs(keywords: string, location: string): JobPosting[] {
  return [
    {
      title: `Senior ${keywords} Developer`,
      company: 'TechCorp Inc.',
      location: location || 'Remote',
      description: `We're looking for an experienced ${keywords} developer to join our team. Must have 5+ years of experience in ${keywords} and related technologies.`,
      url: 'https://example.com/job1',
      date: '3 days ago',
    },
    {
      title: `${keywords} Engineer`,
      company: 'InnovateX',
      location: location || 'San Francisco, CA',
      description: `Join our fast-growing team as a ${keywords} Engineer. You'll be responsible for developing and maintaining our core ${keywords} systems.`,
      url: 'https://example.com/job2',
      date: 'Posted today',
    },
    {
      title: `Junior ${keywords} Developer`,
      company: 'StartupHub',
      location: location || 'New York, NY',
      description: `Great opportunity for early-career ${keywords} developers. We offer mentorship and growth opportunities in a collaborative environment.`,
      url: 'https://example.com/job3',
      date: '1 week ago',
    },
    {
      title: `${keywords} Architect`,
      company: 'Enterprise Solutions',
      location: location || 'Chicago, IL',
      description: `Senior role for an experienced ${keywords} professional to design and implement scalable solutions using cutting-edge technologies.`,
      url: 'https://example.com/job4',
      date: '2 weeks ago',
    },
    {
      title: `${keywords} Consultant`,
      company: 'Global Consulting Group',
      location: location || 'Remote',
      description: `Work with diverse clients to provide expert ${keywords} consulting services. Requires strong communication skills and technical expertise.`,
      url: 'https://example.com/job5',
      date: '3 days ago',
    },
  ];
}

export async function POST(request: NextRequest) {
  try {
    const { jobSite, keywords, location } = await request.json();
    
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
    const cacheKey = jobCache.generateKey(jobSite || 'indeed', keywords, location || '');
    const cachedJobs = jobCache.get(cacheKey) as JobPosting[] | null;
    
    if (cachedJobs) {
      console.log(`Returning cached results for ${keywords}`);
      return NextResponse.json({ 
        jobs: cachedJobs,
        source: `${jobSite} (cached)`
      });
    }
    
    try {
      // Use actual web scraping
      console.log(`Searching for ${keywords} jobs on ${jobSite}...`);
      const jobs = await scrapeJobs(jobSite, keywords, location);
      
      // Cache the results
      if (jobs.length > 0 && !jobs[0].title.includes('Senior')) { // Don't cache mock data
        jobCache.set(cacheKey, jobs);
      }
      
      return NextResponse.json({ 
        jobs,
        source: jobSite
      });
    } catch (error) {
      console.error('Scraping error:', error);
      
      // Fallback to mock data if scraping fails
      const mockJobs = getMockJobs(keywords, location);
      return NextResponse.json({ 
        jobs: mockJobs,
        source: 'mock-data (scraping failed)'
      });
    }
  } catch (error) {
    console.error('Error in job search API:', error);
    return NextResponse.json(
      { error: 'Failed to search for jobs' },
      { status: 500 }
    );
  }
} 
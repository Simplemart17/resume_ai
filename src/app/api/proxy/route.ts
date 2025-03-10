import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

// List of allowed domains for proxy requests
const ALLOWED_DOMAINS = [
  'indeed.com',
  'www.indeed.com',
  'linkedin.com',
  'www.linkedin.com',
  'glassdoor.com',
  'www.glassdoor.com',
  'www.wellfound.com',
  'wellfound.com',
];

// List of rotating user agents to mimic different browsers
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/122.0.2365.92'
];

// Get a random user agent
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Site-specific headers
const SITE_HEADERS: Record<string, Record<string, string>> = {
  'glassdoor.com': {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
  },
  'monster.com': {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none'
  },
  'ziprecruiter.com': {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none'
  }
};

// In-memory rate limiting store (for demonstration)
// In production, use Redis or a database
const rateLimitStore: Record<string, { count: number, timestamp: number }> = {};

// Check if the user has exceeded rate limits
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  if (rateLimitStore[ip] && (now - rateLimitStore[ip].timestamp) < 60000) { // 1 minute
    if (rateLimitStore[ip].count >= 10) { // Max 10 proxy requests per minute
      return true; // Rate limit exceeded
    }
    rateLimitStore[ip].count += 1;
  } else {
    rateLimitStore[ip] = { count: 1, timestamp: now };
  }
  
  return false; // Not rate limited
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
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
    
    // Validate URL to prevent proxy abuse
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
      console.log(targetUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }
    
    // Check if the domain is allowed
    if (!ALLOWED_DOMAINS.includes(targetUrl.hostname)) {
      return NextResponse.json(
        { error: `Domain "${targetUrl.hostname}" is not allowed for proxy requests` },
        { status: 403 }
      );
    }
    
    // Get site-specific headers
    const siteKey = Object.keys(SITE_HEADERS).find(key => targetUrl.hostname.includes(key));
    const headers = {
      ...{
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      },
      ...(siteKey ? SITE_HEADERS[siteKey] : {})
    };

    // Make the request to the target URL
    console.log(`Proxying request to ${url}`);
    try {
      const response = await axios.get(url, { 
        headers,
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: (status) => status < 400
      });
      
      // Return the HTML content
      if (!response.data || typeof response.data !== 'string') {
        return NextResponse.json(
          { error: 'Invalid response from target site' },
          { status: 502 }
        );
      }
      
      return NextResponse.json({ 
        html: response.data 
      });
    } catch (error) {
      // Handle common axios errors
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNABORTED') {
        return NextResponse.json(
          { error: 'Request to job site timed out. Please try again later.' },
          { status: 504 }
        );
      }
      
      if (axiosError.response) {
        // The server responded with a status code outside the 2xx range
        return NextResponse.json(
          { error: `Job site returned error status: ${axiosError.response.status}` },
          { status: 502 }
        );
      }
      
      return NextResponse.json(
        { error: `Error fetching from job site: ${axiosError.message || 'Unknown error'}` },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error in proxy API:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch content: ${message}` },
      { status: 500 }
    );
  }
} 
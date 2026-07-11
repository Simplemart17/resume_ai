import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { checkRateLimit } from '@/utils/rateLimit';
import { parseJsonBody, rateLimitResponse } from '@/utils/apiHelpers';

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
  }
};

// Maximum response size accepted from the target site (2 MB)
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const parsedBody = await parseJsonBody<{ url?: unknown }>(request);
    if (parsedBody.errorResponse) {
      return parsedBody.errorResponse;
    }
    const { url } = parsedBody.body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimit = checkRateLimit(request, { limit: 10, windowMs: 60000, bucket: 'proxy' });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    // Validate URL to prevent proxy abuse
    if (typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // Only allow HTTPS to prevent SSRF via other protocols/downgrades
    if (targetUrl.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Only https:// URLs are allowed' },
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
        // Do not follow redirects: the allowlist only validates the initial URL,
        // so a redirect could escape it (SSRF).
        maxRedirects: 0,
        maxContentLength: MAX_RESPONSE_BYTES,
        maxBodyLength: MAX_RESPONSE_BYTES,
        validateStatus: (status) => status >= 200 && status < 300
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
        // Redirects are rejected: the domain allowlist only checks the initial URL
        if (axiosError.response.status >= 300 && axiosError.response.status < 400) {
          return NextResponse.json(
            { error: 'Redirects are not supported' },
            { status: 502 }
          );
        }
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
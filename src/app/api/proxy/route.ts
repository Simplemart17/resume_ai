import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// List of allowed domains for proxy requests
const ALLOWED_DOMAINS = [
  'indeed.com',
  'www.indeed.com',
  'linkedin.com',
  'www.linkedin.com',
  'glassdoor.com',
  'www.glassdoor.com'
];

// User agent rotation to avoid being blocked
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1'
];

// Get a random user agent
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

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
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }
    
    // Check if the domain is allowed
    if (!ALLOWED_DOMAINS.includes(targetUrl.hostname)) {
      return NextResponse.json(
        { error: 'Domain not allowed for proxy requests' },
        { status: 403 }
      );
    }
    
    // Set headers to mimic a real browser
    const headers = {
      'User-Agent': getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://www.google.com/',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
    };

    // Make the request to the target URL
    console.log(`Proxying request to ${url}`);
    const response = await axios.get(url, { headers });
    
    // Return the HTML content
    return NextResponse.json({ 
      html: response.data 
    });
  } catch (error) {
    console.error('Error in proxy API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
} 
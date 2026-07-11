import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { checkRateLimit } from '@/utils/rateLimit';

// Shared scaffolding for the API routes. These blocks were previously
// copy-pasted per route and had already diverged (proxy lacked the
// invalid-JSON guard) — change them here, never inline in a route.

type RateLimitResult = ReturnType<typeof checkRateLimit>;

/** Standard 429 response carrying the Retry-After header. */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    { error: 'Rate limit exceeded. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(result.retryAfterSeconds) } }
  );
}

/**
 * Parses the request body as JSON. Returns { body } on success or
 * { errorResponse } (a ready-made 400) when the body is malformed.
 */
export async function parseJsonBody<T>(
  request: NextRequest
): Promise<{ body: T; errorResponse?: never } | { body?: never; errorResponse: NextResponse }> {
  try {
    return { body: (await request.json()) as T };
  } catch {
    return {
      errorResponse: NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 }),
    };
  }
}

/** User-supplied key from the Authorization header, else the server key. */
export function getOpenAIKey(request: NextRequest): string | undefined {
  const authHeader = request.headers.get('authorization');
  return authHeader?.match(/^Bearer\s+(.+)$/i)?.[1] || process.env.OPENAI_API_KEY;
}

/**
 * User-supplied key from the Authorization header ONLY — no env fallback.
 * The AI routes gate the server key behind paid-tier quota, so they must be
 * able to tell a BYOK request apart from one that would spend the server key.
 */
export function getBearerKey(request: NextRequest): string | undefined {
  const authHeader = request.headers.get('authorization');
  return authHeader?.match(/^Bearer\s+(.+)$/i)?.[1] || undefined;
}

/**
 * Maps an OpenAI.APIError to a client-appropriate response, forwarding its
 * status. Returns null for non-OpenAI errors so callers fall through to
 * their own generic handling.
 */
export function openAIErrorResponse(error: unknown): NextResponse | null {
  if (!(error instanceof OpenAI.APIError)) return null;
  const status = error.status ?? 500;
  let message = `OpenAI API error: ${error.message}`;
  if (status === 401) {
    message = 'Invalid or missing OpenAI API key';
  } else if (status === 429) {
    message = 'OpenAI rate limit or quota exceeded. Please try again later.';
  }
  return NextResponse.json({ error: message }, { status });
}

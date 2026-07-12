import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { checkRateLimit } from '@/utils/rateLimit';
import { isClerkConfigured, isClerkMisconfigured } from '@/lib/entitlements';

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

/**
 * User-supplied key from the Authorization header ONLY — no env fallback.
 * AI is bring-your-own-key on every tier, so this header is how a request
 * carries the key it will run on. (There is deliberately NO helper that falls
 * back to process.env.OPENAI_API_KEY: that would hand out the server key
 * ungated.)
 */
export function getBearerKey(request: NextRequest): string | undefined {
  const authHeader = request.headers.get('authorization');
  return authHeader?.match(/^Bearer\s+(.+)$/i)?.[1] || undefined;
}

export type ResolvedOpenAIKey =
  | { apiKey: string; refundQuota: (() => Promise<void>) | null; errorResponse?: never }
  | { apiKey?: never; refundQuota?: never; errorResponse: NextResponse };

/**
 * Resolves the OpenAI key an AI route may use. Call AFTER request validation.
 * AI is bring-your-own-key on every tier — a request must carry the user's key
 * in `Authorization: Bearer <key>`.
 * - BYOK (Bearer) is always allowed, free, and unmetered.
 * - Clerk entirely unconfigured → legacy dev/OSS mode: the server env key,
 *   ungated — local dev without accounts keeps working.
 * - Accounts configured but no Bearer key → 401: bring your own key (no tier
 *   grants server-key AI).
 * - Inconsistent Clerk config → 503: fail loudly rather than serve the server
 *   key ungated.
 * `refundQuota` is always null now (no server-key quota is ever spent); the
 * field is kept so AI routes' refund-on-failure calls stay a harmless no-op.
 */
export async function resolveOpenAIKey(request: NextRequest): Promise<ResolvedOpenAIKey> {
  const bearerKey = getBearerKey(request);
  if (bearerKey) {
    return { apiKey: bearerKey, refundQuota: null };
  }

  if (isClerkMisconfigured()) {
    console.error(
      'resolveOpenAIKey: exactly one of NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY is set — refusing to serve the server key ungated'
    );
    return {
      errorResponse: NextResponse.json(
        { error: 'Accounts are misconfigured on this server. Add your own OpenAI API key, or contact the site operator.' },
        { status: 503 }
      ),
    };
  }

  if (!isClerkConfigured()) {
    // Legacy dev/OSS mode (no accounts): use the server env key ungated.
    const envKey = process.env.OPENAI_API_KEY;
    if (envKey) return { apiKey: envKey, refundQuota: null };
    return {
      errorResponse: NextResponse.json({ error: 'OpenAI API key is required' }, { status: 401 }),
    };
  }

  // Accounts mode: AI is bring-your-own-key on every plan. Without a Bearer
  // key there is no way to run AI, regardless of tier.
  return {
    errorResponse: NextResponse.json(
      { error: 'Add your own OpenAI API key to use AI features.' },
      { status: 401 }
    ),
  };
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

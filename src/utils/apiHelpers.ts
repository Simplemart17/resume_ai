import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/utils/rateLimit';
import { getEntitlement, isClerkConfigured, isClerkMisconfigured } from '@/lib/entitlements';
import { DocumentsUnavailableError } from '@/lib/documents.server';
import type { Tier } from '@/lib/tiers';

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

export type RequireUserResult =
  | { userId: string; tier: Tier; errorResponse?: never }
  | { userId?: never; tier?: never; errorResponse: NextResponse };

/**
 * Shared preamble for authenticated, account-only API routes (the /documents
 * family): rate limit → Clerk config gate → verified Clerk session → tier.
 * Collapses the block otherwise copy-pasted across every handler.
 *
 * Returns the resolved `{ userId, tier }`, or a ready-made `errorResponse`:
 * - 429 when rate limited
 * - 503 when Clerk is misconfigured (exactly one key set) — fail loudly
 * - 503 when accounts aren't configured at all (matches /api/me)
 * - 401 when there is no signed-in user
 * - 503 when the tier lookup is degraded (DB error) — never treat as free
 */
export async function requireUser(
  request: NextRequest,
  bucket: string,
  rateLimitOpts?: { limit?: number; windowMs?: number }
): Promise<RequireUserResult> {
  const rateLimit = checkRateLimit(request, {
    limit: rateLimitOpts?.limit ?? 30,
    windowMs: rateLimitOpts?.windowMs ?? 60000,
    bucket,
  });
  if (!rateLimit.allowed) {
    return { errorResponse: rateLimitResponse(rateLimit) };
  }

  if (isClerkMisconfigured()) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Accounts are misconfigured on this server.' },
        { status: 503 }
      ),
    };
  }

  if (!isClerkConfigured()) {
    // No accounts mode: persistence is unavailable by design. Mirror /api/me's
    // 503 for this state so the client sees one consistent "no accounts" signal.
    return {
      errorResponse: NextResponse.json(
        { error: 'Accounts are not configured' },
        { status: 503 }
      ),
    };
  }

  const { userId, tier, degraded } = await getEntitlement();
  if (!userId) {
    return { errorResponse: NextResponse.json({ error: 'Not signed in' }, { status: 401 }) };
  }
  if (degraded) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Account data is temporarily unavailable' },
        { status: 503 }
      ),
    };
  }

  return { userId, tier };
}

/**
 * Maps an error thrown by the documents data layer to a client response: 503
 * when storage isn't configured, 500 otherwise (message logged, not leaked).
 * Lives here with the other HTTP mappers so the data layer stays HTTP-free.
 */
export function documentsErrorResponse(error: unknown): NextResponse {
  if (error instanceof DocumentsUnavailableError) {
    return NextResponse.json({ error: 'Document storage is not configured' }, { status: 503 });
  }
  console.error('documents route error:', error);
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
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

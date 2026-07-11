import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { checkRateLimit } from '@/utils/rateLimit';
import {
  consumeAiQuota,
  getEntitlement,
  isClerkConfigured,
  isClerkMisconfigured,
  refundAiQuota,
} from '@/lib/entitlements';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { isPaidTier } from '@/lib/tiers';

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
 * The AI routes gate the server key behind paid-tier quota, so they must be
 * able to tell a BYOK request apart from one that would spend the server key.
 * (There is deliberately NO helper that falls back to process.env.OPENAI_API_KEY:
 * that would hand out the server key with no tier or quota gating.)
 */
export function getBearerKey(request: NextRequest): string | undefined {
  const authHeader = request.headers.get('authorization');
  return authHeader?.match(/^Bearer\s+(.+)$/i)?.[1] || undefined;
}

export type ResolvedOpenAIKey =
  | { apiKey: string; refundQuota: (() => Promise<void>) | null; errorResponse?: never }
  | { apiKey?: never; refundQuota?: never; errorResponse: NextResponse };

/**
 * Resolves the OpenAI key an AI route may use. Call AFTER request validation
 * so invalid requests never touch quota.
 * - BYOK (Authorization: Bearer <key>) is always allowed, free, and unmetered.
 * - Clerk entirely unconfigured → legacy dev/OSS mode: the server env key,
 *   ungated — local dev without accounts keeps working.
 * - Clerk + Supabase configured → the server key is gated: signed-in paid
 *   tier + monthly quota. `refundQuota` is non-null when a quota op was
 *   consumed; routes must call it on any failure after this point so users
 *   are only charged for delivered results.
 * - Inconsistent config (one Clerk key only, or Clerk without Supabase) →
 *   503: failing loudly beats silently serving the server key ungated, or
 *   telling paying customers to buy a plan they already own.
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
    const envKey = process.env.OPENAI_API_KEY;
    if (envKey) return { apiKey: envKey, refundQuota: null };
    return {
      errorResponse: NextResponse.json({ error: 'OpenAI API key is required' }, { status: 401 }),
    };
  }

  if (!isSupabaseConfigured()) {
    // Accounts exist but tiers/quotas have nowhere to live — without this a
    // paying customer would be told to buy the plan they already own.
    console.error('resolveOpenAIKey: Clerk is configured but Supabase is not — paid-tier AI cannot work');
    return {
      errorResponse: NextResponse.json(
        { error: 'AI plans are unavailable: this server has no accounts database configured. Add your own OpenAI API key, or contact the site operator.' },
        { status: 503 }
      ),
    };
  }

  const { userId, tier, degraded } = await getEntitlement();
  if (!userId) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Add your own OpenAI API key, or sign in with a Pro or Enterprise plan to use ours.' },
        { status: 401 }
      ),
    };
  }
  if (degraded) {
    return {
      errorResponse: NextResponse.json(
        { error: 'We could not verify your plan right now. Please try again in a moment.' },
        { status: 503 }
      ),
    };
  }
  if (!isPaidTier(tier)) {
    return {
      errorResponse: NextResponse.json(
        { error: 'AI without an API key requires a Pro or Enterprise plan ($2/$5 one-time), or add your own OpenAI API key.' },
        { status: 403 }
      ),
    };
  }

  // Pure config check BEFORE the destructive quota spend: a missing server
  // key must never burn a paid user's monthly ops.
  const envKey = process.env.OPENAI_API_KEY;
  if (!envKey) {
    return {
      errorResponse: NextResponse.json(
        { error: 'AI is not configured on this server' },
        { status: 503 }
      ),
    };
  }

  const quota = await consumeAiQuota(userId, tier);
  if (!quota.allowed) {
    return {
      errorResponse: NextResponse.json(
        { error: `You've used all ${quota.quota} included AI operations this month. They reset next month — or add your own OpenAI API key for unlimited use.` },
        { status: 429 }
      ),
    };
  }

  return { apiKey: envKey, refundQuota: () => refundAiQuota(userId) };
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

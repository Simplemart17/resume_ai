import { auth } from '@clerk/nextjs/server';
import { getSupabaseDb } from '@/lib/supabase/server';
import { isTier, Tier, TIERS } from '@/lib/tiers';

export function isClerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
}

/**
 * True when Clerk env vars are inconsistent (exactly one of the two keys is
 * set). The client gates on the publishable key alone, so in this state the
 * accounts UI renders while every server gate rejects — treat it as an
 * operator error and fail loudly instead of silently falling back.
 */
export function isClerkMisconfigured(): boolean {
  const hasPublishable = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const hasSecret = Boolean(process.env.CLERK_SECRET_KEY);
  return hasPublishable !== hasSecret;
}

/** Quota period key: UTC calendar month, 'YYYY-MM'. The single definition —
 * /api/me reads and consume/refund write under the same key. */
export function currentAiPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}

export interface Entitlement {
  userId: string | null;
  tier: Tier;
  /**
   * True when the tier could not be verified (DB error). Callers gating paid
   * features must NOT treat this as free — return a 5xx so paying customers
   * see "try again" instead of "buy a plan you already own".
   */
  degraded: boolean;
}

/**
 * Resolves the requesting user's tier: Clerk session → resume.profiles row
 * (created lazily on first sight). Anonymous users, or deployments without
 * Clerk/Supabase configured, resolve to the free tier.
 */
export async function getEntitlement(): Promise<Entitlement> {
  if (!isClerkConfigured()) return { userId: null, tier: 'free', degraded: false };

  const { userId } = await auth();
  if (!userId) return { userId: null, tier: 'free', degraded: false };

  const db = getSupabaseDb();
  if (!db) return { userId, tier: 'free', degraded: false };

  const { data: profile, error } = await db
    .from('profiles')
    .select('tier')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    // A failed query is NOT "no profile yet" — a paying user's tier is
    // unknown right now, which callers must distinguish from free.
    console.error(`getEntitlement: profiles query failed for ${userId}:`, error.message);
    return { userId, tier: 'free', degraded: true };
  }

  if (!profile) {
    // First time we see this Clerk user — create their free profile.
    const { error: upsertError } = await db
      .from('profiles')
      .upsert({ user_id: userId }, { onConflict: 'user_id' });
    if (upsertError) {
      console.error(`getEntitlement: profile create failed for ${userId}:`, upsertError.message);
    }
    return { userId, tier: 'free', degraded: false };
  }

  return { userId, tier: isTier(profile.tier) ? profile.tier : 'free', degraded: false };
}

export type QuotaResult =
  | { allowed: true; used: number; quota: number }
  | { allowed: false; used: number; quota: number };

/**
 * Atomically consumes one AI operation from the user's monthly quota via
 * the resume.consume_ai_quota SQL function, so concurrent requests cannot
 * exceed the cap. Only meaningful for paid tiers with a positive quota.
 */
export async function consumeAiQuota(userId: string, tier: Tier): Promise<QuotaResult> {
  const quota = TIERS[tier].monthlyAiQuota;
  if (quota <= 0) return { allowed: false, used: 0, quota };

  const db = getSupabaseDb();
  if (!db) {
    // Supabase misconfigured: fail closed for server-key spending.
    console.error('consumeAiQuota: SUPABASE_URL / SUPABASE_SECRET_KEY not configured');
    return { allowed: false, used: 0, quota };
  }

  const { data, error } = await db.rpc('consume_ai_quota', {
    p_user_id: userId,
    p_period: currentAiPeriod(),
    p_quota: quota,
  });

  if (error) {
    console.error('consumeAiQuota failed:', error.message);
    return { allowed: false, used: 0, quota };
  }

  // The function returns the new usage count, or -1 when already exhausted.
  const used = typeof data === 'number' ? data : Number(data);
  if (used === -1) return { allowed: false, used: quota, quota };
  return { allowed: true, used, quota };
}

/**
 * Returns one AI operation to the user's monthly quota (floor 0). Called when
 * quota was consumed but the OpenAI call failed, so users are only charged
 * for delivered results. Best-effort: a failed refund is logged, not thrown.
 */
export async function refundAiQuota(userId: string): Promise<void> {
  const db = getSupabaseDb();
  if (!db) return;

  const { error } = await db.rpc('refund_ai_quota', {
    p_user_id: userId,
    p_period: currentAiPeriod(),
  });
  if (error) {
    console.error(`refundAiQuota failed for ${userId}:`, error.message);
  }
}

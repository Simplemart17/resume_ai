import { auth } from '@clerk/nextjs/server';
import { getSupabaseDb } from '@/lib/supabase/server';
import { isTier, Tier, TIERS } from '@/lib/tiers';

export function isClerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
}

export interface Entitlement {
  userId: string | null;
  tier: Tier;
}

/**
 * Resolves the requesting user's tier: Clerk session → resume.profiles row
 * (created lazily on first sight). Anonymous users, or deployments without
 * Clerk/Supabase configured, resolve to the free tier.
 */
export async function getEntitlement(): Promise<Entitlement> {
  if (!isClerkConfigured()) return { userId: null, tier: 'free' };

  const { userId } = await auth();
  if (!userId) return { userId: null, tier: 'free' };

  const db = getSupabaseDb();
  if (!db) return { userId, tier: 'free' };

  const { data: profile } = await db
    .from('profiles')
    .select('tier')
    .eq('user_id', userId)
    .maybeSingle();

  if (!profile) {
    // First time we see this Clerk user — create their free profile.
    await db.from('profiles').upsert({ user_id: userId }, { onConflict: 'user_id' });
    return { userId, tier: 'free' };
  }

  return { userId, tier: isTier(profile.tier) ? profile.tier : 'free' };
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

  const period = new Date().toISOString().slice(0, 7); // YYYY-MM
  const { data, error } = await db.rpc('consume_ai_quota', {
    p_user_id: userId,
    p_period: period,
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

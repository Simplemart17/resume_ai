import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/utils/rateLimit';
import { rateLimitResponse } from '@/utils/apiHelpers';
import { currentAiPeriod, getEntitlement, isClerkConfigured } from '@/lib/entitlements';
import { getSupabaseDb } from '@/lib/supabase/server';
import { TIERS } from '@/lib/tiers';

// The client's only window into account data: Clerk verifies the session,
// the server reads the resume schema with the secret key. No Supabase
// queries ever run in the browser.
export async function GET(request: NextRequest) {
  // Generous limit — the client caches/dedups, but this route does Clerk +
  // DB work per hit and must not be an unthrottled amplifier.
  const rateLimit = checkRateLimit(request, { limit: 30, windowMs: 60000, bucket: 'me' });
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  if (!isClerkConfigured()) {
    return NextResponse.json({ error: 'Accounts are not configured' }, { status: 503 });
  }

  // getEntitlement resolves the Clerk session itself — one auth() per request.
  const { userId, tier, degraded } = await getEntitlement();
  if (!userId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  if (degraded) {
    // The tier is unknown, not free — a 200 here would make the client
    // confidently render a paying customer as Free.
    return NextResponse.json({ error: 'Account data is temporarily unavailable' }, { status: 503 });
  }

  const quota = TIERS[tier].monthlyAiQuota;
  const period = currentAiPeriod();

  let used = 0;
  let purchases: { tier: string; amountCents: number; createdAt: string }[] = [];

  const db = getSupabaseDb();
  if (db) {
    const [usageResult, purchasesResult] = await Promise.all([
      db.from('ai_usage').select('count').eq('user_id', userId).eq('period', period).maybeSingle(),
      db
        .from('purchases')
        .select('tier, amount_cents, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);
    if (usageResult.error) {
      console.error(`/api/me: ai_usage query failed for ${userId}:`, usageResult.error.message);
    }
    if (purchasesResult.error) {
      console.error(`/api/me: purchases query failed for ${userId}:`, purchasesResult.error.message);
    }
    used = usageResult.data?.count ?? 0;
    purchases = (purchasesResult.data ?? []).map((p) => ({
      tier: p.tier,
      amountCents: p.amount_cents,
      createdAt: p.created_at,
    }));
  }

  return NextResponse.json({
    tier,
    usage: { used, quota, period },
    purchases,
  });
}

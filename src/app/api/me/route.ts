import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getEntitlement, isClerkConfigured } from '@/lib/entitlements';
import { getSupabaseDb } from '@/lib/supabase/server';
import { TIERS } from '@/lib/tiers';

// The client's only window into account data: Clerk verifies the session,
// the server reads the resume schema with the secret key. No Supabase
// queries ever run in the browser.
export async function GET() {
  if (!isClerkConfigured()) {
    return NextResponse.json({ error: 'Accounts are not configured' }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { tier } = await getEntitlement();
  const quota = TIERS[tier].monthlyAiQuota;
  const period = new Date().toISOString().slice(0, 7);

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

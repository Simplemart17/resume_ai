import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseDb } from '@/lib/supabase/server';
import { highestTier, isTier, Tier } from '@/lib/tiers';

/**
 * POST /api/stripe/webhook — Stripe event receiver.
 * Verifies the signature against the RAW request body, then fulfills paid
 * Checkout Sessions: records the purchase (idempotent on stripe_session_id)
 * and upgrades the buyer's profile tier. Stripe redelivers events, so every
 * step here must be safe to repeat; any transient failure returns 500 so
 * Stripe retries.
 */
export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json(
      { error: 'Payments are not configured on this server' },
      { status: 503 }
    );
  }

  // The signature covers the exact bytes Stripe sent — read the raw body,
  // never a parsed/re-serialized form.
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  if (
    event.type !== 'checkout.session.completed' &&
    event.type !== 'checkout.session.async_payment_succeeded'
  ) {
    // Not an event we act on — acknowledge so Stripe stops sending it.
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // checkout.session.completed also fires for delayed payment methods while
  // payment is still pending; fulfill only once the money is actually in.
  // The async_payment_succeeded event follows when it clears.
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true });
  }

  const userId = session.metadata?.user_id;
  const purchasedTier = session.metadata?.tier;
  if (!userId || !isTier(purchasedTier) || purchasedTier === 'free') {
    // Malformed metadata is permanent — retrying can't fix it, so log loudly
    // and acknowledge instead of making Stripe redeliver forever.
    console.error(
      `Stripe webhook: session ${session.id} has invalid metadata`,
      session.metadata
    );
    return NextResponse.json({ received: true });
  }

  const db = getSupabaseDb();
  if (!db) {
    // Transient/operator error: once SUPABASE_SERVICE_ROLE_KEY is set,
    // Stripe's retry will fulfill this purchase.
    console.error(`Stripe webhook: Supabase DB client unavailable; cannot fulfill ${session.id}`);
    return NextResponse.json({ error: 'Fulfillment store not configured' }, { status: 500 });
  }

  const { error: insertError } = await db.from('purchases').insert({
    user_id: userId,
    tier: purchasedTier,
    stripe_session_id: session.id,
    amount_cents: session.amount_total ?? 0,
  });

  if (insertError && insertError.code !== '23505') {
    console.error(`Stripe webhook: failed to record purchase ${session.id}:`, insertError.message);
    return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
  }
  // 23505 (unique violation on stripe_session_id) means a redelivered event —
  // the purchase is already recorded. Still run the tier update below: it is
  // idempotent (highestTier never downgrades) and heals the case where a
  // previous delivery inserted the purchase but crashed before the upgrade.

  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('tier')
    .eq('user_id', userId)
    .maybeSingle();
  if (profileError) {
    console.error(`Stripe webhook: failed to read profile for ${userId}:`, profileError.message);
    return NextResponse.json({ error: 'Failed to read profile' }, { status: 500 });
  }

  const currentTier: Tier = isTier(profile?.tier) ? profile.tier : 'free';
  const newTier = highestTier(currentTier, purchasedTier);

  // Upsert covers the edge case of a user created before the profile trigger
  // existed. Never downgrade: an Enterprise owner buying Pro keeps Enterprise.
  const { error: upsertError } = await db.from('profiles').upsert({
    user_id: userId,
    tier: newTier,
    updated_at: new Date().toISOString(),
  });
  if (upsertError) {
    console.error(`Stripe webhook: failed to upgrade tier for ${userId}:`, upsertError.message);
    return NextResponse.json({ error: 'Failed to update profile tier' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

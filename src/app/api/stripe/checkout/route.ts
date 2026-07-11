import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth, currentUser } from '@clerk/nextjs/server';
import { checkRateLimit } from '@/utils/rateLimit';
import { parseJsonBody, rateLimitResponse } from '@/utils/apiHelpers';
import { isClerkConfigured } from '@/lib/entitlements';
import { isPaidTier, isTier, TIERS } from '@/lib/tiers';

/**
 * POST /api/stripe/checkout — body { tier: 'pro' | 'enterprise' }.
 * Creates a one-time-payment Stripe Checkout Session for the signed-in user
 * and returns { url } to redirect them to. Fulfillment happens in the
 * webhook route, never here.
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, {
      limit: 10,
      windowMs: 60000,
      bucket: 'stripe-checkout',
    });
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    const parsedBody = await parseJsonBody<{ tier?: unknown }>(request);
    if (parsedBody.errorResponse) {
      return parsedBody.errorResponse;
    }
    const { tier } = parsedBody.body;

    if (!isTier(tier) || !isPaidTier(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Choose "pro" or "enterprise".' },
        { status: 400 }
      );
    }

    // Purchases must be tied to an account so the webhook knows whose tier
    // to upgrade. Unconfigured Clerk means no accounts — same 401.
    if (!isClerkConfigured()) {
      return NextResponse.json({ error: 'Sign in to purchase a plan' }, { status: 401 });
    }
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in to purchase a plan' }, { status: 401 });
    }
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { error: 'Payments are not configured on this server' },
        { status: 503 }
      );
    }

    // Instantiated per-request so builds/deploys without Stripe env succeed.
    const stripe = new Stripe(stripeKey);
    const origin = new URL(request.url).origin;
    const tierDef = TIERS[tier];

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: tierDef.priceCents,
            product_data: {
              name: `ResumeAI Pro — ${tierDef.name} (lifetime)`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { user_id: userId, tier },
      client_reference_id: userId,
      customer_email: email || undefined,
      success_url: `${origin}/account?checkout=success`,
      cancel_url: `${origin}/#pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 });
  }
}

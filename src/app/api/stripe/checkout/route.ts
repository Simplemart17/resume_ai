import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { checkRateLimit } from '@/utils/rateLimit';
import { parseJsonBody, rateLimitResponse } from '@/utils/apiHelpers';
import { isClerkConfigured, isClerkMisconfigured } from '@/lib/entitlements';
import { getStripe } from '@/lib/stripe';
import { isPaidTier, isTier, TIERS } from '@/lib/tiers';

/**
 * POST /api/stripe/checkout — body { tier: 'starter' | 'pro' | 'enterprise' }.
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
        { error: 'Invalid tier. Choose a paid plan (Starter, Pro, or Enterprise).' },
        { status: 400 }
      );
    }

    // Half-configured Clerk must NOT be a 401: the client redirects 401s to
    // /login, and with the publishable key present sign-in appears to work,
    // so a signed-in user would loop /login → pricing → 401 forever.
    if (isClerkMisconfigured()) {
      console.error(
        'stripe/checkout: exactly one of NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY is set'
      );
      return NextResponse.json(
        { error: 'Accounts are misconfigured on this server. Please contact the site operator.' },
        { status: 503 }
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

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payments are not configured on this server' },
        { status: 503 }
      );
    }

    // Behind proxies that don't forward host/proto, request.url can resolve
    // to an internal address — NEXT_PUBLIC_APP_URL overrides it so Stripe
    // never redirects buyers to an unreachable origin. On Vercel the
    // request-derived origin is correct and the override is unnecessary.
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
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

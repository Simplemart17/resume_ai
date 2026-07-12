import Stripe from 'stripe';

// Lazy + memoized so builds/deploys without Stripe env still succeed (no
// top-level throw) while the SDK client is constructed once per process.
let cachedStripe: Stripe | null = null;

/** Returns the Stripe client, or null when STRIPE_SECRET_KEY is not set. */
export function getStripe(): Stripe | null {
  if (cachedStripe) return cachedStripe;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return null;
  cachedStripe = new Stripe(stripeKey);
  return cachedStripe;
}

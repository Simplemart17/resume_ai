'use client';

import type { Tier } from '@/lib/tiers';

/**
 * Starts a Stripe Checkout for a paid tier: asks our API for a session URL
 * and redirects. Returns an error message instead of redirecting when the
 * user must sign in first (401) or checkout is unavailable.
 */
export async function startCheckout(tier: Exclude<Tier, 'free'>): Promise<string | null> {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier }),
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    // Clerk's SignIn honors redirect_url, returning the user to pricing
    // after they sign in.
    window.location.href = `/login?redirect_url=${encodeURIComponent('/#pricing')}`;
    return null;
  }
  if (!response.ok || !data?.url) {
    return data?.error || 'Checkout is not available right now. Please try again later.';
  }

  window.location.href = data.url;
  return null;
}

'use client';

import type { PaidTier } from '@/lib/tiers';

/**
 * Starts a Stripe Checkout for a paid tier: asks our API for a session URL
 * and redirects. Never throws.
 *
 * Contract: a string return is an error to display (reset your pending
 * state); `null` means navigation has been initiated (to Stripe, or to
 * /login on 401) — the page is being left, so callers must KEEP their
 * button disabled: re-enabling mid-navigation invites a second click and a
 * duplicate checkout session.
 */
export async function startCheckout(tier: PaidTier): Promise<string | null> {
  let response: Response;
  try {
    response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    });
  } catch {
    return 'Could not reach the server. Check your connection and try again.';
  }

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

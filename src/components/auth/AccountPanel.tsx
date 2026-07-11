'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { useUserTier } from '@/lib/useUserTier';
import { TIERS, PAID_TIERS, Tier, isTier, isPaidTier } from '@/lib/tiers';
import { startCheckout } from '@/lib/checkout';

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

interface Purchase {
  tier: string;
  amountCents: number;
  createdAt: string;
}

/** Parsed shape of GET /api/me. */
interface MeData {
  tier: Tier;
  usage: { used: number; quota: number };
  purchases: Purchase[];
}

const TIER_ORDER: Tier[] = ['free', 'pro', 'enterprise'];

// useClerk() throws outside a ClerkProvider, and the provider is only mounted
// when Clerk is configured. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is inlined at
// build time, so selecting the hook implementation at module level keeps the
// hook order stable for the app's lifetime.
function useClerkSignOut() {
  const { signOut } = useClerk();
  return signOut;
}

function useDisabledSignOut() {
  return async () => {};
}

const useSignOut = CLERK_ENABLED ? useClerkSignOut : useDisabledSignOut;

function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
        isPaidTier(tier)
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
          : 'bg-gray-100 text-gray-700'
      }`}
    >
      {TIERS[tier].name}
    </span>
  );
}

/**
 * Signed-in account dashboard: plan, AI usage, purchase history, upgrades.
 * Identity comes from Clerk (via useUserTier); account data comes from
 * GET /api/me — the browser never talks to the database directly.
 * Must be rendered inside a <Suspense> boundary (uses useSearchParams).
 */
export function AccountPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signOut = useSignOut();
  const { user, tier: sessionTier, loading, accountsEnabled } = useUserTier();

  const [me, setMe] = useState<MeData | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<Tier | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const checkoutSuccess = searchParams.get('checkout') === 'success';
  const userId = user?.id ?? null;

  // Require a session: bounce to /login when signed out.
  // Skipped mid-sign-out so the sign-out redirect to '/' wins.
  useEffect(() => {
    if (accountsEnabled && !loading && !user && !signingOut) {
      router.replace('/login');
    }
  }, [accountsEnabled, loading, user, signingOut, router]);

  const fetchMe = useCallback(async (): Promise<MeData | null> => {
    try {
      const res = await fetch('/api/me');
      if (!res.ok) return null;
      const data = await res.json();
      return {
        tier: isTier(data?.tier) ? data.tier : 'free',
        usage: {
          used: Number(data?.usage?.used) || 0,
          quota: Number(data?.usage?.quota) || 0,
        },
        purchases: Array.isArray(data?.purchases) ? data.purchases : [],
      };
    } catch {
      // Network error — fall back to the session tier with empty usage/history.
      return null;
    }
  }, []);

  // Load tier, usage, and purchase history once signed in.
  useEffect(() => {
    if (!accountsEnabled || !userId) return;
    let cancelled = false;
    fetchMe().then((data) => {
      if (!cancelled && data) setMe(data);
    });
    return () => {
      cancelled = true;
    };
  }, [accountsEnabled, userId, fetchMe]);

  // After a successful checkout the Stripe webhook upgrades the tier
  // asynchronously — re-fetch once after a short delay so the new tier
  // shows up without a manual refresh.
  useEffect(() => {
    if (!checkoutSuccess || !accountsEnabled || !userId) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchMe().then((data) => {
        if (!cancelled && data) setMe(data);
      });
    }, 2000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [checkoutSuccess, accountsEnabled, userId, fetchMe]);

  const handleUpgrade = async (target: Exclude<Tier, 'free'>) => {
    setCheckoutError(null);
    setUpgrading(target);
    const errorMessage = await startCheckout(target);
    if (errorMessage) {
      setCheckoutError(errorMessage);
      setUpgrading(null);
    }
    // On success startCheckout navigates away; leave the button disabled.
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/');
    } catch {
      setSigningOut(false);
    }
  };

  if (!accountsEnabled) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Accounts are not configured on this deployment
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            This page requires authentication to be set up by the site operator.
          </p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-32">
        <div
          className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"
          role="status"
          aria-label="Loading account"
        />
      </div>
    );
  }

  // Prefer the freshly fetched /api/me data; fall back to the session tier
  // (already loaded by useUserTier) while the panel fetch is in flight.
  const tier: Tier = me?.tier ?? sessionTier;
  const aiUsed = me?.usage.used ?? 0;
  const quota = me?.usage.quota ?? TIERS[tier].monthlyAiQuota;
  const purchases = me?.purchases ?? [];
  const upgrades = PAID_TIERS.filter((t) => TIER_ORDER.indexOf(t) > TIER_ORDER.indexOf(tier));

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Account</h1>

      {checkoutSuccess && (
        <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
          Payment received! Your plan upgrades within a few seconds — refresh if you don&apos;t
          see it yet.
        </div>
      )}

      {/* Profile */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="text-gray-900 font-medium">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>

      {/* Current plan */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your plan</h2>
          <TierBadge tier={tier} />
        </div>

        <ul className="space-y-2 mb-6">
          {TIERS[tier].features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
              <svg
                className="h-5 w-5 text-green-500 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        {quota > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-700">AI usage this month</span>
              <span className="text-gray-500">
                {aiUsed} / {quota}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all"
                style={{ width: `${Math.min(100, (aiUsed / quota) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {upgrades.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Upgrade</p>
            {checkoutError && (
              <div className="mb-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {checkoutError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              {upgrades.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleUpgrade(t as Exclude<Tier, 'free'>)}
                  disabled={upgrading !== null}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {upgrading === t
                    ? 'Redirecting…'
                    : `Upgrade to ${TIERS[t].name} — ${TIERS[t].priceLabel}`}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">One-time payment</p>
          </div>
        )}
      </div>

      {/* Purchase history */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase history</h2>
        {purchases.length === 0 ? (
          <p className="text-sm text-gray-500">No purchases yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {purchases.map((purchase, index) => (
              <li
                key={`${purchase.createdAt}-${index}`}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    {isTier(purchase.tier) ? TIERS[purchase.tier].name : purchase.tier}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(purchase.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <span className="text-sm text-gray-700">
                  ${(purchase.amountCents / 100).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

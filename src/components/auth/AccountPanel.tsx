'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignOut, useUserTier } from '@/lib/useUserTier';
import { TIERS, PAID_TIERS, PaidTier, Tier, isTier, isPaidTier, tierRank } from '@/lib/tiers';
import { startCheckout } from '@/lib/checkout';
import { fetchMe, refreshMe, MeData } from '@/lib/me';
import { AccountsNotConfigured } from './AccountsNotConfigured';
import { PageHeader } from '../PageHeader';

/** A purchase created within this window is treated as the one the user just
 * completed — the signal that webhook fulfillment has landed. */
const RECENT_PURCHASE_MS = 5 * 60_000;

function fulfillmentLanded(data: MeData): boolean {
  return (
    isPaidTier(data.tier) &&
    data.purchases.some(
      (p) => Date.now() - new Date(p.createdAt).getTime() < RECENT_PURCHASE_MS
    )
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider ${
        isPaidTier(tier)
          ? 'bg-pen text-paper'
          : 'bg-bench text-ink-soft border border-rule'
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

  // Upgrade buttons stay disabled through the Stripe redirect; if the user
  // comes BACK and the browser restores this page from bfcache, re-enable.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setUpgrading(null);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  // Require a session: bounce to /login when signed out, carrying the
  // current URL (including ?checkout=success) so the user returns here —
  // not the home page — after signing in. Skipped mid-sign-out so the
  // sign-out redirect to '/' wins.
  useEffect(() => {
    if (accountsEnabled && !loading && !user && !signingOut) {
      const returnTo = window.location.pathname + window.location.search;
      router.replace(`/login?redirect_url=${encodeURIComponent(returnTo)}`);
    }
  }, [accountsEnabled, loading, user, signingOut, router]);

  // Load tier, usage, and purchase history once signed in. fetchMe is the
  // shared cached /api/me fetcher — this reuses the request useUserTier
  // already fired instead of hitting the endpoint again.
  useEffect(() => {
    if (!accountsEnabled || !userId) return;
    let cancelled = false;
    fetchMe(userId).then((data) => {
      if (!cancelled && data) setMe(data);
    });
    return () => {
      cancelled = true;
    };
  }, [accountsEnabled, userId]);

  // After a successful checkout the Stripe webhook upgrades the tier
  // asynchronously. Poll until a fresh purchase shows up (or ~20s), so slow
  // webhook delivery doesn't strand the buyer on their old plan; refreshMe
  // also notifies useUserTier consumers, keeping the nav pill in sync.
  useEffect(() => {
    if (!checkoutSuccess || !accountsEnabled || !userId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      const data = await refreshMe(userId);
      if (cancelled) return;
      if (data) setMe(data);
      if (data && fulfillmentLanded(data)) return;
      if (attempts < 6) {
        timer = setTimeout(poll, 3500);
      }
    };

    timer = setTimeout(poll, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [checkoutSuccess, accountsEnabled, userId]);

  const handleUpgrade = async (target: PaidTier) => {
    setCheckoutError(null);
    setUpgrading(target);
    // startCheckout never throws: a string is an error to show, null means
    // navigation has started — keep the button disabled through the redirect.
    const errorMessage = await startCheckout(target);
    if (errorMessage) {
      setCheckoutError(errorMessage);
      setUpgrading(null);
    }
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
        <AccountsNotConfigured description="This page requires authentication to be set up by the site operator." />
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-32">
        <div
          className="h-8 w-8 rounded-full border-2 border-pen border-t-transparent animate-spin"
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
  const upgrades = PAID_TIERS.filter((t) => tierRank(t) > tierRank(tier));

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Your account"
        strip={{ token: 'account', text: 'plan · usage · purchase history' }}
      />

      {checkoutSuccess && (
        <div className="px-4 py-3 rounded-[3px] bg-pass/10 border border-pass/30 text-sm text-pass">
          Payment received. Your plan upgrades within a few seconds — refresh if you don&apos;t
          see it yet.
        </div>
      )}

      {/* Profile */}
      <div className="paper p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="eyebrow mb-1">Signed in as</p>
            <p className="text-ink font-medium break-all">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="btn-ghost px-4 py-2 text-sm"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      {/* Current plan — heroed with a pen frame for paid tiers. */}
      <div className={`paper p-6 ${isPaidTier(tier) ? 'border-2 border-pen' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="eyebrow mb-1">Current plan</p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              {TIERS[tier].name}
            </h2>
          </div>
          <TierBadge tier={tier} />
        </div>

        <ul className="space-y-2 mb-6">
          {TIERS[tier].features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-ink">
              <span className="ok-token mt-0.5 shrink-0" aria-hidden="true">✓</span>
              {feature}
            </li>
          ))}
        </ul>

        {quota > 0 && (
          <div className="mb-6">
            <div className="machine-strip rounded-[3px] border border-rule">
              <span className="machine-token">[quota]</span>
              <span className="tabular-nums">{aiUsed}/{quota}</span>
              <span>AI ops used this month</span>
            </div>
            <div className="mt-2 h-2 bg-bench border border-rule rounded-[2px] overflow-hidden">
              <div
                className="h-full bg-pen transition-all"
                style={{ width: `${Math.min(100, (aiUsed / quota) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {upgrades.length > 0 && (
          <div className="border-t border-rule pt-4">
            <p className="eyebrow mb-3">Upgrade</p>
            {checkoutError && (
              <div className="mb-3 px-4 py-3 rounded-[3px] bg-fail/10 border border-fail/30 text-sm text-fail">
                {checkoutError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              {upgrades.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleUpgrade(t)}
                  disabled={upgrading !== null}
                  className="btn-pen flex-1 px-4 py-2.5 text-sm"
                >
                  {upgrading === t
                    ? 'Redirecting…'
                    : `Upgrade to ${TIERS[t].name} — ${TIERS[t].priceLabel}`}
                </button>
              ))}
            </div>
            <p className="font-mono text-xs text-ink-soft mt-2">One-time payment</p>
          </div>
        )}
      </div>

      {/* Purchase history */}
      <div className="paper p-6">
        <h2 className="font-display text-lg font-semibold tracking-tight text-ink mb-4">Purchase history</h2>
        {purchases.length === 0 ? (
          <div className="machine-strip rounded-[3px] border border-rule">
            <span className="machine-token">[ledger]</span>
            <span>no transactions yet</span>
          </div>
        ) : (
          <ul className="divide-y divide-rule">
            {purchases.map((purchase, index) => (
              <li
                key={`${purchase.createdAt}-${index}`}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-ink">
                    {isTier(purchase.tier) ? TIERS[purchase.tier].name : purchase.tier}
                  </span>
                  <span className="font-mono text-xs text-ink-soft">
                    {new Date(purchase.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <span className="font-mono tabular-nums text-sm text-ink">
                  ${(purchase.amountCents / 100).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
    </div>
  );
}

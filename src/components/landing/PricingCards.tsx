'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isPaidTier, PaidTier, Tier, TIER_ORDER, TIERS, tierRank } from '@/lib/tiers';
import { useUserTier } from '@/lib/useUserTier';
import { startCheckout } from '@/lib/checkout';

/**
 * The three pricing cards, rendered entirely from the TIERS definition in
 * src/lib/tiers.ts — never hardcode prices or feature lists here. One-time
 * lifetime purchases: Free / Pro / Enterprise.
 */
export function PricingCards() {
  const { tier: userTier, loading, accountsEnabled } = useUserTier();
  const [pendingTier, setPendingTier] = useState<Tier | null>(null);
  // Only one checkout can be in flight, so one error slot is enough.
  const [checkoutError, setCheckoutError] = useState<{ tier: Tier; message: string } | null>(null);

  // Buttons stay disabled through the Stripe redirect; if the user comes
  // BACK and the browser restores this page from bfcache, re-enable them.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setPendingTier(null);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const handleCheckout = async (tierId: PaidTier) => {
    setPendingTier(tierId);
    setCheckoutError(null);
    const error = await startCheckout(tierId);
    if (error) {
      setCheckoutError({ tier: tierId, message: error });
      setPendingTier(null);
    }
    // On success startCheckout has begun navigating away — keep the button
    // disabled so a second click can't open a duplicate checkout session.
  };

  return (
    <div>
      {/* A ruled ledger, not a fan of floating cards — the three tiers share
          one sheet, hairline-separated, with Pro as the dark "lit" column. */}
      <div className="paper overflow-hidden max-w-5xl mx-auto">
        <div className="grid gap-px bg-rule md:grid-cols-3">
          {TIER_ORDER.map((tierId) => {
            const tierDef = TIERS[tierId];
            const highlighted = tierId === 'pro';
            const isPaid = isPaidTier(tierId);
            // Owning an equal or higher tier covers this card.
            const owned =
              isPaid && accountsEnabled && !loading && tierRank(userTier) >= tierRank(tierId);
            const error = checkoutError?.tier === tierId ? checkoutError.message : null;

            return (
              <div
                key={tierDef.id}
                className={`flex flex-col p-7 ${highlighted ? 'bg-ink text-paper' : 'bg-paper'}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <p
                    className={`font-mono text-[11px] font-medium uppercase tracking-[0.14em] ${
                      highlighted ? 'text-paper/60' : 'text-ink-soft'
                    }`}
                  >
                    {tierDef.name}
                  </p>
                  {highlighted && (
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider bg-pen text-paper px-1.5 py-0.5 rounded-[2px]">
                      Most popular
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className={`font-display text-5xl font-bold tracking-tight tabular-nums ${
                      highlighted ? 'text-paper' : 'text-ink'
                    }`}
                  >
                    {tierDef.priceLabel}
                  </span>
                  <span className={`font-mono text-xs ${highlighted ? 'text-paper/60' : 'text-ink-soft'}`}>
                    {isPaid ? 'one-time' : 'free forever'}
                  </span>
                </div>
                <p className={`text-sm mb-6 ${highlighted ? 'text-paper/70' : 'text-ink-soft'}`}>
                  {tierDef.tagline}
                </p>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {tierDef.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-2.5 text-sm ${
                        highlighted ? 'text-paper/85' : 'text-ink'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`ok-token shrink-0 leading-5 ${
                          highlighted ? 'text-pen-light' : 'text-pass'
                        }`}
                      >
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {!isPaid ? (
                  <Link href="/builder" className="btn-ghost w-full px-6 py-3">
                    Start free
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => isPaidTier(tierId) && handleCheckout(tierId)}
                      disabled={!accountsEnabled || loading || owned || pendingTier !== null}
                      className={`${highlighted ? 'btn-pen' : 'btn-ink'} w-full px-6 py-3`}
                    >
                      {owned
                        ? userTier === tierId
                          ? 'Your plan'
                          : 'Included in your plan'
                        : pendingTier === tierId
                          ? 'Redirecting…'
                          : `Get ${tierDef.name}`}
                    </button>
                    {!accountsEnabled && (
                      <p className={`mt-3 font-mono text-xs ${highlighted ? 'text-paper/60' : 'text-ink-soft'}`}>
                        Payments not configured on this deployment
                      </p>
                    )}
                    {error && (
                      <p className={`mt-3 text-sm ${highlighted ? 'text-[#ff9d94]' : 'text-fail'}`} role="alert">
                        {error}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="machine-strip">
          <span className="machine-token">[pricing]</span>
          <span>one-time · lifetime · every listed feature enforced in code</span>
        </div>
      </div>

      <p className="font-mono text-xs text-ink-soft mt-6 max-w-3xl mx-auto text-center">
        AI optimization and cover letters run on your own OpenAI key on every plan, unmetered by us. Paid plans unlock templates.
      </p>
    </div>
  );
}

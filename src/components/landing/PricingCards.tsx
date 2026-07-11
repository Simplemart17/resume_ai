'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiCheck } from 'react-icons/fi';
import { TIERS, Tier } from '@/lib/tiers';
import { useUserTier } from '@/lib/useUserTier';
import { startCheckout } from '@/lib/checkout';

const TIER_ORDER: Tier[] = ['free', 'pro', 'enterprise'];

function tierRank(tier: Tier): number {
  return TIER_ORDER.indexOf(tier);
}

/**
 * The three pricing cards, rendered entirely from the TIERS definition in
 * src/lib/tiers.ts — never hardcode prices or feature lists here. One-time
 * lifetime purchases: Free / Pro / Enterprise.
 */
export function PricingCards() {
  const { tier: userTier, loading, accountsEnabled } = useUserTier();
  const [pendingTier, setPendingTier] = useState<Tier | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Tier, string>>>({});

  const handleCheckout = async (tierId: Exclude<Tier, 'free'>) => {
    setPendingTier(tierId);
    setErrors((prev) => ({ ...prev, [tierId]: undefined }));
    try {
      const error = await startCheckout(tierId);
      if (error) {
        setErrors((prev) => ({ ...prev, [tierId]: error }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        [tierId]: 'Checkout is not available right now. Please try again later.',
      }));
    } finally {
      setPendingTier(null);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {TIER_ORDER.map((tierId) => {
          const tierDef = TIERS[tierId];
          const highlighted = tierId === 'pro';
          const isPaid = tierDef.priceCents > 0;
          // Owning an equal or higher tier covers this card.
          const owned =
            isPaid && accountsEnabled && !loading && tierRank(userTier) >= tierRank(tierId);
          const error = errors[tierId];

          return (
            <div
              key={tierDef.id}
              className={
                highlighted
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 shadow-xl relative'
                  : 'bg-white border border-gray-200 rounded-xl p-8 shadow-lg'
              }
            >
              {highlighted && (
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`text-center ${highlighted ? 'text-white' : ''}`}>
                <h3
                  className={`text-2xl font-bold mb-2 ${highlighted ? '' : 'text-gray-900'}`}
                >
                  {tierDef.name}
                </h3>
                <div
                  className={`text-4xl font-bold ${highlighted ? '' : 'text-gray-900'}`}
                >
                  {tierDef.priceLabel}
                </div>
                <div
                  className={`text-sm mb-4 ${highlighted ? 'text-blue-100' : 'text-gray-500'}`}
                >
                  {isPaid ? 'one-time' : 'free forever'}
                </div>
                <p className={`mb-6 ${highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                  {tierDef.tagline}
                </p>

                <ul className="text-left space-y-3 mb-8">
                  {tierDef.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <FiCheck
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          highlighted ? 'text-green-400' : 'text-green-500'
                        }`}
                      />
                      <span className={highlighted ? 'text-blue-100' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {!isPaid ? (
                  <Link
                    href="/builder"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors duration-200 block text-center"
                  >
                    Get Started Free
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => handleCheckout(tierId as Exclude<Tier, 'free'>)}
                      disabled={!accountsEnabled || loading || owned || pendingTier !== null}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 block text-center disabled:opacity-60 disabled:cursor-not-allowed ${
                        highlighted
                          ? 'bg-white text-blue-600 hover:bg-gray-100'
                          : 'bg-gray-900 text-white hover:bg-gray-700'
                      }`}
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
                      <p
                        className={`mt-3 text-sm ${
                          highlighted ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        Payments not configured on this deployment
                      </p>
                    )}
                    {error && (
                      <p
                        className={`mt-3 text-sm ${
                          highlighted ? 'text-yellow-200' : 'text-red-600'
                        }`}
                        role="alert"
                      >
                        {error}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-gray-500 mt-8 max-w-3xl mx-auto">
        Prices are one-time payments. AI features on our key are subject to monthly
        fair-use limits shown above; bring your own OpenAI key for unlimited use on
        any plan.
      </p>
    </div>
  );
}

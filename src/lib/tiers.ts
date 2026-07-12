// Single source of truth for the monetization tiers. The pricing UI, the
// Stripe checkout route, the AI-route gating, and the template gating all
// import from here — never redeclare tier rules elsewhere. Every feature
// listed in `features` MUST be enforced in code ("honest tiers").

import { TEMPLATES } from '@/config/templates';

export type Tier = 'free' | 'pro' | 'enterprise';
export type PaidTier = Exclude<Tier, 'free'>;

/** Ascending rank order — the one place tier precedence is defined. */
export const TIER_ORDER: readonly Tier[] = ['free', 'pro', 'enterprise'];

export function tierRank(tier: Tier): number {
  return TIER_ORDER.indexOf(tier);
}

export const TEMPLATE_IDS_FREE = ['modern-professional', 'classic-traditional'] as const;
// Derived from the template registry so a newly added template can never be
// silently locked out of every tier by a stale hand-maintained list.
export const TEMPLATE_IDS_ALL: readonly string[] = TEMPLATES.map((t) => t.id);

export interface TierDefinition {
  id: Tier;
  name: string;
  /** One-time lifetime price in cents. 0 = free. */
  priceCents: number;
  priceLabel: string;
  tagline: string;
  /**
   * Server-key AI operations per calendar month. Currently 0 on every tier —
   * AI is bring-your-own-key across all plans (see resolveOpenAIKey). Kept as a
   * field so a future tier can re-enable metered server-key AI without a schema change.
   */
  monthlyAiQuota: number;
  templateIds: readonly string[];
  /** Display list for the pricing UI — everything here is enforced in code. */
  features: string[];
}

export const TIERS: Record<Tier, TierDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    priceCents: 0,
    priceLabel: '$0',
    tagline: 'Everything you need to build a resume',
    monthlyAiQuota: 0,
    templateIds: TEMPLATE_IDS_FREE,
    features: [
      'Modern & Classic templates',
      'Unlimited PDF downloads',
      'Resume parsing & auto-fill extraction',
      'AI optimize & cover letters with your own OpenAI key',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceCents: 200,
    priceLabel: '$2',
    tagline: 'One-time payment, yours forever',
    monthlyAiQuota: 0,
    templateIds: TEMPLATE_IDS_ALL,
    features: [
      `All ${TEMPLATE_IDS_ALL.length} resume templates`,
      'Unlimited PDF downloads',
      'AI optimize & cover letters with your own OpenAI key',
      'Everything in Free',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceCents: 500,
    priceLabel: '$5',
    tagline: 'One-time payment — the supporter tier',
    monthlyAiQuota: 0,
    templateIds: TEMPLATE_IDS_ALL,
    features: [
      'Everything in Pro',
    ],
  },
};

export const PAID_TIERS: readonly PaidTier[] = ['pro', 'enterprise'];

export function isTier(value: unknown): value is Tier {
  return value === 'free' || value === 'pro' || value === 'enterprise';
}

export function isPaidTier(tier: Tier): tier is PaidTier {
  return tier !== 'free';
}

export function canUseTemplate(tier: Tier, templateId: string): boolean {
  return TIERS[tier].templateIds.includes(templateId);
}

/** Buying a higher tier supersedes a lower one; never downgrade on purchase. */
export function highestTier(a: Tier, b: Tier): Tier {
  return tierRank(a) >= tierRank(b) ? a : b;
}

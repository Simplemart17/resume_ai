// Single source of truth for the monetization tiers. The pricing UI, the
// Stripe checkout route, the AI-route gating, and the template gating all
// import from here — never redeclare tier rules elsewhere. Every feature
// listed in `features` MUST be enforced in code ("honest tiers").

import { TEMPLATES } from '@/config/templates';

export type Tier = 'free' | 'starter' | 'pro' | 'enterprise';
export type PaidTier = Exclude<Tier, 'free'>;

/** Ascending rank order — the one place tier precedence is defined. */
export const TIER_ORDER: readonly Tier[] = ['free', 'starter', 'pro', 'enterprise'];

export function tierRank(tier: Tier): number {
  return TIER_ORDER.indexOf(tier);
}

export const TEMPLATE_IDS_FREE = ['modern-professional', 'classic-traditional'] as const;
// Derived from the template registry so a newly added template can never be
// silently locked out of every tier by a stale hand-maintained list.
export const TEMPLATE_IDS_ALL: readonly string[] = TEMPLATES.map((t) => t.id);

// Starter-tier cap on saved documents, applied PER TYPE (base resumes, optimized
// resumes, cover letters). Free (unpaid) gets 0 — saving is a paid feature;
// Pro/Enterprise are unlimited. Referenced by the feature copy below so the
// displayed number can never drift from what's enforced.
export const STARTER_SAVED_DOCS_PER_TYPE = 5;

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
  /**
   * Max saved documents PER TYPE (base resumes / optimized resumes / cover
   * letters). null = unlimited. Enforced in the /api/documents create routes
   * via savedDocumentsLimit(); the create call 403s once the cap is reached.
   */
  savedDocumentsPerType: number | null;
  /** Display list for the pricing UI — everything here is enforced in code. */
  features: string[];
}

export const TIERS: Record<Tier, TierDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    priceCents: 0,
    priceLabel: '$0',
    tagline: 'Build and download — no account needed',
    monthlyAiQuota: 0,
    templateIds: TEMPLATE_IDS_FREE,
    // Saving is a paid feature — unpaid users build and download, but can't
    // keep a library (see Starter).
    savedDocumentsPerType: 0,
    features: [
      'Modern & Classic templates',
      'Unlimited PDF & DOCX downloads',
      'Resume parsing & auto-fill extraction',
      'AI optimize & cover letters with your own OpenAI key',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    priceCents: 100,
    priceLabel: '$1',
    tagline: 'One-time payment — save your work',
    monthlyAiQuota: 0,
    templateIds: TEMPLATE_IDS_FREE,
    savedDocumentsPerType: STARTER_SAVED_DOCS_PER_TYPE,
    features: [
      `Save up to ${STARTER_SAVED_DOCS_PER_TYPE} each: base resumes, optimizations & cover letters`,
      'Re-download saved work as PDF or DOCX anytime',
      'Everything in Free',
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
    savedDocumentsPerType: null,
    features: [
      `All ${TEMPLATE_IDS_ALL.length} resume templates`,
      'Unlimited PDF & DOCX downloads',
      'Unlimited saved resumes & cover letters',
      'AI optimize & cover letters with your own OpenAI key',
      'Everything in Starter',
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
    savedDocumentsPerType: null,
    features: [
      'Everything in Pro',
    ],
  },
};

export const PAID_TIERS: readonly PaidTier[] = ['starter', 'pro', 'enterprise'];

export function isTier(value: unknown): value is Tier {
  return (
    value === 'free' || value === 'starter' || value === 'pro' || value === 'enterprise'
  );
}

export function isPaidTier(tier: Tier): tier is PaidTier {
  return tier !== 'free';
}

export function canUseTemplate(tier: Tier, templateId: string): boolean {
  return TIERS[tier].templateIds.includes(templateId);
}

/** Saved-documents cap per type for a tier; null = unlimited. */
export function savedDocumentsLimit(tier: Tier): number | null {
  return TIERS[tier].savedDocumentsPerType;
}

/** Buying a higher tier supersedes a lower one; never downgrade on purchase. */
export function highestTier(a: Tier, b: Tier): Tier {
  return tierRank(a) >= tierRank(b) ? a : b;
}

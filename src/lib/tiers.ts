// Single source of truth for the monetization tiers. The pricing UI, the
// Stripe checkout route, the AI-route gating, and the template gating all
// import from here — never redeclare tier rules elsewhere. Every feature
// listed in `features` MUST be enforced in code ("honest tiers").

export type Tier = 'free' | 'pro' | 'enterprise';

export const TEMPLATE_IDS_FREE = ['modern-professional', 'classic-traditional'] as const;
export const TEMPLATE_IDS_ALL = [
  'modern-professional',
  'classic-traditional',
  'creative-designer',
  'executive-premium',
] as const;

export interface TierDefinition {
  id: Tier;
  name: string;
  /** One-time lifetime price in cents. 0 = free. */
  priceCents: number;
  priceLabel: string;
  tagline: string;
  /** AI operations (optimize or cover letter) per calendar month on the SERVER key. */
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
      'AI optimization with your own OpenAI key',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceCents: 200,
    priceLabel: '$2',
    tagline: 'One-time payment, yours forever',
    monthlyAiQuota: 20,
    templateIds: TEMPLATE_IDS_ALL,
    features: [
      'All 4 resume templates',
      'Unlimited PDF downloads',
      '20 AI optimizations or cover letters per month — no API key needed',
      'Everything in Free',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceCents: 500,
    priceLabel: '$5',
    tagline: 'One-time payment, our highest limits',
    monthlyAiQuota: 100,
    templateIds: TEMPLATE_IDS_ALL,
    features: [
      'Everything in Pro',
      '100 AI optimizations or cover letters per month — no API key needed',
      'Priority email support',
    ],
  },
};

export const PAID_TIERS: Tier[] = ['pro', 'enterprise'];

export function isTier(value: unknown): value is Tier {
  return value === 'free' || value === 'pro' || value === 'enterprise';
}

export function isPaidTier(tier: Tier): boolean {
  return tier !== 'free';
}

export function canUseTemplate(tier: Tier, templateId: string): boolean {
  return TIERS[tier].templateIds.includes(templateId);
}

/** Buying a higher tier supersedes a lower one; never downgrade on purchase. */
export function highestTier(a: Tier, b: Tier): Tier {
  const order: Tier[] = ['free', 'pro', 'enterprise'];
  return order.indexOf(a) >= order.indexOf(b) ? a : b;
}

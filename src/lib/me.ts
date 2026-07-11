'use client';

import { isTier, Tier } from '@/lib/tiers';

// Shared client-side fetcher for GET /api/me. Navigation, PricingCards, the
// templates grid, and the account panel all need this data — the module-level
// cache means N mounted consumers share one request (and one set of server
// DB queries) instead of each firing their own.

export interface MePurchase {
  tier: string;
  amountCents: number;
  createdAt: string;
}

export interface MeData {
  tier: Tier;
  usage: { used: number; quota: number };
  purchases: MePurchase[];
}

/** Defensive parse — the one place the /api/me response shape is interpreted. */
function parseMe(data: unknown): MeData {
  const d = data as {
    tier?: unknown;
    usage?: { used?: unknown; quota?: unknown };
    purchases?: unknown;
  } | null;
  return {
    tier: isTier(d?.tier) ? d.tier : 'free',
    usage: {
      used: Number(d?.usage?.used) || 0,
      quota: Number(d?.usage?.quota) || 0,
    },
    purchases: Array.isArray(d?.purchases) ? (d.purchases as MePurchase[]) : [],
  };
}

async function fetchOnce(): Promise<MeData> {
  const res = await fetch('/api/me');
  if (!res.ok) throw new Error(`/api/me responded ${res.status}`);
  return parseMe(await res.json());
}

async function requestMe(): Promise<MeData | null> {
  try {
    return await fetchOnce();
  } catch {
    // One retry after a short delay: a transient blip must not render a
    // paying customer as Free (and lock their templates) until reload.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      return await fetchOnce();
    } catch {
      return null;
    }
  }
}

let cache: { userId: string; promise: Promise<MeData | null> } | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

/** Notifies when refreshMe() lands fresh data, so every mounted consumer
 * (e.g. the nav tier pill) can re-read the cache. Returns an unsubscriber. */
export function subscribeMe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Cached, deduplicated fetch of /api/me for the given signed-in user.
 * Failures are not cached — a later mount retries instead of pinning a
 * paying user to the Free fallback.
 */
export function fetchMe(userId: string, options?: { force?: boolean }): Promise<MeData | null> {
  if (!options?.force && cache && cache.userId === userId) {
    return cache.promise;
  }
  const promise: Promise<MeData | null> = requestMe().then((data) => {
    if (data === null && cache && cache.promise === promise) {
      cache = null;
    }
    return data;
  });
  cache = { userId, promise };
  return promise;
}

export function invalidateMe(): void {
  cache = null;
}

/** Force-refetch and notify all subscribed consumers (post-checkout, etc.). */
export function refreshMe(userId: string): Promise<MeData | null> {
  const promise = fetchMe(userId, { force: true });
  promise.then(() => listeners.forEach((listener) => listener()));
  return promise;
}

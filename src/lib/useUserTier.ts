'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { isTier, Tier } from '@/lib/tiers';

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export interface UserTierState {
  user: { id: string; email: string | null } | null;
  tier: Tier;
  loading: boolean;
  /** False when Clerk env vars are absent — hide account UI entirely. */
  accountsEnabled: boolean;
}

// useUser() throws outside a ClerkProvider, and the provider is only mounted
// when Clerk is configured. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is inlined at
// build time, so selecting the hook implementation at module level keeps the
// hook order stable for the app's lifetime.
function useClerkUserState() {
  const { user, isLoaded } = useUser();
  return {
    user: user ? { id: user.id, email: user.primaryEmailAddress?.emailAddress ?? null } : null,
    isLoaded,
  };
}

function useDisabledUserState() {
  return { user: null as { id: string; email: string | null } | null, isLoaded: true };
}

const useAuthState = CLERK_ENABLED ? useClerkUserState : useDisabledUserState;

/**
 * Client-side session + tier state. Identity comes from Clerk; the tier is
 * fetched from our /api/me route (Supabase is never queried in the browser).
 * Server-side enforcement lives in src/lib/entitlements.ts — this hook is
 * for display and soft gating only.
 */
export function useUserTier(): UserTierState {
  const { user, isLoaded } = useAuthState();
  const [tier, setTier] = useState<Tier>('free');
  const [tierLoading, setTierLoading] = useState(CLERK_ENABLED);

  useEffect(() => {
    if (!CLERK_ENABLED || !isLoaded) return;
    if (!user) {
      setTier('free');
      setTierLoading(false);
      return;
    }

    let cancelled = false;
    setTierLoading(true);
    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((data) => {
        if (cancelled) return;
        setTier(isTier(data?.tier) ? data.tier : 'free');
        setTierLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    user,
    tier,
    loading: CLERK_ENABLED ? !isLoaded || tierLoading : false,
    accountsEnabled: CLERK_ENABLED,
  };
}

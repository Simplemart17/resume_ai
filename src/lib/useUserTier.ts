'use client';

import { useEffect, useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { Tier } from '@/lib/tiers';
import { fetchMe, subscribeMe } from '@/lib/me';

/**
 * Client-side "accounts enabled" flag — the single definition; import it
 * instead of re-reading the env var per file. Checks the publishable key
 * only because that is all the browser can see; the server additionally
 * requires CLERK_SECRET_KEY (isClerkConfigured) and responds 503 from its
 * routes when the two halves disagree.
 */
export const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export interface UserTierState {
  user: { id: string; email: string | null } | null;
  tier: Tier;
  /** True until BOTH the Clerk session and the tier fetch have resolved. */
  loading: boolean;
  /** True once the Clerk session itself has resolved — enough to render
   * Sign in / Account links without waiting on the slower tier fetch. */
  userLoaded: boolean;
  /** False when Clerk env vars are absent — hide account UI entirely. */
  accountsEnabled: boolean;
}

// Clerk hooks throw outside a ClerkProvider, and the provider is only mounted
// when Clerk is configured. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is inlined at
// build time, so selecting the hook implementation at module level keeps the
// hook order stable for the app's lifetime. Add new Clerk hooks HERE with the
// same pattern — calling them directly in a component crashes every
// "no accounts" deployment.
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

function useClerkSignOut() {
  const { signOut } = useClerk();
  return signOut;
}

function useDisabledSignOut() {
  return async () => {};
}

/** Sign-out function that is a no-op when accounts are disabled. */
export const useSignOut = CLERK_ENABLED ? useClerkSignOut : useDisabledSignOut;

/**
 * Client-side session + tier state. Identity comes from Clerk; the tier is
 * fetched from our /api/me route via the shared cache in src/lib/me.ts, so
 * any number of mounted consumers share one request. Server-side enforcement
 * lives in src/lib/entitlements.ts — this hook is for display and soft
 * gating only.
 */
export function useUserTier(): UserTierState {
  const { user, isLoaded } = useAuthState();
  const [tier, setTier] = useState<Tier>('free');
  const [tierLoading, setTierLoading] = useState(CLERK_ENABLED);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!CLERK_ENABLED || !isLoaded) return;
    if (!userId) {
      setTier('free');
      setTierLoading(false);
      return;
    }

    let cancelled = false;
    const load = () => {
      fetchMe(userId).then((data) => {
        if (cancelled) return;
        setTier(data?.tier ?? 'free');
        setTierLoading(false);
      });
    };

    setTierLoading(true);
    load();
    // Re-read when refreshMe() lands new data (e.g. after checkout succeeds)
    // so the nav pill and template locks update without a remount.
    const unsubscribe = subscribeMe(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [userId, isLoaded]);

  return {
    user,
    tier,
    loading: CLERK_ENABLED ? !isLoaded || tierLoading : false,
    userLoaded: CLERK_ENABLED ? isLoaded : true,
    accountsEnabled: CLERK_ENABLED,
  };
}

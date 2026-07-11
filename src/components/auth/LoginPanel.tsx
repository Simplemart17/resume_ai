'use client';

import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import Logo from '@/components/Logo';
import { CLERK_ENABLED } from '@/lib/useUserTier';
import { AccountsNotConfigured } from './AccountsNotConfigured';

// ClerkProvider is only mounted in the root layout when the publishable key
// is set, and <SignIn /> throws outside a ClerkProvider — the fallback card
// covers exactly that "no accounts" deployment mode.
export function LoginPanel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex flex-col items-center px-4 py-16">
        <Link href="/" className="mb-8">
          <Logo size={40} />
        </Link>

        {CLERK_ENABLED ? (
          <SignIn fallbackRedirectUrl="/" signUpFallbackRedirectUrl="/" />
        ) : (
          <AccountsNotConfigured description="Sign-in requires authentication to be set up by the site operator. You can still use the resume builder and all free features without an account." />
        )}
      </div>
    </div>
  );
}

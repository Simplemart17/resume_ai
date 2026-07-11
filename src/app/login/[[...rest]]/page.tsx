'use client';

import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import Logo from '@/components/Logo';

// NEXT_PUBLIC_ vars are inlined at build time, so this is a stable constant.
// ClerkProvider is only mounted in the root layout when this key is set, and
// <SignIn /> throws outside a ClerkProvider — the fallback card below covers
// exactly that "no accounts" deployment mode.
const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex flex-col items-center px-4 py-16">
        <Link href="/" className="mb-8">
          <Logo size={40} />
        </Link>

        {CLERK_ENABLED ? (
          <SignIn fallbackRedirectUrl="/" signUpFallbackRedirectUrl="/" />
        ) : (
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Accounts are not configured on this deployment
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              Sign-in requires authentication to be set up by the site operator. You can still use
              the resume builder and all free features without an account.
            </p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

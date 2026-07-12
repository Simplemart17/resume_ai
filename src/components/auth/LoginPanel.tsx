'use client';

import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { LogoMark } from '@/components/Logo';
import { CLERK_ENABLED } from '@/lib/useUserTier';
import { AccountsNotConfigured } from './AccountsNotConfigured';

// Map Clerk's widget onto the design system so the auth moment doesn't look
// like a stock demo: pen accent, 3px corners, the app's own type + surfaces.
const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: '#4b41d6',
    colorText: '#16181d',
    colorTextSecondary: '#565b64',
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    borderRadius: '3px',
    fontFamily: 'var(--font-instrument), ui-sans-serif, system-ui, sans-serif',
  },
  elements: {
    card: 'shadow-none border border-rule',
    headerTitle: 'font-display',
    formButtonPrimary: 'bg-pen hover:bg-pen-deep text-sm normal-case',
    footerActionLink: 'text-pen hover:text-pen-deep',
  },
} as const;

// ClerkProvider is only mounted in the root layout when the publishable key
// is set, and <SignIn /> throws outside a ClerkProvider — the fallback card
// covers exactly that "no accounts" deployment mode.
export function LoginPanel() {
  if (!CLERK_ENABLED) {
    return (
      <div className="min-h-screen bg-bench flex flex-col items-center px-4 py-16">
        <Link href="/" className="mb-8 inline-flex items-center gap-2.5">
          <LogoMark size={36} />
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            ResumeAI<span className="text-pen"> Pro</span>
          </span>
        </Link>
        <AccountsNotConfigured description="Sign-in requires authentication to be set up by the site operator. You can still use the resume builder and all free features without an account." />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Product proof rail — turns the auth screen into a brand surface. */}
      <div className="ink-field hidden lg:flex flex-col justify-between p-12 xl:p-16">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <LogoMark size={32} />
          <span className="font-display text-xl font-bold tracking-tight text-paper">
            ResumeAI<span className="text-pen-light"> Pro</span>
          </span>
        </Link>

        <div className="max-w-md">
          <h1 className="font-display text-4xl xl:text-5xl font-bold tracking-tight leading-[1.05] text-paper">
            Written for people.
            <br />
            <span className="mark-hit">Read by machines.</span>
          </h1>
          <p className="mt-5 text-paper/70 leading-relaxed">
            Sign in to unlock the templates you&apos;ve bought and keep your plan and purchase
            history in one place.
          </p>
          <div className="machine-strip machine-strip--ink mt-8 inline-flex rounded-[3px]">
            <span className="machine-token">[ats]</span>
            <span>parse ok</span>
            <span>·</span>
            <span>match 78/100</span>
          </div>
        </div>

        <p className="font-mono text-xs text-paper/50">
          <span className="text-pen-light">[resumeai]</span> written for people · read by machines
        </p>
      </div>

      {/* Sign-in card. */}
      <div className="bg-bench flex flex-col items-center justify-center px-4 py-16">
        <Link href="/" className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
          <LogoMark size={34} />
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            ResumeAI<span className="text-pen"> Pro</span>
          </span>
        </Link>
        <SignIn
          appearance={CLERK_APPEARANCE}
          fallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
        />
      </div>
    </div>
  );
}

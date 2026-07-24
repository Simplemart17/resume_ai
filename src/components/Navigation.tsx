'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import { useUserTier, UserTierState } from '@/lib/useUserTier';
import { TIERS, isPaidTier } from '@/lib/tiers';

const APP_LINKS = [
  { href: '/builder', label: 'Resume Builder' },
  { href: '/optimize', label: 'AI Optimizer' },
  { href: '/autofill', label: 'Auto-Fill' },
];

// Only meaningful for signed-in users — appended to APP_LINKS when accounts are
// enabled and a session exists, so signed-out / no-accounts visitors never hit
// a page that just tells them to sign in.
const DOCUMENTS_LINK = { href: '/documents', label: 'Documents' };

// Marketing links shown on the landing page (desktop and mobile menus).
// The "Start a resume" CTA is rendered separately since it is styled differently.
const MARKETING_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#templates', label: 'Templates' },
  { href: '#pricing', label: 'Pricing' },
  { href: '/optimize', label: 'AI Optimize' },
  { href: '/autofill', label: 'Auto-Fill' },
];

// Tier pill shown next to the "Account" link for paid tiers — a mono badge,
// like a stamp on the document.
const PILL_TIER =
  'ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-wider bg-pen-wash text-pen';
// Variant for when the Account link itself has the pen-wash active background.
const PILL_ON_ACTIVE =
  'ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-wider bg-pen text-paper';

// Shared link treatments: quiet ink links; the active page gets a pen rule
// under the label — an underline drawn by the editor, not a filled pill.
const DESK_LINK = 'px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink transition-colors';
const DESK_LINK_ACTIVE =
  'px-3 py-2 text-sm font-medium text-ink underline decoration-pen decoration-2 underline-offset-[10px]';
const MOBILE_LINK =
  'block px-3 py-2.5 rounded-[3px] text-base font-medium text-ink-soft hover:text-ink hover:bg-bench transition-colors';
const MOBILE_LINK_ACTIVE =
  'block px-3 py-2.5 rounded-[3px] text-base font-medium bg-pen-wash text-pen';

/**
 * Sign in / Account link for the nav. Hidden only when accounts are disabled
 * (no Clerk env vars) or until the Clerk session resolves; the link itself
 * doesn't wait on the slower /api/me tier fetch — only the paid-tier pill
 * does, so a slow or failing tier lookup can't hide the Account link.
 */
function AuthNavItem({
  auth,
  signInClassName,
  accountClassName,
  pillClassName,
}: {
  auth: UserTierState;
  signInClassName: string;
  accountClassName: string;
  pillClassName: string;
}) {
  if (!auth.accountsEnabled || !auth.userLoaded) return null;

  return auth.user ? (
    <Link href="/account" className={accountClassName}>
      Account
      {!auth.loading && isPaidTier(auth.tier) && (
        <span className={pillClassName}>{TIERS[auth.tier].name}</span>
      )}
    </Link>
  ) : (
    <Link href="/login" className={signInClassName}>
      Sign in
    </Link>
  );
}

function MarketingLink({ href, label, className }: { href: string; label: string; className: string }) {
  // Same-page anchors use a plain <a>; real routes use Next's <Link>
  return href.startsWith('#') ? (
    <a href={href} className={className}>
      {label}
    </a>
  ) : (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const auth = useUserTier();
  const appLinks =
    auth.accountsEnabled && auth.user ? [...APP_LINKS, DOCUMENTS_LINK] : APP_LINKS;

  // Close mobile menu whenever the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Elevate the sticky bar once the page leaves the top, so it detaches from
  // the content instead of sitting flat.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  return (
    <nav
      className={`bg-paper/90 backdrop-blur-sm sticky top-0 z-50 transition-shadow duration-200 ${
        scrolled ? 'border-b border-rule shadow-[0_1px_16px_-8px_rgb(22_24_29/0.4)]' : 'border-b border-rule'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex-shrink-0">
            <Logo size={32} />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:block">
            {isLanding ? (
              <div className="ml-10 flex items-center gap-1">
                {MARKETING_LINKS.map((link) => (
                  <MarketingLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    className={DESK_LINK}
                  />
                ))}
                <AuthNavItem
                  auth={auth}
                  signInClassName={DESK_LINK}
                  accountClassName={DESK_LINK}
                  pillClassName={PILL_TIER}
                />
                <Link href="/builder" className="btn-ink ml-3 px-5 py-2 text-sm">
                  Start a resume
                </Link>
              </div>
            ) : (
              <div className="ml-10 flex items-center gap-1">
                {appLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={pathname === link.href ? DESK_LINK_ACTIVE : DESK_LINK}
                  >
                    {link.label}
                  </Link>
                ))}
                <AuthNavItem
                  auth={auth}
                  signInClassName={DESK_LINK}
                  accountClassName={pathname === '/account' ? DESK_LINK_ACTIVE : DESK_LINK}
                  pillClassName={PILL_TIER}
                />
              </div>
            )}
          </div>

          {/* Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-ink-soft hover:text-ink transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-modal-panel" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-paper border-t border-rule">
            {isLanding ? (
              <>
                {MARKETING_LINKS.map((link) => (
                  <MarketingLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    className={MOBILE_LINK}
                  />
                ))}
                <AuthNavItem
                  auth={auth}
                  signInClassName={MOBILE_LINK}
                  accountClassName={MOBILE_LINK}
                  pillClassName={PILL_TIER}
                />
                <Link href="/builder" className="btn-ink block px-3 py-2.5 text-base">
                  Start a resume
                </Link>
              </>
            ) : (
              <>
                {appLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={pathname === link.href ? MOBILE_LINK_ACTIVE : MOBILE_LINK}
                  >
                    {link.label}
                  </Link>
                ))}
                <AuthNavItem
                  auth={auth}
                  signInClassName={MOBILE_LINK}
                  accountClassName={pathname === '/account' ? MOBILE_LINK_ACTIVE : MOBILE_LINK}
                  pillClassName={pathname === '/account' ? PILL_ON_ACTIVE : PILL_TIER}
                />
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

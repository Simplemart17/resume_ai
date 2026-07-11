'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Logo from './Logo';

const APP_LINKS = [
  { href: '/builder', label: 'Resume Builder' },
  { href: '/optimize', label: 'AI Optimizer' },
  { href: '/autofill', label: 'Auto-Fill' },
];

// Marketing links shown on the landing page (desktop and mobile menus).
// The "Get Started" CTA is rendered separately since it is styled differently.
const MARKETING_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#templates', label: 'Templates' },
  { href: '#pricing', label: 'Pricing' },
  { href: '/optimize', label: 'AI Optimize' },
  { href: '/autofill', label: 'Auto-Fill' },
];

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

  // Close mobile menu whenever the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex-shrink-0">
            <Logo size={34} />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:block">
            {isLanding ? (
              <div className="ml-10 flex items-baseline space-x-4">
                {MARKETING_LINKS.map((link) => (
                  <MarketingLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  />
                ))}
                <Link
                  href="/builder"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="ml-10 flex items-baseline space-x-1">
                {APP_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
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
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            {isLanding ? (
              <>
                {MARKETING_LINKS.map((link) => (
                  <MarketingLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  />
                ))}
                <Link
                  href="/builder"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  Get Started
                </Link>
              </>
            ) : (
              APP_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

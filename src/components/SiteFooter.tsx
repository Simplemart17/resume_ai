'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoMark } from './Logo';

const LINKS = [
  { href: '/builder', label: 'Resume Builder' },
  { href: '/optimize', label: 'AI Optimizer' },
  { href: '/autofill', label: 'Auto-Fill' },
  { href: '/#pricing', label: 'Pricing' },
];

/**
 * The slim closing chrome for every app route. The marketing page ships its
 * own fuller footer, so this renders nothing there — otherwise the app pages
 * (builder/optimize/autofill/account/404) would just stop at the last card.
 */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <footer className="bg-ink border-t border-paper/10 text-paper mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoMark size={26} />
            <span className="font-display text-lg font-bold tracking-tight text-paper">
              ResumeAI<span className="text-pen-light"> Pro</span>
            </span>
          </Link>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-paper/60 hover:text-paper transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-paper/10 pt-5">
          <p className="font-mono text-xs text-paper/60">
            <span className="text-pen-light">[resumeai]</span> © {new Date().getFullYear()} ·
            written for people · read by machines
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';

/**
 * Shared "no accounts on this deployment" card, shown by /login and /account
 * when Clerk env vars are absent — one component so the two pages can't
 * drift into contradictory explanations.
 */
export function AccountsNotConfigured({ description }: { description: string }) {
  return (
    <div className="w-full max-w-md mx-auto ink-panel overflow-hidden">
      <div className="p-8">
        <p className="eyebrow mb-3 text-paper/60">Operator mode</p>
        <h1 className="font-display text-xl font-semibold tracking-tight text-paper mb-2">
          Accounts aren&apos;t configured here
        </h1>
        <p className="text-paper/70 text-sm mb-6">{description}</p>
        <Link href="/" className="btn-pen px-6 py-2.5 text-sm">
          Back to home
        </Link>
      </div>
      <div className="machine-strip machine-strip--ink">
        <span className="machine-token">[accounts]</span>
        <span>disabled · all free features still work</span>
      </div>
    </div>
  );
}

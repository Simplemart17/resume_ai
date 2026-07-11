import Link from 'next/link';

/**
 * Shared "no accounts on this deployment" card, shown by /login and /account
 * when Clerk env vars are absent — one component so the two pages can't
 * drift into contradictory explanations.
 */
export function AccountsNotConfigured({ description }: { description: string }) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
      <h1 className="text-xl font-bold text-gray-900 mb-2">
        Accounts are not configured on this deployment
      </h1>
      <p className="text-gray-600 text-sm mb-6">{description}</p>
      <Link
        href="/"
        className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        Back to home
      </Link>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-bench flex items-center justify-center px-4">
      <div className="paper max-w-md w-full overflow-hidden">
        <div className="p-8 text-center">
          <p className="font-display text-6xl font-bold tracking-tight text-ink mb-3">404</p>
          <h1 className="font-semibold text-ink mb-1.5">This page isn&apos;t in the document</h1>
          <p className="text-sm text-ink-soft mb-6">
            The address may have a typo, or the page moved. Everything worth reaching is one
            click from home.
          </p>
          <Link href="/" className="btn-pen px-6 py-2.5 text-sm">
            Back to home
          </Link>
        </div>
        <div className="machine-strip">
          <span className="machine-token">[404]</span>
          <span>route not found · parse stopped</span>
        </div>
      </div>
    </div>
  );
}

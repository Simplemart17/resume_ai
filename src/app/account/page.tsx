import { Suspense } from 'react';
import { AccountPanel } from '@/components/auth/AccountPanel';

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-bench">
      <Suspense fallback={null}>
        <AccountPanel />
      </Suspense>
    </div>
  );
}

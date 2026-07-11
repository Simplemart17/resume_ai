import { Suspense } from 'react';
import { AccountPanel } from '@/components/auth/AccountPanel';

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Suspense fallback={null}>
        <AccountPanel />
      </Suspense>
    </div>
  );
}

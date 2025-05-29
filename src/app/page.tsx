import { ResumeFormatter } from '@/components/ResumeFormatter';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ResumeFormatter />
      </div>
    </div>
  );
}

import { ResumeFormatter } from '@/components/ResumeFormatter';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Resume Optimizer
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Optimize your resume for your dream job using AI-powered suggestions
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/search-jobs"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
              style={{ backgroundColor: '#4f46e5' }}
            >
              Find Job Postings
            </Link>
          </div>
        </div>
        
        <ResumeFormatter />
      </div>
    </div>
  );
}

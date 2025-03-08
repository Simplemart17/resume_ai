'use client';

import { JobSearch } from '@/components/JobSearch';

export default function SearchJobsPage() {
  return (
    <main className="min-h-screen py-10 px-6 bg-gray-50">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Search Jobs</h1>
        <p className="text-gray-600 mt-2 font-semibold">Find relevant job postings to optimize your resume</p>
      </div>
      <JobSearch />
    </main>
  );
} 
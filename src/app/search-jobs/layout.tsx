import { Metadata } from 'next/types';

export const metadata: Metadata = {
  title: 'Search Jobs - AI Resume Optimizer',
  description: 'Search for job postings to optimize your resume',
};

export default function SearchJobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
import { ResumeFormatter } from '@/components/ResumeFormatter';

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
        </div>
        
        <ResumeFormatter />
      </div>
    </div>
  );
}

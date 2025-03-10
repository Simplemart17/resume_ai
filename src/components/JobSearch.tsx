import { useState } from 'react';
import { motion } from 'framer-motion';

interface JobPosting {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  date: string;
}

export function JobSearch() {
  const [keywords, setKeywords] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [searchStats, setSearchStats] = useState<{source?: string, count: number}>({count: 0});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setJobPostings([]);
    setSearchStatus('loading');
    
    try {
      const response = await fetch('/api/search-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords,
          location
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setSearchStatus('error');
        throw new Error(data.error || 'Failed to fetch job postings');
      }
      
      if (data.jobs.length === 0) {
        setSearchStatus('error');
        setError('No job postings found matching your criteria. Try different keywords or location.');
      } else {
        setSearchStatus('success');
        setJobPostings(data.jobs);
        setSearchStats({
          source: data.source,
          count: data.jobs.length
        });
      }
    } catch (error) {
      console.error('Error fetching job postings:', error);
      setSearchStatus('error');
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to fetch job postings. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div 
        className="py-8 px-6 rounded-t-xl text-white"
        style={{
          background: 'linear-gradient(to right, rgb(79, 70, 229), rgb(147, 51, 234))'
        }}
      >
        <h1 className="text-3xl font-bold text-center mb-2">Find Relevant Job Postings</h1>
        <p className="text-center opacity-90">Search for job postings to optimize your resume</p>
      </div>

      <div className="bg-white shadow-xl rounded-b-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="keywords" className="block text-sm font-semibold text-gray-700 mb-1">
              Keywords (job title, skills, etc.)
            </label>
            <input
              id="keywords"
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="block w-full p-3 border border-gray-300 rounded-lg text-gray-900"
              placeholder="e.g., software engineer, react, javascript"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-1">
              Location (optional)
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="block w-full p-3 border border-gray-300 rounded-lg text-gray-900"
              placeholder="e.g., San Francisco, Remote"
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || !keywords}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white disabled:opacity-50"
            style={{
              background: 'linear-gradient(to right, rgb(79, 70, 229), rgb(147, 51, 234))'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Searching...' : 'Search Jobs'}
          </motion.button>
        </form>

        {error && (
          <div className="mt-4 p-4 text-red-700 bg-red-100 rounded-lg flex items-start">
            <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {searchStatus === 'success' && (
          <div className="mt-4 p-4 text-green-700 bg-green-100 rounded-lg flex items-start">
            <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Found {searchStats.count} job postings matching your criteria
              {searchStats.source && ` from ${searchStats.source}`}.
            </span>
          </div>
        )}

        {jobPostings.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Job Postings</h2>
            <div className="space-y-4">
              {jobPostings.map((job, index) => (
                <motion.div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <h3 className="text-lg font-semibold text-gray-700">{job.title}</h3>
                  <p className="text-gray-600">{job.company} • {job.location}</p>
                  <p className="text-gray-500 text-sm mt-1">{job.date}</p>
                  <p className="mt-2 text-gray-700 line-clamp-3">{job.description}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                      style={{ color: '#4f46e5' }}
                    >
                      View Job
                    </a>
                    <button
                      onClick={() => window.location.href = `/optimize?jobDesc=${encodeURIComponent(job.description)}`}
                      className="px-3 py-1 text-sm rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                      style={{ color: '#4f46e5', borderColor: '#4f46e5' }}
                    >
                      Optimize Resume
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
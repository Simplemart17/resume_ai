import { NextRequest, NextResponse } from 'next/server';

interface JobPosting {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  date: string;
}

// Mock data for demonstration and development
function getMockJobs(keywords: string, location: string): JobPosting[] {
  return [
    {
      title: `Senior ${keywords} Developer`,
      company: 'TechCorp Inc.',
      location: location || 'Remote',
      description: `We're looking for an experienced ${keywords} developer to join our team. Must have 5+ years of experience in ${keywords} and related technologies.`,
      url: 'https://example.com/job1',
      date: '3 days ago',
    },
    {
      title: `${keywords} Engineer`,
      company: 'InnovateX',
      location: location || 'San Francisco, CA',
      description: `Join our fast-growing team as a ${keywords} Engineer. You'll be responsible for developing and maintaining our core ${keywords} systems.`,
      url: 'https://example.com/job2',
      date: 'Posted today',
    },
    {
      title: `Junior ${keywords} Developer`,
      company: 'StartupHub',
      location: location || 'New York, NY',
      description: `Great opportunity for early-career ${keywords} developers. We offer mentorship and growth opportunities in a collaborative environment.`,
      url: 'https://example.com/job3',
      date: '1 week ago',
    },
    {
      title: `${keywords} Architect`,
      company: 'Enterprise Solutions',
      location: location || 'Chicago, IL',
      description: `Senior role for an experienced ${keywords} professional to design and implement scalable solutions using cutting-edge technologies.`,
      url: 'https://example.com/job4',
      date: '2 weeks ago',
    },
    {
      title: `${keywords} Consultant`,
      company: 'Global Consulting Group',
      location: location || 'Remote',
      description: `Work with diverse clients to provide expert ${keywords} consulting services. Requires strong communication skills and technical expertise.`,
      url: 'https://example.com/job5',
      date: '3 days ago',
    },
  ];
}

export async function POST(request: NextRequest) {
  try {
    const { jobSite, keywords, location } = await request.json();
    
    if (!keywords) {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }
    
    // For development purposes, we return mock data
    // In a production environment, you would implement actual web scraping
    // with appropriate proxy handling and respect for websites' terms of service
    const jobs: JobPosting[] = getMockJobs(keywords, location);
    
    return NextResponse.json({ 
      jobs,
      source: jobSite || 'mock-data'
    });
  } catch (error) {
    console.error('Error in job search API:', error);
    return NextResponse.json(
      { error: 'Failed to search for jobs' },
      { status: 500 }
    );
  }
} 
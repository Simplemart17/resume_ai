// Adzuna API Configuration
// Documentation: https://developer.adzuna.com/overview

interface JobApiConfig {
  baseUrl: string;
  country: string;
  headers: Record<string, string>;
  buildSearchParams: (keywords: string, location: string) => Record<string, string | number>;
}

// Adzuna API configuration
export const JOB_API: JobApiConfig = {
  baseUrl: 'https://api.adzuna.com/v1/api/jobs',
  country: 'us', // Default to US, can be changed to 'gb', 'ca', 'au', etc.
  headers: {
    'Content-Type': 'application/json',
  },
  buildSearchParams: (keywords: string, location: string) => {
    const params: Record<string, string | number> = {
      app_id: process.env.ADZUNA_APP_ID || '',
      app_key: process.env.ADZUNA_APP_KEY || '',
      results_per_page: 20,
      what: keywords,
    };

    // Add location if provided
    if (location) {
      params.where = location;
    }

    return params;
  },
};


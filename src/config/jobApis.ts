// Adzuna API configuration
export const JOB_API = {
  baseUrl: 'https://api.adzuna.com/v1/api/jobs',
  country: 'us', // can be configured based on user's location
  headers: {
    'Content-Type': 'application/json',
  },
  buildSearchParams: (keywords: string, location: string) => ({
    app_id: process.env.ADZUNA_APP_ID,
    app_key: process.env.ADZUNA_API_KEY,
    what: keywords,
    where: location || 'remote',
    results_per_page: 10,
    content_type: 'application/json',
    max_days_old: 30,
    sort_by: 'date'
  })
}; 
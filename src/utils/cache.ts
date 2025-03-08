// Simple in-memory cache for job search results
// In production, consider using Redis or a similar solution

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class JobCache<T> {
  private cache: Record<string, CacheEntry<T>> = {};
  private readonly ttl: number; // Time to live in milliseconds

  constructor(ttlMinutes = 60) { // Default: cache for 1 hour
    this.ttl = ttlMinutes * 60 * 1000;
    
    // Clean up expired cache entries every hour
    setInterval(() => this.cleanExpired(), 3600000);
  }

  // Generate a cache key from search parameters
  generateKey(jobSite: string, keywords: string, location: string): string {
    return `${jobSite}:${keywords.toLowerCase()}:${(location || '').toLowerCase()}`;
  }

  // Get data from cache if available and not expired
  get(key: string): T | null {
    const entry = this.cache[key];
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      delete this.cache[key];
      return null;
    }
    
    return entry.data;
  }

  // Set data in cache
  set(key: string, data: T): void {
    this.cache[key] = {
      data,
      timestamp: Date.now()
    };
  }

  // Clean expired cache entries
  cleanExpired(): void {
    const now = Date.now();
    
    Object.keys(this.cache).forEach(key => {
      if (now - this.cache[key].timestamp > this.ttl) {
        delete this.cache[key];
      }
    });
  }
}

// Export a singleton instance for job search results
export const jobCache = new JobCache();

export default jobCache; 
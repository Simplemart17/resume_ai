// Simple in-memory cache for job search results
// In production, consider using Redis or a similar solution

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class JobCache<T> {
  // Map (not a plain object): keys are user-controlled, and "__proto__"
  // would pollute a plain object. Map also preserves insertion order for LRU.
  private cache = new Map<string, CacheEntry<T>>();
  private readonly ttl: number; // Time to live in milliseconds
  private readonly maxEntries: number;

  constructor(ttlMinutes = 60, maxEntries = 500) { // Default: cache for 1 hour
    this.ttl = ttlMinutes * 60 * 1000;
    this.maxEntries = maxEntries;
    // No setInterval: expired entries are cleaned lazily on access.
  }

  // Generate a cache key from search parameters (normalized: trimmed + lowercased)
  generateKey(jobSite: string, keywords: string, location: string): string {
    const normalize = (value: string) => value.trim().toLowerCase();
    return `${normalize(jobSite)}:${normalize(keywords)}:${normalize(location || '')}`;
  }

  // Get data from cache if available and not expired
  get(key: string): T | null {
    this.cleanExpired();

    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Refresh recency for LRU ordering
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  // Set data in cache
  set(key: string, data: T): void {
    this.cleanExpired();

    // Cap entries LRU-style: evict least-recently-used (oldest in the Map)
    this.cache.delete(key);
    while (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey === undefined) break;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clean expired cache entries (called lazily on access)
  cleanExpired(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Export a singleton instance for job search results
export const jobCache = new JobCache();

export default jobCache;

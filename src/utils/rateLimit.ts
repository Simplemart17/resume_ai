import { NextRequest } from 'next/server';

// Shared in-memory per-IP rate limiter for API routes.
// NOTE: state is per server instance — it resets on restart and is not shared
// across serverless instances/replicas. Replace with Redis (or similar) in production.

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitOptions {
  limit: number;
  windowMs: number;
  bucket: string;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

// Cap per-bucket entries so attacker-controlled keys can't grow memory unboundedly.
const MAX_ENTRIES_PER_BUCKET = 5000;

// Use Maps, never plain objects: keys are attacker-controlled (e.g. spoofed
// x-forwarded-for values like "__proto__") and would pollute a plain object.
const buckets = new Map<string, Map<string, RateLimitEntry>>();

function getClientKey(request: NextRequest): string {
  // Prefer x-real-ip: it is set by the platform (Vercel, typical nginx configs)
  // and cannot be forged by the client. Fall back to the RIGHTMOST hop of
  // x-forwarded-for — proxies APPEND the real client IP, so the rightmost entry
  // is the one added by the nearest trusted proxy; everything left of it is
  // client-controlled and must not be trusted as an identity.
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const hops = forwarded.split(',');
    const nearest = hops[hops.length - 1]?.trim();
    if (nearest) return nearest;
  }

  return 'unknown';
}

export function checkRateLimit(
  request: NextRequest,
  opts: { limit: number; windowMs: number; bucket: string }
): RateLimitResult {
  const { limit, windowMs, bucket }: RateLimitOptions = opts;

  let store = buckets.get(bucket);
  if (!store) {
    store = new Map<string, RateLimitEntry>();
    buckets.set(bucket, store);
  }

  const now = Date.now();

  // Lazily clean expired entries on access (no setInterval / timers).
  for (const [key, entry] of store) {
    if (now - entry.windowStart >= windowMs) {
      store.delete(key);
    }
  }

  const clientKey = getClientKey(request);
  const existing = store.get(clientKey);

  if (!existing || now - existing.windowStart >= windowMs) {
    // Cap the Map size, evicting the oldest entries (Map preserves insertion order).
    while (store.size >= MAX_ENTRIES_PER_BUCKET) {
      const oldestKey = store.keys().next().value;
      if (oldestKey === undefined) break;
      store.delete(oldestKey);
    }
    store.set(clientKey, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.windowStart + windowMs - now) / 1000)
    );
    return { allowed: false, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

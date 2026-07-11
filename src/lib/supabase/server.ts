import { createClient } from '@supabase/supabase-js';

// Supabase is DATABASE-ONLY in this app: Clerk owns authentication, and all
// queries run server-side against the shared project's "resume" schema with
// the new-style sb_secret_ key. There is deliberately NO browser client and
// no anon/publishable-key data path — the client gets tier/usage from our
// own /api/me route.

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

function buildClient(url: string, secretKey: string) {
  return createClient(url, secretKey, {
    db: { schema: 'resume' },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Env vars are fixed for the process lifetime and the client is stateless
// (persistSession: false), so construct it once instead of per request.
let cachedDb: ReturnType<typeof buildClient> | null = null;

/**
 * Server-only Supabase client bound to the "resume" schema. Bypasses RLS
 * (secret key) — never expose to the browser, and only query with ids taken
 * from a verified Clerk session or Stripe webhook metadata.
 * Returns null when Supabase env vars are not configured.
 */
export function getSupabaseDb() {
  if (cachedDb) return cachedDb;
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) return null;
  cachedDb = buildClient(url, secretKey);
  return cachedDb;
}

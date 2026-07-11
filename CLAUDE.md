# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured in this project.

## Environment Variables

```
OPENAI_API_KEY                        # Server-side OpenAI key (dev fallback + paid-tier usage)
ADZUNA_APP_ID / ADZUNA_APP_KEY        # Adzuna job search API (route currently has no UI consumer)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY     # Clerk (optional — enables accounts mode)
CLERK_SECRET_KEY                      # Clerk server key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login  # Clerk sign-in route
SUPABASE_URL                          # Supabase project URL (database only; shared project)
SUPABASE_SECRET_KEY                   # New-style sb_secret_ key (replaces service_role) — server-only
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  # New-style sb_publishable_ key — currently unused (no browser DB access)
STRIPE_SECRET_KEY                     # Stripe secret key (optional — enables payments)
STRIPE_WEBHOOK_SECRET                 # Signing secret for /api/stripe/webhook
NEXT_PUBLIC_APP_URL                   # Optional canonical origin for Stripe redirect URLs (needed behind non-Vercel proxies)
```

Clerk, Supabase, and Stripe are all optional: with Clerk env absent the app runs in "no accounts" mode (all templates free, AI via server key or BYOK, paid buttons disabled, ClerkProvider not mounted). New code must preserve this graceful degradation.

## Architecture

**Next.js App Router** project at `src/app/`. Pages are thin wrappers that render a single component:
- `/` → `LandingPage` (server component; interactive templates modal lives in the `src/components/landing/TemplatesModal.tsx` client island — keep this page free of `'use client'` and framer-motion so it ships minimal JS)
- `/builder` → `ResumeBuilder` (main resume creation flow; orchestrator owning all state, tab bodies live in `src/components/builder/`)
- `/optimize` → `ResumeFormatter` (AI-powered ATS optimization; orchestrator owning all state, form/result panels live in `src/components/formatter/`)
- `/autofill` → `AutoFillApp` (job application auto-fill)

`Navigation` is rendered globally in `src/app/layout.tsx`. When adding UI to builder/optimize, put new tab bodies or panels in the matching subdirectory and keep state in the orchestrator.

### API Routes (`src/app/api/`)

| Route | Purpose |
|---|---|
| `parse-resume` | Server-side file parsing: PDF via `pdf-parse`, DOCX via `mammoth`, TXT raw. Legacy `.doc` is rejected with 400 |
| `format-resume` | OpenAI ATS optimization (`gpt-4o`) — returns `{ optimizedResume, matchScore, changes, matchingSkills, missingSkills }`; response shape is validated server-side |
| `generate-cover-letter` | OpenAI cover letter generation (`gpt-4o-mini`); accepts optional `resume` in the body and grounds the letter in it when present |
| `search-jobs` | Adzuna API job search with in-memory caching (1hr TTL). Currently has no client-side consumer |
| `upload-resume` | File upload handler |
| `proxy` | Server-side proxy for job site HTML scraping (allowlist: indeed.com, linkedin.com, glassdoor.com, wellfound.com; HTTPS-only, redirects rejected, 2 MB response cap). Currently has no client-side consumer |

Monetization adds `me`, `stripe/checkout`, and `stripe/webhook` (see the Monetization section). Every API route shares the per-IP rate limiter in `src/utils/rateLimit.ts`, with one deliberate exception: `stripe/webhook` is exempt because requests are Stripe-signature-verified and 429s would break Stripe's redelivery. It keys on `x-real-ip` first, then the RIGHTMOST `x-forwarded-for` hop — never the leftmost hop, which is client-controlled and spoofable. This requires a trusted proxy/platform (e.g. Vercel) that sets those headers; in-memory state is per-instance, so replace with Redis in production. Route scaffolding (429 responses, JSON-body parsing, OpenAI key extraction and error mapping) lives in `src/utils/apiHelpers.ts` — use it, never inline copies. Shared client/server constants: upload rules in `src/config/uploads.ts`, AI input caps in `src/config/apiLimits.ts`. `pdf-parse` is declared as `serverExternalPackages` in `next.config.ts` to prevent bundling issues.

### Monetization (tiers, Stripe, Supabase)

One-time lifetime purchases: Free / Pro $2 / Enterprise $5. **`src/lib/tiers.ts` is the single source of truth** for prices, quotas, template access, and the displayed feature lists — the pricing UI, checkout route, AI gating, and template gating all read from it. House rule: never list a feature in a tier that isn't enforced in code.

- **Auth is Clerk** (`@clerk/nextjs`): `ClerkProvider` is mounted conditionally in `layout.tsx`, `middleware.ts` runs `clerkMiddleware()` only when configured, `/login` renders Clerk's `<SignIn />` (optional catch-all route). Server code gets identity from `auth()`/`currentUser()`. User ids everywhere are Clerk ids (text, `user_...`).
- **Supabase is database-only**, on a SHARED project: all tables live in the **`resume` schema** (never `public`) — see `supabase/migrations/0001_monetization.sql` (`profiles` created lazily on first server access, `purchases` idempotent on `stripe_session_id`, `ai_usage` + atomic `resume.consume_ai_quota()`). Access is exclusively server-side via `getSupabaseDb()` (`src/lib/supabase/server.ts`), which binds `db.schema = 'resume'` and uses the new-style `sb_secret_` key. There is NO browser Supabase client — the client reads account data from `GET /api/me`. The `resume` schema must be added to the project's Exposed schemas (Dashboard → Settings → API).
- **Stripe**: `/api/stripe/checkout` (Clerk-authenticated) creates a mode=payment session with inline `price_data` from TIERS (no dashboard products); `/api/stripe/webhook` verifies signatures and fulfills idempotently, upgrading the profile via the atomic `resume.upgrade_tier()` SQL function (monotonic — concurrent deliveries can never downgrade). The Stripe SDK client comes from `getStripe()` in `src/lib/stripe.ts` (lazy, memoized, null when unconfigured).
- **Entitlements** (`src/lib/entitlements.ts`): `getEntitlement()` resolves Clerk user → tier server-side and returns `degraded: true` on DB errors — gate callers must treat degraded as 5xx, never as free. `consumeAiQuota()` atomically spends monthly quota; `refundAiQuota()` returns an op when the OpenAI call fails after the spend. Client display/soft-gating uses `useUserTier()` (Clerk `useUser` + `/api/me` via the shared cached fetcher in `src/lib/me.ts` — all mounted consumers share one request; `refreshMe()` invalidates and notifies them all). Server routes must enforce with `getEntitlement`, never trust the client. Template gating is CLIENT-ONLY (PDFs are generated in the browser) — it is a purchase prompt, not a security boundary.
- **AI route gating** lives in `resolveOpenAIKey()` in `src/utils/apiHelpers.ts` (shared by format-resume and generate-cover-letter — never inline a copy): Bearer key present → user's key, no quota (BYOK is free for everyone). No key → anonymous 401, free tier 403, paid tier uses the server key under quota (429 when exhausted; the env-key existence check runs BEFORE the quota spend, and routes refund the op on any post-spend failure). Only when Clerk is ENTIRELY unconfigured do routes fall back to the legacy ungated server-key behavior for dev; inconsistent config (one Clerk key only, or Clerk without Supabase) fails loudly with 503 — see `isClerkMisconfigured()`.

### OpenAI API Key Flow

AI API routes accept the key via `Authorization: Bearer <key>` header; without it, access to `process.env.OPENAI_API_KEY` is gated by `resolveOpenAIKey()` (see AI route gating above). On the client side, `ApiKeyManager` (`src/utils/apiKeyManager.ts`) is a singleton that persists the key in `sessionStorage` by default (`localStorage` only when the user opts into persistence). The client attaches the header whenever a key is set, in any environment. In development, `hasApiKey()` always returns `true`. The client never hard-blocks keyless submissions when accounts are enabled — paid tiers use the server key, so the UI lets the server's 401/403/429 messages guide the user.

### PDF Generation

`NewPDFGenerator` (`src/utils/newPdfGenerator.ts`) uses `jsPDF` to produce PDFs from structured `ResumeData`. Supported template IDs: `modern-professional`, `classic-traditional`, `creative-designer`, `executive-premium`. The creative and executive templates reuse the classic/modern layout internally.

Templates are rendered in `NewResumeTemplates` (`src/components/NewResumeTemplates.tsx`), which accepts optional `resumeData` (defaults to empty) and optional `selectedTemplate` (defaults to `'modern-professional'`). Template display metadata (name, description, color, features) lives in `src/config/templates.ts` — import `TEMPLATES` from there; do not redeclare per component (`src/lib/tiers.ts` derives `TEMPLATE_IDS_ALL` from it).

### Branding

The logo lives in `src/components/Logo.tsx` (`Logo` = mark + wordmark, `LogoMark` = mark only) and the favicon is `src/app/icon.svg` (Next.js file convention). Both draw the same mark: a rounded blue→purple gradient tile with a résumé silhouette and gold spark. Brand gradient tokens: `#2563EB` → `#9333EA` (Tailwind `blue-600`/`purple-600`).

### Job Search Caching

`src/utils/cache.ts` exports a singleton `JobCache` instance. Cache keys are `"adzuna:<keywords>:<location>"` (normalized to trimmed lowercase). The store is a `Map` capped at 500 entries with LRU eviction and lazy expiry. In production, Redis should replace this in-memory store.

### Shared Resume Types

`src/types/resume.ts` is the single source of truth for `PersonalInfo`, `Experience`, `Education`, and `ResumeData` interfaces. Import from here in all components — do not redeclare locally. `AutoFillApp` uses a separate `ExtractedData` shape that matches the `parse-resume` API response and should not be merged with `ResumeData`.

### Navigation

`Navigation` (`src/components/Navigation.tsx`) renders marketing links (Features, Templates, Pricing, AI Optimize, Auto-Fill, Get Started) when `pathname === '/'` and app links (Resume Builder / AI Optimizer / Auto-Fill) with active-state highlight on all other pages. Desktop and mobile menus render from the same `MARKETING_LINKS` array. Do not add inline sub-navigation bars to page components.

### File Upload Validation

Both `upload-resume` and `parse-resume` delegate validation and text extraction to `src/utils/extractResumeText.ts`, driven by the shared rules in `src/config/uploads.ts` (10 MB limit → HTTP 413; PDF, DOCX, TXT; legacy `.doc` rejected with a convert-to-docx message). Client uploaders import the same config for their `accept` lists and pre-validation — never hardcode file rules in a component or route.

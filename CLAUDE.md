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
OPENAI_API_KEY    # Server-side OpenAI key (required for AI features in dev)
ADZUNA_APP_ID     # Adzuna job search API ID
ADZUNA_APP_KEY    # Adzuna job search API key
```

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

All network-facing routes share the per-IP rate limiter in `src/utils/rateLimit.ts` (in-memory, keyed on the first `x-forwarded-for` hop; replace with Redis in production). `pdf-parse` is declared as `serverExternalPackages` in `next.config.ts` to prevent bundling issues.

### OpenAI API Key Flow

AI API routes accept the key via `Authorization: Bearer <key>` header, falling back to `process.env.OPENAI_API_KEY`. On the client side, `ApiKeyManager` (`src/utils/apiKeyManager.ts`) is a singleton that persists the key in `sessionStorage` by default (`localStorage` only when the user opts into persistence). The client attaches the header whenever a key is set, in any environment. In development, `hasApiKey()` always returns `true`.

### PDF Generation

`NewPDFGenerator` (`src/utils/newPdfGenerator.ts`) uses `jsPDF` to produce PDFs from structured `ResumeData`. Supported template IDs: `modern-professional`, `classic-traditional`, `creative-designer`, `executive-premium`. The creative and executive templates reuse the classic/modern layout internally.

Templates are rendered in `NewResumeTemplates` (`src/components/NewResumeTemplates.tsx`), which accepts optional `resumeData` (defaults to empty) and optional `selectedTemplate` (defaults to `'modern-professional'`). The `custom` template ID shows an informative message and falls back to modern-professional. Template display metadata (name, description, color, features) lives in `src/config/templates.ts` — import `TEMPLATES` from there; do not redeclare per component.

### Branding

The logo lives in `src/components/Logo.tsx` (`Logo` = mark + wordmark, `LogoMark` = mark only) and the favicon is `src/app/icon.svg` (Next.js file convention). Both draw the same mark: a rounded blue→purple gradient tile with a résumé silhouette and gold spark. Brand gradient tokens: `#2563EB` → `#9333EA` (Tailwind `blue-600`/`purple-600`).

### Job Search Caching

`src/utils/cache.ts` exports a singleton `JobCache` instance. Cache keys are `"adzuna:<keywords>:<location>"` (normalized to trimmed lowercase). The store is a `Map` capped at 500 entries with LRU eviction and lazy expiry. In production, Redis should replace this in-memory store.

### Shared Resume Types

`src/types/resume.ts` is the single source of truth for `PersonalInfo`, `Experience`, `Education`, and `ResumeData` interfaces. Import from here in all components — do not redeclare locally. `AutoFillApp` uses a separate `ExtractedData` shape that matches the `parse-resume` API response and should not be merged with `ResumeData`.

### Navigation

`Navigation` (`src/components/Navigation.tsx`) renders marketing links (Features, Templates, AI Optimize, Auto-Fill, Get Started) when `pathname === '/'` and app links (Resume Builder / AI Optimizer / Auto-Fill) with active-state highlight on all other pages. Do not add inline sub-navigation bars to page components.

### File Upload Validation

Both `upload-resume` and `parse-resume` routes enforce a 10 MB file size limit (HTTP 413). Supported types: PDF, DOCX, TXT.

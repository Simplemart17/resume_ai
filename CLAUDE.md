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
- `/` → `LandingPage`
- `/builder` → `ResumeBuilder` (main resume creation flow)
- `/optimize` → `ResumeFormatter` (AI-powered ATS optimization)
- `/autofill` → `AutoFillApp` (job application auto-fill)

`Navigation` is rendered globally in `src/app/layout.tsx`.

### API Routes (`src/app/api/`)

| Route | Purpose |
|---|---|
| `parse-resume` | Server-side file parsing: PDF via `pdf-parse`, DOCX via `mammoth`, TXT raw |
| `format-resume` | OpenAI ATS optimization — returns `{ optimizedResume, matchScore, changes, matchingSkills, missingSkills }` |
| `generate-cover-letter` | OpenAI cover letter generation using `gpt-4-turbo-preview` |
| `search-jobs` | Adzuna API job search with in-memory caching (1hr TTL) and rate limiting (5 req/min/IP) |
| `upload-resume` | File upload handler |
| `proxy` | Server-side proxy for job site HTML scraping (allowlist: indeed.com, linkedin.com, glassdoor.com, wellfound.com) |

`pdf-parse` is declared as `serverExternalPackages` in `next.config.ts` to prevent bundling issues.

### OpenAI API Key Flow

AI API routes accept the key via `Authorization: Bearer <key>` header, falling back to `process.env.OPENAI_API_KEY`. On the client side, `ApiKeyManager` (`src/utils/apiKeyManager.ts`) is a singleton that persists the key in `localStorage` (or `sessionStorage`). In development, `hasApiKey()` always returns `true`.

### PDF Generation

`NewPDFGenerator` (`src/utils/newPdfGenerator.ts`) uses `jsPDF` to produce PDFs from structured `ResumeData`. Supported template IDs: `modern-professional`, `classic-traditional`, `creative-designer`, `executive-premium`. The creative and executive templates reuse the classic/modern layout internally.

Templates are rendered in `NewResumeTemplates` (`src/components/NewResumeTemplates.tsx`), which accepts optional `resumeData` (defaults to empty) and optional `selectedTemplate` (defaults to `'modern-professional'`). The `custom` template ID shows an informative message and falls back to modern-professional.

### Job Search Caching

`src/utils/cache.ts` exports a singleton `JobCache` instance. Cache keys are `"adzuna:<keywords>:<location>"`. In production, the comment notes Redis should replace this in-memory store.

### Shared Resume Types

`src/types/resume.ts` is the single source of truth for `PersonalInfo`, `Experience`, `Education`, and `ResumeData` interfaces. Import from here in all components — do not redeclare locally. `AutoFillApp` uses a separate `ExtractedData` shape that matches the `parse-resume` API response and should not be merged with `ResumeData`.

### Navigation

`Navigation` (`src/components/Navigation.tsx`) renders marketing links (Features, Templates, AI Optimize, Auto-Fill, Get Started) when `pathname === '/'` and app links (Resume Builder / AI Optimizer / Auto-Fill) with active-state highlight on all other pages. Do not add inline sub-navigation bars to page components.

### File Upload Validation

Both `upload-resume` and `parse-resume` routes enforce a 10 MB file size limit (HTTP 413). Supported types: PDF, DOCX, TXT.

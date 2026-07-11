# ResumeAI Pro 🚀

An AI-powered resume builder: create a resume with structured forms or by uploading an existing one, optimize it against a job description with match scoring, generate tailored cover letters, and download polished PDFs. One-time-purchase Pro/Enterprise tiers unlock premium templates and AI usage on our key.

## Features

- **Resume builder** (`/builder`) — Upload / Build / Templates / Preview tabs: parse an existing PDF/DOCX/TXT resume into editable structured forms, or build from scratch.
- **AI optimizer** (`/optimize`) — ATS optimization against a pasted job description: rewritten resume, match score, changes made, matching and missing skills (skill-gap analysis), and a tailored cover letter grounded in your actual resume.
- **Auto-fill assistant** (`/autofill`) — extracts your details (contact info, summary, skills) from a resume so you can copy them into job applications with one click. (It does not submit or fill external sites for you.)
- **4 PDF templates** — Modern Professional, Classic Traditional, Creative Designer, Executive Premium; multi-page-safe generation via jsPDF.

## Pricing

One-time payments — no subscriptions. Every listed feature is enforced in code.

| | Free | Pro — $2 once | Enterprise — $5 once |
|---|---|---|---|
| Templates | Modern + Classic | All 4 | All 4 |
| PDF downloads | Unlimited | Unlimited | Unlimited |
| AI with your own OpenAI key | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| AI on our key (no key needed) | — | 20 ops/month | 100 ops/month |
| Priority email support | — | — | ✅ |

Without Supabase/Stripe configured (see below), the app runs in a free "no accounts" mode: all templates unlocked, AI via the server key or BYOK.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion
- **AI**: OpenAI (`gpt-4o` for optimization, `gpt-4o-mini` for cover letters)
- **PDF**: jsPDF · **Charts**: Chart.js · **Parsing**: pdf-parse, mammoth
- **Auth**: Clerk · **Database**: Supabase Postgres (shared project, dedicated `resume` schema, server-side only) · **Payments**: Stripe Checkout (one-time)

## Getting Started

### 1. Install and configure

```bash
git clone <repository-url> && cd resume_ai
npm install
cp .env.example .env.local
```

Fill in `.env.local` (see the comments in [.env.example](.env.example)):

- `OPENAI_API_KEY` — required for AI features in dev.
- Supabase + Stripe vars — optional; only needed for accounts and payments.

### 2. (Optional) Accounts — Clerk + Supabase

**Clerk (authentication):**
1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com); copy the publishable and secret keys into `.env.local`, and set `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`.

**Supabase (database only — works on a shared project):**
1. Copy the project URL and the new-style **secret key** (`sb_secret_...`) into `.env.local`. The legacy anon/service-role keys are not used; the publishable key (`sb_publishable_...`) is documented in `.env.example` but not currently consumed (there is no browser database access).
2. Apply the migration: paste [supabase/migrations/0001_monetization.sql](supabase/migrations/0001_monetization.sql) into the SQL editor (or `supabase db push`). Everything lives in a dedicated **`resume` schema** so it won't collide with other apps sharing the project.
3. Dashboard → Settings → API → **Exposed schemas**: add `resume` (PostgREST only serves listed schemas).

### 3. (Optional) Payments — Stripe

1. Put your secret key in `STRIPE_SECRET_KEY`. Prices ($2/$5) are defined in code (`src/lib/tiers.ts`) — no dashboard products needed.
2. Create a webhook endpoint pointing at `<your-domain>/api/stripe/webhook`, subscribed to `checkout.session.completed` and `checkout.session.async_payment_succeeded`; put its signing secret in `STRIPE_WEBHOOK_SECRET`.
3. Local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

### 4. Run

```bash
npm run dev    # http://localhost:3000
```

## API Key Handling (honest version)

Your OpenAI key, if you provide one in the app, is stored only in your browser (sessionStorage by default, localStorage if you opt in) and sent over HTTPS to **this app's API routes**, which forward it to OpenAI. It is never stored server-side. Paid tiers don't need a key — their AI calls use the server's key under monthly fair-use quotas.

## Deployment

Deploy to [Vercel](https://vercel.com) (recommended — the per-IP rate limiter trusts Vercel's proxy headers): set all env vars in the dashboard, and point your Stripe webhook at the production URL. Other Next.js hosts work too, but must sit behind a trusted proxy that sets `x-real-ip`, and the in-memory rate limiter/cache should be replaced with Redis for multi-instance deployments.

## Contributing

1. Fork, branch (`git checkout -b feature/thing`), commit, open a PR.
2. `npm run lint` and `npm run build` must pass. No test framework is configured yet.
3. House rule: never advertise a feature (README, landing page, tier lists) that isn't enforced in code — tiers live in `src/lib/tiers.ts`.

## License

MIT

---

**Made with ❤️ for job seekers everywhere**

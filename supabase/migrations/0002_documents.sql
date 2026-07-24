-- Saved documents for ResumeAI, on the SAME shared Supabase project as
-- 0001_monetization.sql: everything lives in the dedicated "resume" schema,
-- never in public. Auth is Clerk, so every user_id is a Clerk user id (text),
-- and ALL access happens server-side with the sb_secret_ key — no client-facing
-- RLS policies by design (RLS is enabled with no policies as a belt-and-braces
-- lockout for the anon/authenticated roles; the secret key bypasses RLS).
--
-- Setup:
--   1. Run 0001_monetization.sql first (creates the schema + grants).
--   2. Run this file in the Supabase SQL editor (or `supabase db push`).
--   3. Dashboard → Settings → API → "Exposed schemas" must include "resume"
--      (already required by 0001; PostgREST only serves listed schemas).

-- gen_random_uuid() lives in pgcrypto; enabled by default on Supabase, but be
-- explicit so a fresh project doesn't fail on the DEFAULT below.
create extension if not exists pgcrypto;

-- Base resumes: the source resume a user uploaded. We keep both the extracted
-- text (enough to re-run optimization / regenerate exports) and a pointer to
-- the original file in Storage so the exact upload can be re-downloaded.
create table if not exists resume.base_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text,
  resume_text text not null,
  storage_path text,           -- path within the private "resume-files" bucket (nullable)
  file_name text,
  file_type text,
  file_size integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists base_resumes_user_id_idx
  on resume.base_resumes (user_id, created_at desc);

-- Optimized resumes: one saved run of the ATS optimizer. The AI output is a
-- plain-text resume; the parser findings are kept as jsonb for the exports and
-- the /documents hub.
create table if not exists resume.optimized_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  base_resume_id uuid references resume.base_resumes (id) on delete set null,
  title text,
  job_title text,
  company text,
  job_description text,
  optimized_text text not null,
  match_score integer,
  changes jsonb not null default '[]'::jsonb,
  matching_skills jsonb not null default '[]'::jsonb,
  missing_skills jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists optimized_resumes_user_id_idx
  on resume.optimized_resumes (user_id, created_at desc);

-- Cover letters: generated either standalone (from a base resume) or grounded
-- in an optimized resume. Content is the sanitized HTML the generator returns.
create table if not exists resume.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  base_resume_id uuid references resume.base_resumes (id) on delete set null,
  optimized_resume_id uuid references resume.optimized_resumes (id) on delete set null,
  title text,
  job_title text,
  company text,
  job_description text,
  content_html text not null,
  created_at timestamptz not null default now()
);

create index if not exists cover_letters_user_id_idx
  on resume.cover_letters (user_id, created_at desc);

-- RLS on with no policies: lock out anon/authenticated; the secret key
-- (service_role) bypasses RLS. Mirrors 0001_monetization.sql.
alter table resume.base_resumes enable row level security;
alter table resume.optimized_resumes enable row level security;
alter table resume.cover_letters enable row level security;

-- Grants for the new tables/sequences. 0001 already set default privileges for
-- the schema, but grant explicitly so re-running this file alone is sufficient.
grant all on all tables in schema resume to service_role;
grant all on all sequences in schema resume to service_role;

-- Private Storage bucket for original resume files. Server-only access via the
-- secret key; downloads are served through short-lived signed URLs. If your
-- project restricts direct writes to storage.buckets, create the bucket in
-- Dashboard → Storage instead (name "resume-files", Public = off).
insert into storage.buckets (id, name, public)
values ('resume-files', 'resume-files', false)
on conflict (id) do nothing;

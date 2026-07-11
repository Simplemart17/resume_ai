-- Monetization schema for ResumeAI Pro on a SHARED Supabase project:
-- everything lives in the dedicated "resume" schema, never in public.
-- Auth is handled by Clerk, so user_id columns are Clerk user ids (text),
-- and ALL access happens server-side with the sb_secret_ key — there are
-- no client-facing RLS policies by design.
--
-- Setup:
--   1. Run this file in the Supabase SQL editor (or `supabase db push`).
--   2. Dashboard → Settings → API → "Exposed schemas": add "resume"
--      (PostgREST only serves schemas on that list, even to secret keys).

create schema if not exists resume;

-- The app never queries this schema from the browser; deny the client roles
-- outright and let only the secret key (service_role) through.
revoke all on schema resume from anon, authenticated;
grant usage on schema resume to service_role;

-- Profiles: one row per Clerk user, created lazily on first server access.
create table if not exists resume.profiles (
  user_id text primary key,
  tier text not null default 'free' check (tier in ('free', 'pro', 'enterprise')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Purchases: one row per completed Stripe Checkout Session (idempotent on
-- the session id — the webhook can be delivered more than once).
create table if not exists resume.purchases (
  id bigint generated always as identity primary key,
  user_id text not null,
  tier text not null check (tier in ('pro', 'enterprise')),
  stripe_session_id text not null unique,
  amount_cents integer not null,
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_id_idx on resume.purchases (user_id);

-- AI usage: per-user, per-calendar-month counter for server-key AI calls.
create table if not exists resume.ai_usage (
  user_id text not null,
  period text not null, -- 'YYYY-MM'
  count integer not null default 0,
  primary key (user_id, period)
);

-- RLS on with no policies: belt-and-braces lockout for anon/authenticated;
-- the secret key (service_role) bypasses RLS.
alter table resume.profiles enable row level security;
alter table resume.purchases enable row level security;
alter table resume.ai_usage enable row level security;

grant all on all tables in schema resume to service_role;
grant all on all sequences in schema resume to service_role;
alter default privileges in schema resume grant all on tables to service_role;
alter default privileges in schema resume grant all on sequences to service_role;

-- Atomic quota consumption: increments and returns the new count, or
-- returns -1 without incrementing when the quota is already exhausted.
create or replace function resume.consume_ai_quota(
  p_user_id text,
  p_period text,
  p_quota integer
)
returns integer
language plpgsql
security definer set search_path = resume
as $$
declare
  new_count integer;
begin
  insert into resume.ai_usage (user_id, period, count)
  values (p_user_id, p_period, 1)
  on conflict (user_id, period)
  do update set count = ai_usage.count + 1
  where ai_usage.count < p_quota
  returning count into new_count;

  if new_count is null then
    return -1;
  end if;
  return new_count;
end;
$$;

grant execute on function resume.consume_ai_quota(text, text, integer) to service_role;
revoke execute on function resume.consume_ai_quota(text, text, integer) from anon, authenticated;

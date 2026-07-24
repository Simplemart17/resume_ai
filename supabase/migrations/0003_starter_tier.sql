-- Adds the new one-time "starter" tier ($1) between free and pro. Free stays
-- the $0 unpaid default (no library saving); starter unlocks saving. Prices are
-- Free $0 / Starter $1 / Pro $2 / Enterprise $5 — all one-time, all BYOK AI.
--
-- Run after 0001 and 0002, in the Supabase SQL editor (or `supabase db push`).
-- This only widens CHECK constraints and updates the rank array in
-- resume.upgrade_tier — no data migration needed; existing rows stay valid.

-- profiles.tier: allow 'starter' (the tier CHECK from 0001 is unnamed, so drop
-- it by discovering its name, then re-add the widened constraint).
do $$
declare
  cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'resume.profiles'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%tier%';
  if cname is not null then
    execute format('alter table resume.profiles drop constraint %I', cname);
  end if;
end $$;

alter table resume.profiles
  add constraint profiles_tier_check
  check (tier in ('free', 'starter', 'pro', 'enterprise'));

-- purchases.tier: allow 'starter' among the paid tiers.
do $$
declare
  cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'resume.purchases'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%tier%';
  if cname is not null then
    execute format('alter table resume.purchases drop constraint %I', cname);
  end if;
end $$;

alter table resume.purchases
  add constraint purchases_tier_check
  check (tier in ('starter', 'pro', 'enterprise'));

-- Monotonic upgrade: identical logic to 0001, only the rank array gains
-- 'starter' so a purchase can never downgrade across the new ordering.
create or replace function resume.upgrade_tier(
  p_user_id text,
  p_tier text
)
returns void
language plpgsql
security definer set search_path = resume
as $$
begin
  insert into resume.profiles (user_id, tier)
  values (p_user_id, p_tier)
  on conflict (user_id) do update
  set tier = excluded.tier,
      updated_at = now()
  where array_position(array['free', 'starter', 'pro', 'enterprise'], profiles.tier)
      < array_position(array['free', 'starter', 'pro', 'enterprise'], excluded.tier);
end;
$$;

-- Re-assert the lockdown from 0001 (create or replace resets grants to PUBLIC).
revoke execute on function resume.upgrade_tier(text, text) from public;
grant execute on function resume.upgrade_tier(text, text) to service_role;

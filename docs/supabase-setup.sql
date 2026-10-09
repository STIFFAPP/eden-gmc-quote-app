-- EDEN GMC Quote App cloud database setup
-- Run once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.eden_jobs (
  id uuid primary key default gen_random_uuid(),
  public_ref text unique not null default ('ED-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
  owner_id uuid null references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'Quote',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eden_settings (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  price_guide jsonb not null default '{}'::jsonb,
  account_settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.eden_jobs enable row level security;
alter table public.eden_settings enable row level security;

-- Public quote creation is deliberately NOT exposed as a direct anonymous table INSERT.
-- The SECURITY DEFINER RPC below only accepts a quote payload and returns its public reference.
create or replace function public.eden_submit_quote(p_payload jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare v_ref text;
begin
  insert into public.eden_jobs(payload,status)
  values (coalesce(p_payload,'{}'::jsonb),'Quote')
  returning public_ref into v_ref;
  return v_ref;
end;
$$;

revoke all on function public.eden_submit_quote(jsonb) from public;
grant execute on function public.eden_submit_quote(jsonb) to anon, authenticated;

-- Authenticated owner can read/write only records attached to their account.
drop policy if exists eden_jobs_owner_select on public.eden_jobs;
create policy eden_jobs_owner_select on public.eden_jobs for select to authenticated using (owner_id = auth.uid());
drop policy if exists eden_jobs_owner_update on public.eden_jobs;
create policy eden_jobs_owner_update on public.eden_jobs for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists eden_jobs_owner_insert on public.eden_jobs;
create policy eden_jobs_owner_insert on public.eden_jobs for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists eden_jobs_owner_delete on public.eden_jobs;
create policy eden_jobs_owner_delete on public.eden_jobs for delete to authenticated using (owner_id = auth.uid());

drop policy if exists eden_settings_owner_all on public.eden_settings;
create policy eden_settings_owner_all on public.eden_settings for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Attach previously anonymous/public quotes to the first authenticated Eden owner.
-- Call this once after signing in. This deliberately only claims unowned records.
create or replace function public.eden_claim_unowned_jobs()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.eden_jobs set owner_id=auth.uid(),updated_at=now() where owner_id is null;
  get diagnostics n = row_count;
  return n;
end;
$$;
revoke all on function public.eden_claim_unowned_jobs() from public;
grant execute on function public.eden_claim_unowned_jobs() to authenticated;

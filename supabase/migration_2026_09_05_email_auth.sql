-- ============================================================
-- Afya Drop — MIGRATION: Email OTP login
-- Replaces old password-based logic with passwordless
-- (email magic-link/OTP). Run after the earlier
-- schema.sql / migration_2026_09_05_africa.sql have been applied.
--
-- This is SAFE to re-run: all statements use IF EXISTS / IF NOT EXISTS.
-- ============================================================

-- ============================================================
-- PART 1: DELETE UNWANTED THINGS
-- ============================================================

-- Drop the custom OTP table — Supabase Auth manages OTPs now.
drop table if exists public.otp_codes cascade;

-- Drop the phone column from users (no longer collecting phone numbers).
-- First drop any constraints/indexes that reference it.
alter table public.users drop constraint if exists users_phone_key;
drop index if exists public.otp_codes_phone_idx;
alter table public.users drop column if exists phone;

-- Drop phone_verified — replaced by profile_completed.
alter table public.users drop column if exists phone_verified;

-- ============================================================
-- PART 2: ADD NEW COLUMNS & CONSTRAINTS
-- ============================================================

-- Add email (unique, nullable initially for existing rows).
alter table public.users
  add column if not exists email text;

-- Add unique constraint on email (skip if already exists).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_email_key'
  ) then
    alter table public.users add constraint users_email_key unique (email);
  end if;
end $$;

-- Add profile_completed flag (tracks whether the user has filled in their
-- qualification/licence_number after Supabase Auth sign-up).
alter table public.users
  add column if not exists profile_completed boolean not null default false;

-- Make qualification and licence_number nullable (they're filled in after
-- auth sign-up via PATCH /auth/profile, not at account creation time).
alter table public.users
  alter column qualification drop not null,
  alter column licence_number drop not null;

-- ============================================================
-- PART 3: LINK TO SUPABASE AUTH
-- ============================================================

-- For a FRESH project (no existing rows in public.users), uncomment this
-- to enforce that every user must have a matching auth.users entry:
-- alter table public.users
--   add constraint users_id_fkey foreign key (id) references auth.users(id) on delete cascade;

-- Auto-create a public.users row whenever someone signs up via Supabase Auth
-- (email OTP). Profile fields are filled in afterwards.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ============================================================
-- PART 4: INDEXES
-- ============================================================

create index if not exists users_email_idx on public.users (email);

-- ============================================================
-- PART 5: ROW LEVEL SECURITY (updated for auth.users)
-- ============================================================

-- Allow users to read their own profile.
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

-- Allow users to update their own profile (for profile completion).
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Allow users to read their own wallet.
create policy "Users can read own wallet"
  on public.wallets for select
  using (auth.uid() = user_id);

-- Allow users to read their own credit transactions.
create policy "Users can read own transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

-- Allow users to read their own Q&A logs.
create policy "Users can read own qa_logs"
  on public.qa_logs for select
  using (auth.uid() = user_id);

-- Allow users to read their own payments.
create policy "Users can read own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- Backend uses the SERVICE ROLE key (bypasses RLS) for all writes.
-- These policies are for any direct client-side reads only.

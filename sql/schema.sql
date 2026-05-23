-- sql/schema.sql
-- ============================================================
-- PHYSICIANWEALTH SUPABASE SCHEMA
-- Run this in Supabase SQL Editor to create all tables
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text,
  last_name text,
  email text,
  -- Medical
  specialty text default 'Cardiology',
  state text default 'NY',
  age integer default 35,
  stage text default 'early', -- resident, early, mid, senior
  npi_number text,
  -- Financial
  salary numeric default 0,
  married boolean default false,
  loans numeric default 250000,
  savings numeric default 50000,
  retirement numeric default 100000,
  investments numeric default 80000,
  -- Spouse
  has_spouse boolean default false,
  spouse_specialty text,
  spouse_salary numeric default 0,
  spouse_loans numeric default 0,
  -- App preferences
  priorities text[] default '{}', -- array of module IDs
  onboarding_complete boolean default false,
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: users can only read/write their own profile
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'firstName',
    new.raw_user_meta_data->>'lastName'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. SUBSCRIPTIONS (Stripe integration)
-- ============================================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  -- Plan info
  plan text default 'trial', -- free, trial, pro, premium
  status text default 'active', -- active, past_due, canceled, expired
  -- Stripe IDs
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  -- Trial
  trial_start timestamptz default now(),
  trial_end timestamptz default (now() + interval '30 days'),
  -- Billing
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  canceled_at timestamptz,
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;
create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users can update own subscription" on public.subscriptions for update using (auth.uid() = user_id);
create policy "Users can insert own subscription" on public.subscriptions for insert with check (auth.uid() = user_id);

-- Auto-create trial subscription on signup
create or replace function public.handle_new_subscription()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, plan, status, trial_start, trial_end)
  values (new.id, 'trial', 'active', now(), now() + interval '30 days');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_subscription();

-- ============================================================
-- 3. PLAID LINKED ACCOUNTS
-- ============================================================
create table public.plaid_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  -- Plaid data
  plaid_item_id text,
  plaid_access_token text, -- encrypted in production
  institution_id text,
  institution_name text,
  institution_color text,
  institution_logo text,
  -- Account details
  account_name text,
  account_type text, -- checking, savings, retirement, investment, credit
  account_subtype text,
  balance numeric default 0,
  currency text default 'USD',
  mask text, -- last 4 digits
  -- Sync
  last_synced_at timestamptz,
  sync_status text default 'active', -- active, error, disconnected
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.plaid_accounts enable row level security;
create policy "Users can view own accounts" on public.plaid_accounts for select using (auth.uid() = user_id);
create policy "Users can manage own accounts" on public.plaid_accounts for all using (auth.uid() = user_id);

create index idx_plaid_accounts_user on public.plaid_accounts(user_id);

-- ============================================================
-- 4. NOTIFICATION PREFERENCES
-- ============================================================
create table public.notification_prefs (
  user_id uuid references auth.users(id) on delete cascade primary key,
  email_weekly_summary boolean default true,
  email_tax_deadlines boolean default true,
  email_license_expiry boolean default true,
  email_market_alerts boolean default false,
  email_product_updates boolean default true,
  push_fi_milestones boolean default true,
  push_bill_reminders boolean default true,
  push_rate_changes boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.notification_prefs enable row level security;
create policy "Users can view own prefs" on public.notification_prefs for select using (auth.uid() = user_id);
create policy "Users can manage own prefs" on public.notification_prefs for all using (auth.uid() = user_id);

-- Auto-create notification prefs on signup
create or replace function public.handle_new_notification_prefs()
returns trigger as $$
begin
  insert into public.notification_prefs (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_notifs
  after insert on public.profiles
  for each row execute function public.handle_new_notification_prefs();

-- ============================================================
-- 5. SAVED DOCUMENTS (for Doc Scanner)
-- ============================================================
create table public.saved_documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  filename text,
  file_url text, -- Supabase Storage URL
  file_type text, -- contract, insurance, tax, other
  analysis_result jsonb, -- AI analysis output
  score integer,
  tags text[],
  created_at timestamptz default now()
);

alter table public.saved_documents enable row level security;
create policy "Users can manage own docs" on public.saved_documents for all using (auth.uid() = user_id);

-- ============================================================
-- 6. AUDIT LOG (track important user actions)
-- ============================================================
create table public.audit_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text, -- signup, login, plan_change, account_linked, etc.
  metadata jsonb,
  created_at timestamptz default now()
);

alter table public.audit_log enable row level security;
create policy "Users can view own log" on public.audit_log for select using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_subscriptions_user on public.subscriptions(user_id);
create index idx_subscriptions_stripe on public.subscriptions(stripe_customer_id);
create index idx_saved_docs_user on public.saved_documents(user_id);
create index idx_audit_user on public.audit_log(user_id);

-- ============================================================
-- 7. DOCUMENT VAULT (expanded)
-- ============================================================
-- Drop and recreate saved_documents with richer schema
-- (Run this AFTER initial schema if upgrading)

ALTER TABLE IF EXISTS public.saved_documents
  ADD COLUMN IF NOT EXISTS content_text text,
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS ai_key_findings jsonb,
  ADD COLUMN IF NOT EXISTS file_size integer,
  ADD COLUMN IF NOT EXISTS source_module text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'uploaded';
  -- status: uploaded, analyzing, analyzed, error

-- ============================================================
-- 8. USER CONTEXT (.md summary per user)
-- ============================================================
create table if not exists public.user_context (
  user_id uuid references auth.users(id) on delete cascade primary key,
  context_md text default '',
  last_rebuilt timestamptz default now(),
  doc_count integer default 0,
  total_findings integer default 0,
  updated_at timestamptz default now()
);

alter table public.user_context enable row level security;
create policy "Users can view own context" on public.user_context for select using (auth.uid() = user_id);
create policy "Users can manage own context" on public.user_context for all using (auth.uid() = user_id);

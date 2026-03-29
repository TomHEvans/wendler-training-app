-- Hyrox Training App Schema
-- Run this in your Supabase SQL editor to set up the database

-- Weekly plans (JSON blob per week)
create table if not exists plans (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Exercise completions
create table if not exists completions (
  id uuid primary key default gen_random_uuid(),
  exercise_key text not null,
  day_date text not null,
  completed boolean default true,
  completed_at timestamptz default now(),
  unique(exercise_key, day_date)
);

-- Changelog for full traceability
create table if not exists changelog (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  details text,
  week_id text,
  created_at timestamptz default now()
);

-- Enable Row Level Security (open access for personal app)
alter table plans enable row level security;
alter table completions enable row level security;
alter table changelog enable row level security;

-- Allow all operations with anon key (personal app, no auth needed)
create policy "Allow all on plans" on plans for all using (true) with check (true);
create policy "Allow all on completions" on completions for all using (true) with check (true);
create policy "Allow all on changelog" on changelog for all using (true) with check (true);

-- Index for fast completion lookups
create index if not exists idx_completions_day on completions(day_date);
create index if not exists idx_changelog_created on changelog(created_at desc);

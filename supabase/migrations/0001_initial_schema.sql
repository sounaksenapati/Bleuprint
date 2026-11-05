-- Initial Bleuprint schema for a new Supabase project.
-- Review before applying to an existing database.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'team', 'enterprise')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  is_public boolean not null default false,
  thumbnail_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.constraints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  constraint_data jsonb not null,
  version integer not null check (version > 0),
  created_at timestamptz not null default now(),
  unique (project_id, version)
);

create table if not exists public.artifacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  constraint_version integer not null check (constraint_version > 0),
  artifact_type text not null check (artifact_type in ('cad', 'firmware', 'schematic', 'bom', 'prd')),
  content text not null,
  file_path text not null default '',
  generated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  category text not null check (category in ('iot', 'robotics', 'wearable', 'automation')),
  initial_intent text not null,
  thumbnail_url text not null default '',
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists projects_user_updated_idx on public.projects (user_id, updated_at desc);
create index if not exists constraints_project_version_idx on public.constraints (project_id, version desc);
create index if not exists artifacts_project_generated_idx on public.artifacts (project_id, generated_at desc);
create index if not exists chat_messages_project_created_idx on public.chat_messages (project_id, created_at);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.constraints enable row level security;
alter table public.artifacts enable row level security;
alter table public.chat_messages enable row level security;
alter table public.templates enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "Users can manage their own projects" on public.projects;
create policy "Users can manage their own projects" on public.projects
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can manage constraints for their projects" on public.constraints;
create policy "Users can manage constraints for their projects" on public.constraints
  for all to authenticated
  using (exists (select 1 from public.projects p where p.id = constraints.project_id and p.user_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = constraints.project_id and p.user_id = (select auth.uid())));

drop policy if exists "Users can manage artifacts for their projects" on public.artifacts;
create policy "Users can manage artifacts for their projects" on public.artifacts
  for all to authenticated
  using (exists (select 1 from public.projects p where p.id = artifacts.project_id and p.user_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = artifacts.project_id and p.user_id = (select auth.uid())));

drop policy if exists "Users can manage chat for their projects" on public.chat_messages;
create policy "Users can manage chat for their projects" on public.chat_messages
  for all to authenticated
  using (exists (select 1 from public.projects p where p.id = chat_messages.project_id and p.user_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = chat_messages.project_id and p.user_id = (select auth.uid())));

drop policy if exists "Anyone can read featured templates" on public.templates;
create policy "Anyone can read featured templates" on public.templates
  for select using (is_featured = true);

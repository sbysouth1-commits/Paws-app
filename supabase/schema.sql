-- Pawsitive Kids — database schema + row-level security
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS / idempotent policies).
--
-- Data model follows the app spec §4. The sensitive tables (children,
-- therapist_resources, success_stories, purchases) are locked down with RLS so
-- a family can only ever read its own rows. The public `resources` catalogue is
-- readable by any signed-in user.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per parent account. id matches the Supabase auth user id.
create table if not exists public.families (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  parent_name text,
  created_at  timestamptz not null default now()
);
alter table public.families add column if not exists parent_name text;

-- One child per family in V1 (schema already allows more).
create table if not exists public.children (
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references public.families (id) on delete cascade,
  name       text not null,
  age        int,
  focus_area text,
  created_at timestamptz not null default now()
);

-- Public catalogue of resources for sale.
create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text not null,
  age_range   text,
  price_aud   numeric(10,2) not null default 0,
  description text,
  file_url    text,
  tag         text,
  created_at  timestamptz not null default now()
);

-- What a family has bought.
create table if not exists public.purchases (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null references public.families (id) on delete cascade,
  resource_id  uuid not null references public.resources (id) on delete cascade,
  purchased_at timestamptz not null default now(),
  unique (family_id, resource_id)
);

-- Private resources the therapist drops for a specific child.
create table if not exists public.therapist_resources (
  id             uuid primary key default gen_random_uuid(),
  child_id       uuid not null references public.children (id) on delete cascade,
  therapist_name text,
  title          text not null,
  category       text,
  note           text,
  file_url       text,
  shared_at      timestamptz not null default now()
);

-- Private milestone updates the therapist logs for a specific child.
create table if not exists public.success_stories (
  id             uuid primary key default gen_random_uuid(),
  child_id       uuid not null references public.children (id) on delete cascade,
  therapist_name text,
  title          text not null,
  story          text,
  occurred_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Auto-create a families row when a new auth user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.families (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.families            enable row level security;
alter table public.children            enable row level security;
alter table public.resources           enable row level security;
alter table public.purchases           enable row level security;
alter table public.therapist_resources enable row level security;
alter table public.success_stories     enable row level security;

-- families: a user sees and edits only their own row.
drop policy if exists "families_select_own" on public.families;
create policy "families_select_own" on public.families
  for select using (id = auth.uid());
drop policy if exists "families_update_own" on public.families;
create policy "families_update_own" on public.families
  for update using (id = auth.uid());

-- children: scoped to the owning family (family id == auth user id).
drop policy if exists "children_select_own" on public.children;
create policy "children_select_own" on public.children
  for select using (family_id = auth.uid());
drop policy if exists "children_insert_own" on public.children;
create policy "children_insert_own" on public.children
  for insert with check (family_id = auth.uid());
drop policy if exists "children_update_own" on public.children;
create policy "children_update_own" on public.children
  for update using (family_id = auth.uid());
drop policy if exists "children_delete_own" on public.children;
create policy "children_delete_own" on public.children
  for delete using (family_id = auth.uid());

-- resources: public catalogue — any signed-in user can read.
drop policy if exists "resources_select_all" on public.resources;
create policy "resources_select_all" on public.resources
  for select using (auth.role() = 'authenticated');

-- purchases: a family reads and creates only its own.
drop policy if exists "purchases_select_own" on public.purchases;
create policy "purchases_select_own" on public.purchases
  for select using (family_id = auth.uid());
drop policy if exists "purchases_insert_own" on public.purchases;
create policy "purchases_insert_own" on public.purchases
  for insert with check (family_id = auth.uid());

-- therapist_resources: readable only for the family's own children.
drop policy if exists "therapist_resources_select_own" on public.therapist_resources;
create policy "therapist_resources_select_own" on public.therapist_resources
  for select using (
    child_id in (select id from public.children where family_id = auth.uid())
  );

-- success_stories: readable only for the family's own children.
drop policy if exists "success_stories_select_own" on public.success_stories;
create policy "success_stories_select_own" on public.success_stories
  for select using (
    child_id in (select id from public.children where family_id = auth.uid())
  );

-- Note: therapist_resources and success_stories are written by you (the
-- business owner) via the Supabase table editor, so they intentionally have no
-- family-facing insert/update policies — families get read-only access.

-- ---------------------------------------------------------------------------
-- File storage
-- ---------------------------------------------------------------------------
-- Two private buckets. Upload files yourself in the dashboard (Storage →
-- resource-files / therapist-files), then paste the file's path into the
-- matching row's file_url column (Table editor). The app asks Storage for a
-- short-lived signed URL each time someone taps "Open resource" — nothing is
-- public, and the policies below only allow a family to fetch a file it has
-- actually purchased (resource-files) or that was shared with its own child
-- (therapist-files).
insert into storage.buckets (id, name, public)
values ('resource-files', 'resource-files', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('therapist-files', 'therapist-files', false)
on conflict (id) do nothing;

alter table storage.objects enable row level security;

drop policy if exists "resource_files_select_if_purchased" on storage.objects;
create policy "resource_files_select_if_purchased" on storage.objects
  for select using (
    bucket_id = 'resource-files'
    and exists (
      select 1
      from public.purchases p
      join public.resources r on r.id = p.resource_id
      where p.family_id = auth.uid()
        and r.file_url = storage.objects.name
    )
  );

drop policy if exists "therapist_files_select_if_own_child" on storage.objects;
create policy "therapist_files_select_if_own_child" on storage.objects
  for select using (
    bucket_id = 'therapist-files'
    and exists (
      select 1
      from public.therapist_resources tr
      join public.children c on c.id = tr.child_id
      where c.family_id = auth.uid()
        and tr.file_url = storage.objects.name
    )
  );

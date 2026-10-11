-- Pawsitive Kids — database schema + row-level security
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS / idempotent policies).
--
-- Data model follows the app spec §4. The sensitive tables (children,
-- therapist_resources, success_stories, purchases) are locked down with RLS so
-- a family can only ever read its own rows. The public `resources` catalogue is
-- readable by any signed-in user.
--
-- Admin access: after running this file, make your own account the business
-- owner by running (in a new query, once you've signed up in the app):
--   update public.families set role = 'admin' where email = 'you@example.com';
-- That unlocks the Admin tab in the app for that account. From there, admins
-- can promote other signed-up accounts to 'admin' or 'therapist' via the
-- in-app Team screen — no more manual SQL needed after this first one.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per parent account. id matches the Supabase auth user id.
-- role marks staff accounts — see "Admin access" above. 'family' (the
-- default) is a normal parent account; 'admin' and 'therapist' are staff.
create table if not exists public.families (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  parent_name text,
  role        text not null default 'family',
  created_at  timestamptz not null default now()
);
alter table public.families add column if not exists parent_name text;
alter table public.families add column if not exists role text not null default 'family';

-- One-time migration from the old boolean flag to the role column above.
-- Only runs if the old column is still there, so it's a no-op after the
-- first time this file runs against a given database.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'families' and column_name = 'is_admin'
  ) then
    update public.families set role = 'admin' where is_admin = true;
    alter table public.families drop column is_admin;
  end if;
end $$;

alter table public.families drop constraint if exists families_role_check;
alter table public.families add constraint families_role_check
  check (role in ('family', 'admin', 'therapist'));

-- Safety net: block demoting or deleting the very last remaining admin
-- account, so the business can never end up with zero admins by accident
-- (whether via the in-app Team screen or a direct table edit). Because
-- children/therapist_resources/etc. reference families with ON DELETE
-- CASCADE, and Postgres fires BEFORE DELETE triggers as part of a cascaded
-- delete, this also blocks deleting the last admin's auth.users row entirely
-- (e.g. from Authentication → Users in the dashboard) — not just editing role.
create or replace function public.prevent_last_admin_removal()
returns trigger
language plpgsql
as $$
begin
  if old.role = 'admin' and (tg_op = 'DELETE' or new.role is distinct from 'admin') then
    if (select count(*) from public.families where role = 'admin' and id <> old.id) = 0 then
      raise exception 'Cannot remove the last remaining admin account.';
    end if;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_last_admin_removal_trigger on public.families;
create trigger prevent_last_admin_removal_trigger
  before update or delete on public.families
  for each row execute function public.prevent_last_admin_removal();

-- One child per family in V1 (schema already allows more). therapist_id is
-- set by an admin (via the Team/Families admin screens) to assign the child
-- to one of the therapist-role accounts; null until assigned.
create table if not exists public.children (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references public.families (id) on delete cascade,
  name          text not null,
  age           int,
  focus_area    text,
  therapist_id  uuid references public.families (id),
  created_at    timestamptz not null default now()
);
alter table public.children add column if not exists therapist_id uuid references public.families (id);
create index if not exists children_therapist_id_idx on public.children (therapist_id);

-- A medication the family tracks for their child. Strictly family-private —
-- no admin or therapist access, same as children itself: this is the
-- family's own health record-keeping, not shared business content.
-- times is a list of "HH:MM" (24h) daily dose times, e.g. {'08:00','20:00'}.
create table if not exists public.medications (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references public.children (id) on delete cascade,
  name         text not null,
  dosage       text,
  instructions text,
  times        text[] not null default '{}',
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists medications_child_id_idx on public.medications (child_id);

-- One logged dose (given or skipped) for a medication.
create table if not exists public.medication_logs (
  id            uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications (id) on delete cascade,
  status        text not null default 'given',
  taken_at      timestamptz not null default now(),
  note          text,
  created_at    timestamptz not null default now()
);
alter table public.medication_logs drop constraint if exists medication_logs_status_check;
alter table public.medication_logs add constraint medication_logs_status_check
  check (status in ('given', 'skipped'));
create index if not exists medication_logs_medication_id_idx on public.medication_logs (medication_id);

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

-- What a family has bought. Only ever written by the stripe-webhook Edge
-- Function (via the service role) after Stripe confirms payment — see the
-- policies below, which deliberately give the app no insert access.
create table if not exists public.purchases (
  id                uuid primary key default gen_random_uuid(),
  family_id         uuid not null references public.families (id) on delete cascade,
  resource_id       uuid not null references public.resources (id) on delete cascade,
  purchased_at      timestamptz not null default now(),
  stripe_session_id text,
  unique (family_id, resource_id)
);
alter table public.purchases add column if not exists stripe_session_id text;

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

-- Role checks for the signed-in user. Each only ever reads the caller's own
-- row (id = auth.uid()), so there's no privilege-escalation risk — but they
-- MUST be security definer (bypassing RLS internally): these functions are
-- themselves used inside families'/children's own RLS policies, so a
-- non-definer version would have its internal query re-evaluate those same
-- policies, which call these functions again — Postgres chases that cycle
-- until it hits "stack depth limit exceeded". security definer breaks the
-- loop by reading the row directly, with no policy evaluation in between.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.families where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_therapist()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.families where id = auth.uid() and role = 'therapist');
$$;

-- True for either staff role — used where admins and therapists share access
-- (e.g. reading their own families row) but their write scope still differs.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.families where id = auth.uid() and role in ('admin', 'therapist'));
$$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.families            enable row level security;
alter table public.children            enable row level security;
alter table public.resources           enable row level security;
alter table public.purchases           enable row level security;
alter table public.therapist_resources enable row level security;
alter table public.success_stories     enable row level security;

-- families: a user sees and edits only their own row; the admin sees every
-- family (needed to pick a family/child in the in-app Admin section); a
-- therapist sees only the families whose child is assigned to them.
drop policy if exists "families_select_own" on public.families;
create policy "families_select_own" on public.families
  for select using (id = auth.uid());
drop policy if exists "families_select_admin" on public.families;
create policy "families_select_admin" on public.families
  for select using (public.is_admin());
drop policy if exists "families_select_therapist" on public.families;
create policy "families_select_therapist" on public.families
  for select using (
    public.is_therapist()
    and id in (select family_id from public.children where therapist_id = auth.uid())
  );
drop policy if exists "families_update_own" on public.families;
create policy "families_update_own" on public.families
  for update using (id = auth.uid());
-- Admin can update any family's row — this is how the in-app Team screen
-- promotes an account to 'admin' or 'therapist' (or demotes it back to
-- 'family'), without needing manual SQL after the very first admin.
drop policy if exists "families_update_admin" on public.families;
create policy "families_update_admin" on public.families
  for update using (public.is_admin());

-- children: scoped to the owning family (family id == auth user id); the
-- admin can also see every child; a therapist sees only children assigned to
-- them (their own clients — not every family's, per the sensitivity of this
-- data, spec §4).
drop policy if exists "children_select_own" on public.children;
create policy "children_select_own" on public.children
  for select using (family_id = auth.uid());
drop policy if exists "children_select_admin" on public.children;
create policy "children_select_admin" on public.children
  for select using (public.is_admin());
drop policy if exists "children_select_therapist" on public.children;
create policy "children_select_therapist" on public.children
  for select using (public.is_therapist() and therapist_id = auth.uid());
drop policy if exists "children_insert_own" on public.children;
create policy "children_insert_own" on public.children
  for insert with check (family_id = auth.uid());
drop policy if exists "children_update_own" on public.children;
create policy "children_update_own" on public.children
  for update using (family_id = auth.uid());
-- Admin-only: assigning a child to a therapist (therapists can't reassign
-- their own or anyone else's clients).
drop policy if exists "children_update_admin" on public.children;
create policy "children_update_admin" on public.children
  for update using (public.is_admin());
drop policy if exists "children_delete_own" on public.children;
create policy "children_delete_own" on public.children
  for delete using (family_id = auth.uid());

-- resources: public catalogue — any signed-in user can read; only the admin
-- can add or edit resources (families never write to this table).
drop policy if exists "resources_select_all" on public.resources;
create policy "resources_select_all" on public.resources
  for select using (auth.role() = 'authenticated');
drop policy if exists "resources_insert_admin" on public.resources;
create policy "resources_insert_admin" on public.resources
  for insert with check (public.is_admin());
drop policy if exists "resources_update_admin" on public.resources;
create policy "resources_update_admin" on public.resources
  for update using (public.is_admin());

-- purchases: a family reads only its own. No insert policy — the app has no
-- way to write a purchase row; only the stripe-webhook Edge Function can
-- (via the service role, which bypasses RLS entirely). This line intentionally
-- drops any old insert policy from a previous version of this schema.
drop policy if exists "purchases_select_own" on public.purchases;
create policy "purchases_select_own" on public.purchases
  for select using (family_id = auth.uid());
drop policy if exists "purchases_insert_own" on public.purchases;

-- therapist_resources: readable only for the family's own children. The admin
-- can read/add/edit every child's. A therapist can read/add/edit only for
-- children assigned to them — their own clients, not the whole business —
-- which is the whole point of assigning a therapist to a child.
drop policy if exists "therapist_resources_select_own" on public.therapist_resources;
create policy "therapist_resources_select_own" on public.therapist_resources
  for select using (
    child_id in (select id from public.children where family_id = auth.uid())
  );
drop policy if exists "therapist_resources_select_admin" on public.therapist_resources;
create policy "therapist_resources_select_admin" on public.therapist_resources
  for select using (public.is_admin());
drop policy if exists "therapist_resources_select_therapist" on public.therapist_resources;
create policy "therapist_resources_select_therapist" on public.therapist_resources
  for select using (
    public.is_therapist()
    and child_id in (select id from public.children where therapist_id = auth.uid())
  );
drop policy if exists "therapist_resources_insert_admin" on public.therapist_resources;
create policy "therapist_resources_insert_admin" on public.therapist_resources
  for insert with check (public.is_admin());
drop policy if exists "therapist_resources_insert_therapist" on public.therapist_resources;
create policy "therapist_resources_insert_therapist" on public.therapist_resources
  for insert with check (
    public.is_therapist()
    and child_id in (select id from public.children where therapist_id = auth.uid())
  );
drop policy if exists "therapist_resources_update_admin" on public.therapist_resources;
create policy "therapist_resources_update_admin" on public.therapist_resources
  for update using (public.is_admin());
drop policy if exists "therapist_resources_update_therapist" on public.therapist_resources;
create policy "therapist_resources_update_therapist" on public.therapist_resources
  for update using (
    public.is_therapist()
    and child_id in (select id from public.children where therapist_id = auth.uid())
  );

-- success_stories: same access pattern as therapist_resources above.
drop policy if exists "success_stories_select_own" on public.success_stories;
create policy "success_stories_select_own" on public.success_stories
  for select using (
    child_id in (select id from public.children where family_id = auth.uid())
  );
drop policy if exists "success_stories_select_admin" on public.success_stories;
create policy "success_stories_select_admin" on public.success_stories
  for select using (public.is_admin());
drop policy if exists "success_stories_select_therapist" on public.success_stories;
create policy "success_stories_select_therapist" on public.success_stories
  for select using (
    public.is_therapist()
    and child_id in (select id from public.children where therapist_id = auth.uid())
  );
drop policy if exists "success_stories_insert_admin" on public.success_stories;
create policy "success_stories_insert_admin" on public.success_stories
  for insert with check (public.is_admin());
drop policy if exists "success_stories_insert_therapist" on public.success_stories;
create policy "success_stories_insert_therapist" on public.success_stories
  for insert with check (
    public.is_therapist()
    and child_id in (select id from public.children where therapist_id = auth.uid())
  );
drop policy if exists "success_stories_update_admin" on public.success_stories;
create policy "success_stories_update_admin" on public.success_stories
  for update using (public.is_admin());
drop policy if exists "success_stories_update_therapist" on public.success_stories;
create policy "success_stories_update_therapist" on public.success_stories
  for update using (
    public.is_therapist()
    and child_id in (select id from public.children where therapist_id = auth.uid())
  );

-- Note: no delete policies on the tables above, on purpose — the Admin
-- section can add and edit but never delete, so a mistake can't destroy a
-- family's purchase history or private content. Use the Supabase table editor
-- (as the project owner, which bypasses RLS) for the rare case you need to
-- remove something.

alter table public.medications     enable row level security;
alter table public.medication_logs enable row level security;

-- medications: fully owned by the family — unlike the admin-content tables
-- above, delete IS allowed here, since this is the family's own data (same
-- as children itself, which already allows delete).
drop policy if exists "medications_select_own" on public.medications;
create policy "medications_select_own" on public.medications
  for select using (
    child_id in (select id from public.children where family_id = auth.uid())
  );
drop policy if exists "medications_insert_own" on public.medications;
create policy "medications_insert_own" on public.medications
  for insert with check (
    child_id in (select id from public.children where family_id = auth.uid())
  );
drop policy if exists "medications_update_own" on public.medications;
create policy "medications_update_own" on public.medications
  for update using (
    child_id in (select id from public.children where family_id = auth.uid())
  );
drop policy if exists "medications_delete_own" on public.medications;
create policy "medications_delete_own" on public.medications
  for delete using (
    child_id in (select id from public.children where family_id = auth.uid())
  );

-- medication_logs: same ownership check, one join further through
-- medications -> children -> family_id.
drop policy if exists "medication_logs_select_own" on public.medication_logs;
create policy "medication_logs_select_own" on public.medication_logs
  for select using (
    medication_id in (
      select m.id from public.medications m
      join public.children c on c.id = m.child_id
      where c.family_id = auth.uid()
    )
  );
drop policy if exists "medication_logs_insert_own" on public.medication_logs;
create policy "medication_logs_insert_own" on public.medication_logs
  for insert with check (
    medication_id in (
      select m.id from public.medications m
      join public.children c on c.id = m.child_id
      where c.family_id = auth.uid()
    )
  );
drop policy if exists "medication_logs_delete_own" on public.medication_logs;
create policy "medication_logs_delete_own" on public.medication_logs
  for delete using (
    medication_id in (
      select m.id from public.medications m
      join public.children c on c.id = m.child_id
      where c.family_id = auth.uid()
    )
  );

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

-- storage.objects already has row-level security enabled by Supabase itself
-- (only Supabase can toggle that flag — a project owner's SQL editor role
-- can't, even though it can still create/drop policies on it, which is all
-- we need below).

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

-- Uploads: only the admin can add files to the public catalogue bucket
-- (pricing/catalogue stays an admin-only decision). Either staff role can
-- upload to the private therapist-files bucket, since that's per-child
-- content therapists are meant to add themselves.
drop policy if exists "resource_files_insert_admin" on storage.objects;
create policy "resource_files_insert_admin" on storage.objects
  for insert with check (bucket_id = 'resource-files' and public.is_admin());

drop policy if exists "therapist_files_insert_admin" on storage.objects;
create policy "therapist_files_insert_admin" on storage.objects
  for insert with check (bucket_id = 'therapist-files' and public.is_staff());

-- ---------------------------------------------------------------------------
-- Medication reminder push notifications
-- ---------------------------------------------------------------------------
-- A server-sent reminder beats a per-device local alarm: one shared check of
-- what's actually due, sent to every device a family has registered, and
-- automatically skipped once someone logs the dose — instead of each phone
-- independently firing its own alarm with no idea whether the other parent
-- already handled it.
--
-- NOTE — times are matched against Australia/Sydney local time (see `tz`
-- below). If this app ever supports families outside that timezone, this
-- needs a per-family timezone column instead of the hardcoded constant.

-- One row per device that should receive reminders for its family.
create table if not exists public.push_tokens (
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references public.families (id) on delete cascade,
  token      text not null unique,
  platform   text,
  created_at timestamptz not null default now()
);
create index if not exists push_tokens_family_id_idx on public.push_tokens (family_id);

alter table public.push_tokens enable row level security;

drop policy if exists "push_tokens_select_own" on public.push_tokens;
create policy "push_tokens_select_own" on public.push_tokens
  for select using (family_id = auth.uid());
drop policy if exists "push_tokens_insert_own" on public.push_tokens;
create policy "push_tokens_insert_own" on public.push_tokens
  for insert with check (family_id = auth.uid());
drop policy if exists "push_tokens_update_own" on public.push_tokens;
create policy "push_tokens_update_own" on public.push_tokens
  for update using (family_id = auth.uid());
drop policy if exists "push_tokens_delete_own" on public.push_tokens;
create policy "push_tokens_delete_own" on public.push_tokens
  for delete using (family_id = auth.uid());

-- pg_net lets Postgres itself make an HTTP request — used below to call
-- Expo's push API directly from the cron job, with no separate server to
-- deploy or secret to manage (Expo's push endpoint needs no API key).
create extension if not exists pg_net with schema extensions;

-- Finds every medication due at the current minute (Australia/Sydney time)
-- that hasn't already been given today, and pushes a reminder to every
-- device the family has registered. security definer so it can see every
-- family's data regardless of who/what invokes it (the cron job below).
create or replace function public.send_due_medication_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  tz constant text := 'Australia/Sydney';
  now_local timestamp := now() at time zone tz;
  now_hhmm text := to_char(now_local, 'HH24:MI');
  med record;
  slot_index int;
  given_count int;
  tokens text[];
begin
  for med in
    select m.id, m.name, m.dosage, m.times, c.name as child_name, c.family_id
    from public.medications m
    join public.children c on c.id = m.child_id
    where m.active and now_hhmm = any (m.times)
  loop
    -- How many of this medication's daily times fall before the one that
    -- just matched, and how many doses were already given today — if
    -- given_count is already past this slot's position, skip it. Mirrors
    -- the "doses given in order" assumption the app's own status badge uses.
    select count(*) into slot_index from unnest(med.times) t where t < now_hhmm;

    select count(*) into given_count
    from public.medication_logs
    where medication_id = med.id
      and status = 'given'
      and (taken_at at time zone tz)::date = now_local::date;

    if given_count > slot_index then
      continue;
    end if;

    select array_agg(token) into tokens from public.push_tokens where family_id = med.family_id;
    if tokens is null or array_length(tokens, 1) = 0 then
      continue;
    end if;

    perform net.http_post(
      url := 'https://exp.host/--/api/v2/push/send',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Accept', 'application/json'),
      body := jsonb_build_object(
        'to', tokens,
        'title', med.child_name || E'''s medication',
        'body', 'Time for ' || med.name || case when med.dosage is not null then ' (' || med.dosage || ')' else '' end,
        'sound', 'default',
        'data', jsonb_build_object('type', 'medication-reminder', 'medicationId', med.id)
      )
    );
  end loop;
end;
$$;

-- Runs every minute. cron.schedule errors if a job with this name already
-- exists, so unschedule first (ignoring "doesn't exist yet" on a fresh
-- database) to keep this file safe to re-run.
do $$
begin
  perform cron.unschedule('send-medication-reminders');
exception when others then
  null;
end $$;

select cron.schedule(
  'send-medication-reminders',
  '* * * * *',
  $$ select public.send_due_medication_reminders(); $$
);

alter table public.enquiries
add column if not exists ip_hash text,
add column if not exists country text,
add column if not exists region text,
add column if not exists city text,
add column if not exists user_agent text,
add column if not exists page_path text,
add column if not exists referrer text;

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  path text,
  referrer text,
  screen text,
  language text,
  ip_hash text,
  country text,
  region text,
  city text,
  user_agent text
);

alter table public.page_views enable row level security;

drop policy if exists "Anon can insert page views" on public.page_views;
create policy "Anon can insert page views"
on public.page_views
for insert
to anon
with check (true);

drop policy if exists "Authenticated users can read page views" on public.page_views;
create policy "Authenticated users can read page views"
on public.page_views
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can delete page views" on public.page_views;
create policy "Authenticated users can delete page views"
on public.page_views
for delete
to authenticated
using (true);

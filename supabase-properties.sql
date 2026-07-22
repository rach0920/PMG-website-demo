create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  listing_type text not null check (listing_type in ('for_lease', 'for_sale')),
  address text not null,
  photo_urls text[] not null default '{}',
  floorplan_url text,
  price text,
  description text,
  status text not null default 'for lease' check (status in ('for sale', 'for lease', 'sold', 'under application', 'deposit taken')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.properties enable row level security;

drop policy if exists "Public can read active properties" on public.properties;
create policy "Public can read active properties"
on public.properties
for select
using (is_active = true or auth.role() = 'authenticated');

drop policy if exists "Authenticated users can manage properties" on public.properties;
create policy "Authenticated users can manage properties"
on public.properties
for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('property-media', 'property-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read property media" on storage.objects;
create policy "Public can read property media"
on storage.objects
for select
using (bucket_id = 'property-media');

drop policy if exists "Authenticated users can upload property media" on storage.objects;
create policy "Authenticated users can upload property media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'property-media');

drop policy if exists "Authenticated users can update property media" on storage.objects;
create policy "Authenticated users can update property media"
on storage.objects
for update
to authenticated
using (bucket_id = 'property-media')
with check (bucket_id = 'property-media');

drop policy if exists "Authenticated users can delete property media" on storage.objects;
create policy "Authenticated users can delete property media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'property-media');

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

create table if not exists public.blocked_visitors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  match_type text not null check (match_type in ('email', 'phone', 'ip', 'name', 'address')),
  value text not null,
  reason text,
  message text,
  is_active boolean not null default true
);

alter table public.blocked_visitors enable row level security;

drop policy if exists "Authenticated users can read blocked visitors" on public.blocked_visitors;
create policy "Authenticated users can read blocked visitors"
on public.blocked_visitors
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert blocked visitors" on public.blocked_visitors;
create policy "Authenticated users can insert blocked visitors"
on public.blocked_visitors
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update blocked visitors" on public.blocked_visitors;
create policy "Authenticated users can update blocked visitors"
on public.blocked_visitors
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete blocked visitors" on public.blocked_visitors;
create policy "Authenticated users can delete blocked visitors"
on public.blocked_visitors
for delete
to authenticated
using (true);

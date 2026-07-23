alter table public.enquiries
add column if not exists ip_address text;

alter table public.page_views
add column if not exists ip_address text;

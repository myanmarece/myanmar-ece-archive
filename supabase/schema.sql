create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_myanmar text,
  description text,
  audience text,
  age text,
  domain text,
  language text,
  resource_type text,
  author text,
  institution text,
  file_path text,
  file_url text,
  thumbnail_url text,
  christian_relevance boolean default false,
  view_count integer default 0,
  download_count integer default 0,
  created_at timestamptz default now()
);

alter table public.resources enable row level security;

create policy "public can read resources"
on public.resources for select
to anon, authenticated
using (true);

create policy "authenticated admins can insert resources"
on public.resources for insert
to authenticated
with check ((auth.jwt()->>'role') = 'authenticated');

create policy "authenticated admins can update resources"
on public.resources for update
to authenticated
using (true)
with check (true);

create policy "authenticated admins can delete resources"
on public.resources for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('resources','resources',true)
on conflict (id) do nothing;

create policy "public can read resource files"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'resources');

create policy "authenticated can upload resource files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'resources');

create policy "authenticated can update resource files"
on storage.objects for update
to authenticated
using (bucket_id = 'resources')
with check (bucket_id = 'resources');

create policy "authenticated can delete resource files"
on storage.objects for delete
to authenticated
using (bucket_id = 'resources');

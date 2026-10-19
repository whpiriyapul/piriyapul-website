-- Piriyapul product catalog, admin access, and public brand-logo storage.
create schema if not exists private;

create table if not exists public.categories (
  id text primary key,
  label text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function private.enforce_category_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  category_count integer;
begin
  perform pg_advisory_xact_lock(2048, 4);
  if exists (select 1 from public.categories where id = new.id) then
    return new;
  end if;
  select count(*) into category_count from public.categories;
  if category_count >= 4 then
    raise exception using
      errcode = '23514',
      message = 'Maximum of four product categories is allowed.';
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_category_limit() from public;
drop trigger if exists categories_enforce_limit on public.categories;
create trigger categories_enforce_limit
  before insert on public.categories
  for each row execute function private.enforce_category_limit();

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create unique index if not exists admin_users_email_lower_idx
  on public.admin_users (lower(email));

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id text not null references public.categories(id) on update cascade on delete restrict,
  logo_url text not null,
  logo_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brands_category_order_idx
  on public.brands (category_id, sort_order);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and role in ('admin', 'editor')
  );
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.admin_users enable row level security;

revoke all on public.categories, public.brands from anon, authenticated;
revoke all on public.admin_users from anon, authenticated;
grant select on public.categories, public.brands to anon, authenticated;
grant insert, update, delete on public.categories, public.brands to authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select to anon, authenticated
  using (is_active or (select private.is_admin()));

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists brands_public_read on public.brands;
create policy brands_public_read on public.brands
  for select to anon, authenticated
  using (is_active or (select private.is_admin()));

drop policy if exists brands_admin_write on public.brands;
create policy brands_admin_write on public.brands
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists admin_users_self_or_admin_read on public.admin_users;
create policy admin_users_self_or_admin_read on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists admin_users_admin_write on public.admin_users;
create policy admin_users_admin_write on public.admin_users
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

insert into public.categories (id, label, sort_order, is_active)
values
  ('food-beverage', 'Food & Beverage', 1, true),
  ('confectionery', 'Confectionery', 2, true),
  ('personal-care', 'Personal Care', 3, true),
  ('other', 'Other', 4, true)
on conflict (id) do update set
  label = excluded.label,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.brands (id, name, category_id, logo_url, sort_order, is_active)
values
  ('10000000-0000-4000-8000-000000000001', 'Nescafé', 'food-beverage', '/assets/brands/nescafe.png', 1, true),
  ('10000000-0000-4000-8000-000000000002', 'Tchibo', 'food-beverage', '/assets/brands/tchibo.png', 2, true),
  ('10000000-0000-4000-8000-000000000003', 'Davidoff', 'food-beverage', '/assets/brands/davidoff.png', 3, true),
  ('10000000-0000-4000-8000-000000000004', 'Vitasoy', 'food-beverage', '/assets/brands/vitasoy.png', 4, true),
  ('10000000-0000-4000-8000-000000000005', 'Lipton', 'food-beverage', '/assets/brands/lipton.png', 5, true),
  ('10000000-0000-4000-8000-000000000006', 'Ligo', 'food-beverage', '/assets/brands/ligo.png', 6, true),
  ('10000000-0000-4000-8000-000000000007', 'Pietro Coricelli', 'food-beverage', '/assets/brands/pietro-coricelli.png', 7, true),
  ('10000000-0000-4000-8000-000000000008', 'Orgran', 'food-beverage', '/assets/brands/orgran.png', 8, true)
on conflict (id) do update set
  name = excluded.name,
  category_id = excluded.category_id,
  logo_url = excluded.logo_url,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('brand-logos', 'brand-logos', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists brand_logos_public_read on storage.objects;
create policy brand_logos_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'brand-logos');

drop policy if exists brand_logos_admin_insert on storage.objects;
create policy brand_logos_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'brand-logos' and (select private.is_admin()));

drop policy if exists brand_logos_admin_update on storage.objects;
create policy brand_logos_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'brand-logos' and (select private.is_admin()))
  with check (bucket_id = 'brand-logos' and (select private.is_admin()));

drop policy if exists brand_logos_admin_delete on storage.objects;
create policy brand_logos_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'brand-logos' and (select private.is_admin()));

-- Bootstrap the first admin after creating the Auth user in the Supabase dashboard:
-- insert into public.admin_users (user_id, email, role)
-- select id, email, 'admin' from auth.users where email = 'your-admin-email@example.com'
-- on conflict (user_id) do update set email = excluded.email, role = 'admin';

-- Replace the built-in category icon key with a public image and optional Storage path.
alter table public.categories
  add column if not exists icon_url text,
  add column if not exists icon_path text;

update public.categories
set icon_url = case id
  when 'food-beverage' then '/assets/category-icons/food-beverage.svg'
  when 'confectionery' then '/assets/category-icons/confectionery.svg'
  when 'personal-care' then '/assets/category-icons/personal-care.svg'
  when 'other' then '/assets/category-icons/other.svg'
  else '/assets/category-icons/other.svg'
end
where icon_url is null or icon_url = '';

alter table public.categories
  alter column icon_url set default '/assets/category-icons/other.svg',
  alter column icon_url set not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('brand-logos', 'brand-logos', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

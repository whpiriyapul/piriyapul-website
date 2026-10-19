-- Store the selected built-in icon for each product category.
alter table public.categories
  add column if not exists icon_key text not null default 'package';

update public.categories
set icon_key = case id
  when 'food-beverage' then 'utensils'
  when 'confectionery' then 'candy'
  when 'personal-care' then 'soap'
  when 'other' then 'package'
  else coalesce(nullif(icon_key, ''), 'package')
end;

alter table public.categories
  alter column icon_key set default 'package',
  alter column icon_key set not null;

alter table public.categories
  drop constraint if exists categories_icon_key_check;

alter table public.categories
  add constraint categories_icon_key_check check (icon_key in (
    'utensils', 'coffee', 'candy', 'cookie', 'cake', 'bottle', 'soap', 'spray',
    'home', 'package', 'gift', 'leaf', 'heart', 'baby', 'sparkles', 'shopping-bag'
  ));

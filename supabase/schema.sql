-- =====================================================================
-- Our Baby Checklist - database schema, Row Level Security, storage
-- Run this FIRST in the Supabase SQL editor, then parents.sql, then seed.sql
-- =====================================================================

-- Only these two accounts may ever read or write family data.
create table if not exists public.allowed_emails (
  email        text primary key check (email = lower(email)),
  display_name text not null,
  role         text not null check (role in ('daddy','mummy')) unique
);

create or replace function public.is_family()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.allowed_emails
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_family() from public;
grant execute on function public.is_family() to authenticated;

create table if not exists public.settings (
  id             int primary key default 1 check (id = 1),
  baby_nickname  text not null default 'Baby',
  due_date       date,
  overall_budget numeric(14,2) not null default 1500000 check (overall_budget >= 0),
  currency       text not null default 'NGN',
  updated_at     timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict do nothing;

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(trim(name)) > 0),
  sort_order int  not null default 0,
  budget     numeric(14,2) check (budget is null or budget >= 0),  -- optional cap; else sum of estimates
  created_at timestamptz not null default now()
);
create unique index if not exists categories_name_uq on public.categories (lower(name));

create table if not exists public.items (
  id                 uuid primary key default gen_random_uuid(),
  category_id        uuid not null references public.categories(id) on delete restrict,
  name               text not null check (length(trim(name)) > 0),
  quantity_required  int  not null default 1 check (quantity_required >= 0),
  quantity_purchased int  not null default 0 check (quantity_purchased >= 0),
  est_unit_price     numeric(14,2) not null default 0 check (est_unit_price >= 0),
  actual_unit_price  numeric(14,2) check (actual_unit_price is null or actual_unit_price >= 0),
  brand              text,
  vendor             text,
  purchase_date      date,
  priority           text not null default 'important'
                     check (priority in ('essential','important','after_delivery','later')),
  notes              text,
  image_path         text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists items_category_idx on public.items (category_id);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists items_touch on public.items;
create trigger items_touch before update on public.items for each row execute function public.touch_updated_at();
drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings for each row execute function public.touch_updated_at();

-- ---------------------------- Row Level Security ----------------------------
alter table public.allowed_emails enable row level security;
alter table public.settings       enable row level security;
alter table public.categories     enable row level security;
alter table public.items          enable row level security;

drop policy if exists family_read_members on public.allowed_emails;
create policy family_read_members on public.allowed_emails for select to authenticated using (public.is_family());

-- A parent may change only their OWN display name (the email and role stay fixed).
drop policy if exists own_name_update on public.allowed_emails;
create policy own_name_update on public.allowed_emails for update to authenticated
  using (email = lower(auth.jwt() ->> 'email')) with check (email = lower(auth.jwt() ->> 'email'));
revoke update on public.allowed_emails from authenticated;
grant update (display_name) on public.allowed_emails to authenticated;

drop policy if exists family_all on public.settings;
create policy family_all on public.settings   for all to authenticated using (public.is_family()) with check (public.is_family());
drop policy if exists family_all on public.categories;
create policy family_all on public.categories for all to authenticated using (public.is_family()) with check (public.is_family());
drop policy if exists family_all on public.items;
create policy family_all on public.items      for all to authenticated using (public.is_family()) with check (public.is_family());

-- anon (not logged in) gets nothing
revoke all on public.allowed_emails, public.settings, public.categories, public.items from anon;

-- ------------------------------- Realtime -----------------------------------
do $$ begin
  begin alter publication supabase_realtime add table public.items;      exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.categories; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.settings;   exception when duplicate_object then null; end;
end $$;

-- --------------------------- Private image storage --------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', false, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = false, file_size_limit = 5242880;

drop policy if exists family_images_select on storage.objects;
drop policy if exists family_images_insert on storage.objects;
drop policy if exists family_images_update on storage.objects;
drop policy if exists family_images_delete on storage.objects;
create policy family_images_select on storage.objects for select to authenticated using (bucket_id = 'product-images' and public.is_family());
create policy family_images_insert on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_family());
create policy family_images_update on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_family());
create policy family_images_delete on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_family());

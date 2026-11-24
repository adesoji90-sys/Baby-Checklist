-- Run SECOND. EDIT the two email addresses below to match the accounts you
-- create in Supabase Dashboard -> Authentication -> Users -> "Add user".
-- Emails must be lowercase. Nobody else can ever see or change any data.
insert into public.allowed_emails (email, display_name, role) values
  ('daddy@example.com', 'Daddy', 'daddy'),
  ('mummy@example.com', 'Mummy', 'mummy')
on conflict (role) do update set email = excluded.email;

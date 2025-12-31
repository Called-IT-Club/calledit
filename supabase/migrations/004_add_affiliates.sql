-- Create Affiliates Table
create table if not exists affiliates (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  url text not null,
  description text,
  color text, -- tailwind class or hex
  category text, -- specific category targeting
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table affiliates enable row level security;

-- Policies
drop policy if exists "Active affiliates are viewable by everyone" on affiliates;
create policy "Active affiliates are viewable by everyone" on affiliates for select using ( is_active = true );

drop policy if exists "Admins can view all affiliates" on affiliates;
create policy "Admins can view all affiliates" on affiliates for select using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins can insert/update/delete affiliates" on affiliates;
create policy "Admins can insert/update/delete affiliates" on affiliates for all using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

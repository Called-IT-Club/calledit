-- 1. PROFILES (Safely update existing table)
-- Add 'role' column
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'role') then
    alter table profiles add column role text default 'user' check (role in ('user', 'admin', 'moderator'));
  end if;
end $$;

-- Add 'email' column (useful for admin views)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'email') then
    alter table profiles add column email text;
  end if;
end $$;

-- Enable RLS (It should already be on, but safe to repeat)
alter table profiles enable row level security;

-- Update Policies safely
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone" on profiles for select using ( true );

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using ( auth.uid() = id );

-- Update Trigger Function safely
-- Only update the trigger if we are sure, but for now, we rely on the default value of role='user'
-- If you have an existing handle_new_user function, this REPLACES it to include email/role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, username, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    'user',
    new.raw_user_meta_data->>'username', -- Try to capture metadata if available
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set email = excluded.email; -- keep email in sync
  return new;
end;
$$;

-- Ensure trigger exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. ADVERTISEMENTS (No changes needed, this table is new)
create table if not exists advertisements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text, -- optional
  link_url text not null,
  cta_text text default 'Learn More',
  category text, -- Null for global, or specific category
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Enable RLS
alter table advertisements enable row level security;

-- Policies
drop policy if exists "Active ads are viewable by everyone" on advertisements;
create policy "Active ads are viewable by everyone" on advertisements for select using ( is_active = true );

drop policy if exists "Admins can view all ads" on advertisements;
create policy "Admins can view all ads" on advertisements for select using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins can insert/update/delete ads" on advertisements;
create policy "Admins can insert/update/delete ads" on advertisements for all using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- 3. AD_EVENTS (Analytics - No changes needed, new table)
create table if not exists ad_events (
  id uuid default gen_random_uuid() primary key,
  ad_id uuid references advertisements(id) on delete cascade not null,
  type text check (type in ('view', 'click')),
  user_id uuid references auth.users(id), -- Nullable for anon views
  created_at timestamptz default now()
);

-- Enable RLS
alter table ad_events enable row level security;

-- Policies
drop policy if exists "Anyone can insert ad events" on ad_events;
create policy "Anyone can insert ad events" on ad_events for insert with check ( true );

drop policy if exists "Admins can view ad events" on ad_events;
create policy "Admins can view ad events" on ad_events for select using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

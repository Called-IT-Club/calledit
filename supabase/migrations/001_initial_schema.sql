-- ⚠️ RESET SCRIPT
-- Run this in your Supabase SQL Editor to mistakenly reset your database.

-- 1. DROP EVERYTHING (Clean Slate)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists ad_events cascade;
drop table if exists advertisements cascade;
drop table if exists affiliates cascade;
drop table if exists friendships cascade;
drop table if exists predictions cascade;
drop table if exists profiles cascade;

-- 2. CREATE TABLES

-- Profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  email text, -- Added for admin visibility
  role text default 'user' check (role in ('user', 'admin', 'moderator')), -- Added RBC
  constraint username_length check (char_length(username) >= 3)
);

-- Predictions
create table predictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  category text not null,
  prediction text not null,
  target_date date,
  outcome text default 'pending', -- 'pending', 'true', 'false'
  evidence_image_url text,
  meta jsonb, -- For structured data (tags, entities)
  is_private boolean default false,
  deleted_at timestamp with time zone, -- Soft delete support
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Advertisements
create table advertisements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  link_url text not null,
  cta_text text default 'Learn More',
  category text, -- Null for global, or specific category
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Ad Events (Analytics) - PARTITIONED for Scale
create table ad_events (
  id uuid default gen_random_uuid(),
  ad_id uuid not null, -- Removed FK constraint for performance on partition, or keep provided you accept overhead
  type text check (type in ('view', 'click')),
  user_id uuid, 
  created_at timestamptz default now(),
  primary key (id, created_at) -- Partition key must be part of PK
) partition by range (created_at);

-- Default partition for future/past overflow (Safety net)
create table ad_events_default partition of ad_events default;

-- Create Monthly Partitions automatically for 2025 and 2026 using a DO block
do $$
declare
  start_date date := '2025-01-01';
  end_date date := '2027-01-01';
  curr_date date := start_date;
  next_date date;
  partition_name text;
begin
  while curr_date < end_date loop
    next_date := curr_date + interval '1 month';
    partition_name := 'ad_events_' || to_char(curr_date, 'YYYY_MM');
    
    -- Check if table exists to be safe
    if not exists (select from pg_tables where tablename = partition_name) then
      execute format('create table %I partition of ad_events for values from (%L) to (%L)', partition_name, curr_date, next_date);
    end if;
    
    curr_date := next_date;
  end loop;
end $$;

-- Affiliates
create table affiliates (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  url text not null,
  description text,
  color text, -- tailwind class or hex
  category text, -- specific category targeting
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Friendships
create table friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- 3. ENABLE RLS
alter table profiles enable row level security;
alter table predictions enable row level security;
alter table advertisements enable row level security;
alter table ad_events enable row level security;
alter table affiliates enable row level security;
alter table friendships enable row level security;

-- 4. RLS POLICIES

-- Profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select using ( true );
create policy "Users can insert their own profile."
  on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile."
  on profiles for update using ( auth.uid() = id );

-- Predictions
create policy "Predictions are viewable by everyone if public, or by owner."
  on predictions for select using ( is_private = false or auth.uid() = user_id );
create policy "Users can create their own predictions."
  on predictions for insert with check ( auth.uid() = user_id );
create policy "Users can update their own predictions."
  on predictions for update using ( auth.uid() = user_id );
create policy "Users can delete their own predictions."
  on predictions for delete using ( auth.uid() = user_id );

-- Advertisements
create policy "Active ads are viewable by everyone" on advertisements for select using ( is_active = true );
create policy "Admins can view all ads" on advertisements for select using ( exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin') );
create policy "Admins can insert/update/delete ads" on advertisements for all using ( exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin') );

-- Ad Events
create policy "Anyone can insert ad events" on ad_events for insert with check ( true );
create policy "Admins can view ad events" on ad_events for select using ( exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin') );

-- Affiliates
create policy "Active affiliates are viewable by everyone" on affiliates for select using ( is_active = true );
create policy "Admins can view all affiliates" on affiliates for select using ( exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin') );
create policy "Admins can insert/update/delete affiliates" on affiliates for all using ( exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin') );

-- Friendships
create policy "Users can view their own friendships" on friendships for select using (auth.uid() = user_id);
create policy "Users can view friendships where they are the friend" on friendships for select using (auth.uid() = friend_id);
create policy "Users can create their own friendships" on friendships for insert with check (auth.uid() = user_id);
create policy "Users can delete their own friendships" on friendships for delete using (auth.uid() = user_id);

-- 5. PERFORMANCE INDEXES
create index predictions_user_id_idx on predictions(user_id);
create index predictions_is_private_idx on predictions(is_private);
create index predictions_created_at_idx on predictions(created_at desc);
create index idx_friendships_user_id ON friendships(user_id);
create index idx_friendships_friend_id ON friendships(friend_id);

-- 6. TRIGGERS & FUNCTIONS

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
    'user', -- Default role
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

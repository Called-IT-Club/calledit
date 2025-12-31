-- Create Affiliate Events table for tracking clicks
create table if not exists affiliate_events (
  id uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete cascade not null,
  type text check (type in ('view', 'click')),
  user_id uuid references auth.users(id), -- Nullable for anon views
  created_at timestamptz default now()
);

-- Enable RLS
alter table affiliate_events enable row level security;

-- Policies
drop policy if exists "Anyone can insert affiliate events" on affiliate_events;
create policy "Anyone can insert affiliate events" on affiliate_events for insert with check ( true );

drop policy if exists "Admins can view affiliate events" on affiliate_events;
create policy "Admins can view affiliate events" on affiliate_events for select using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

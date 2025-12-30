-- DISABLE RLS on all tables to restore full access
-- Run this if functionality is blocked by security policies

alter table predictions disable row level security;
alter table profiles disable row level security;
alter table advertisements disable row level security;
alter table ad_events disable row level security;

-- Note: This makes all data public to any connected client (standard development mode without RLS)

-- SAMPLE DATA SEED SCRIPT
-- Run this AFTER running schema.sql to populate your app with starter content.

-- 1. AFFILIATES
-- These will appear on prediction cards based on category.

INSERT INTO public.affiliates (label, url, description, color, category, is_active)
VALUES 
  -- Sports
  ('DraftKings', 'https://draftkings.com', 'Bet on this game', 'bg-green-500 text-white', 'sports', true),
  ('FanDuel', 'https://fanduel.com', 'Place your bet', 'bg-blue-500 text-white', 'sports', true),
  
  -- Finance
  ('Robinhood', 'https://robinhood.com', 'Trade this stock', 'bg-emerald-500 text-white', 'financial-markets', true),
  ('Coinbase', 'https://coinbase.com', 'Buy Crypto', 'bg-indigo-500 text-white', 'financial-markets', true),
  
  -- Tech / General
  ('Amazon', 'https://amazon.com', 'Shop Tech', 'bg-yellow-500 text-black', 'technology', true),
  
  -- Politics
  ('PredictIt', 'https://predictit.org', 'Trade on Politics', 'bg-slate-600 text-white', 'politics', true);


-- 2. ADVERTISEMENTS
-- These will appear in the feed.

INSERT INTO public.advertisements (title, description, link_url, cta_text, category, is_active)
VALUES
  (
    'Called It Premium', 
    'Get advanced analytics and verification badges for your predictions.', 
    '/premium', 
    'Upgrade Now', 
    NULL, -- Global ad
    true
  ),
  (
    'Sports Betting 101', 
    'Learn how to make smarter sports calls with our guide.', 
    'https://example.com/sports-guide', 
    'Read Guide', 
    'sports', 
    true
  ),
  (
    'Crypto Trends 2025', 
    'See what the experts are predicting for the next bull run.', 
    'https://example.com/crypto', 
    'View Report', 
    'crypto', 
    false
  );

-- 3. SYNC PROFILES (Crucial after a reset)
-- If you dropped the public schema but kept auth.users, this restores their profiles.
insert into public.profiles (id, full_name, avatar_url, role, username)
select 
  id, 
  raw_user_meta_data->>'full_name', 
  raw_user_meta_data->>'avatar_url',
  'user',
  raw_user_meta_data->>'username'
from auth.users
on conflict (id) do nothing;


-- 4. SAMPLE PREDICTIONS
-- We attach these to the first user found in the system (normally YOU).
do $$
declare
  first_user_id uuid;
begin
  select id into first_user_id from auth.users limit 1;

  if first_user_id is not null then
    insert into public.predictions (user_id, category, prediction, target_date, outcome, is_private)
    values
      (first_user_id, 'sports', 'Lakers will win the playoffs against Denver', '2025-06-01', 'pending', false),
      (first_user_id, 'financial-markets', 'Bitcoin will cross $100k before Q3', '2025-07-01', 'pending', false),
      (first_user_id, 'technology', 'Apple will release a folding iPhone', '2025-09-01', 'pending', false),
      (first_user_id, 'world-events', 'Global carbon emissions will drop by 2%', '2025-12-31', 'pending', false),
      (first_user_id, 'politics', 'New tax bill will pass senate', '2025-04-15', 'true', false), -- A "Called It" example!
      (first_user_id, 'health', 'New vaccine for common cold enters trials', '2025-11-01', 'pending', false);
  end if;
end $$;

-- Backfill missing emails in profiles table
-- Usage: Run this in Supabase SQL Editor

UPDATE public.profiles
SET email = auth.users.email
FROM auth.users
WHERE public.profiles.id = auth.users.id
AND (public.profiles.email IS NULL OR public.profiles.email = '');

-- Confirmation
SELECT count(*) as updated_count FROM public.profiles WHERE email IS NOT NULL;

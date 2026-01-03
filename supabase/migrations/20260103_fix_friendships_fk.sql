-- Update friendships foreign keys to point to profiles
-- This allows joining friendships with profiles to get username/avatar

ALTER TABLE friendships
  DROP CONSTRAINT IF EXISTS friendships_user_id_fkey,
  DROP CONSTRAINT IF EXISTS friendships_friend_id_fkey;

-- If the constraints were named differently (e.g. auto-generated)
-- You might need to find them, but checking the standard naming:
-- It was likely: friendships_user_id_fkey

ALTER TABLE friendships
  ADD CONSTRAINT friendships_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE friendships
  ADD CONSTRAINT friendships_friend_id_fkey
  FOREIGN KEY (friend_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

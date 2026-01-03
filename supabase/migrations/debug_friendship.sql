-- Debug: Check profiles and friendships
-- Run this in Supabase SQL Editor

-- 1. Find the User IDs for the relevant emails
SELECT id, username, email FROM auth.users 
WHERE email = 'calleditclub@gmail.com' OR email ILIKE '%hemtalreja%';

-- 2. Check Friendships table for any link between them
-- Replace UUIDs below with the IDs found above if needed, or just list all pending
SELECT 
    f.id,
    f.status,
    u.email as sender_email,
    u.username as sender_username,
    r.email as recipient_email,
    r.username as recipient_username
FROM friendships f
JOIN profiles u ON f.user_id = u.id
JOIN profiles r ON f.friend_id = r.id;

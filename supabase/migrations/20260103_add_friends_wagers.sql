-- Fixed Migration: Add Friends and Wagers
-- This script safely handles creating the friendships table if it doesn't exist.

-- 1. Create Friendships Table if not exists
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT friendships_user_id_friend_id_key UNIQUE(user_id, friend_id),
    CONSTRAINT friendships_check CHECK (user_id != friend_id)
);

-- 2. Add 'status' column to Friendships if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'friendships' AND column_name = 'status') THEN
        ALTER TABLE friendships 
        ADD COLUMN status text CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending';
    END IF;
END $$;

-- 3. Create Wagers Table
CREATE TABLE IF NOT EXISTS wagers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id uuid REFERENCES profiles(id) NOT NULL,
  recipient_id uuid REFERENCES profiles(id) NOT NULL,
  prediction_id uuid REFERENCES predictions(id) NOT NULL,
  status text CHECK (status IN ('pending', 'accepted', 'declined', 'completed')) DEFAULT 'pending',
  terms text,
  winner_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE wagers ENABLE ROW LEVEL SECURITY;

-- 5. Friendships Policies (Drop first to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Users can view their own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can view friendships where they are the friend" ON friendships;
DROP POLICY IF EXISTS "Users can create their own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can update their own friendships" ON friendships;

CREATE POLICY "Users can view their own friendships" ON friendships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view friendships where they are the friend" ON friendships FOR SELECT USING (auth.uid() = friend_id);
CREATE POLICY "Users can create their own friendships" ON friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own friendships" ON friendships FOR DELETE USING (auth.uid() = user_id);
-- Allow updating status (accepting requests)
CREATE POLICY "Users can update their own friendships" ON friendships FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);


-- 6. Wagers Policies
DROP POLICY IF EXISTS "Users can view their own wagers" ON wagers;
DROP POLICY IF EXISTS "Users can create wagers" ON wagers;
DROP POLICY IF EXISTS "Users can update their own wagers" ON wagers;

CREATE POLICY "Users can view their own wagers" 
ON wagers FOR SELECT 
USING (auth.uid() = challenger_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create wagers" 
ON wagers FOR INSERT 
WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update their own wagers" 
ON wagers FOR UPDATE 
USING (auth.uid() = challenger_id OR auth.uid() = recipient_id);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_wagers_challenger_id ON wagers(challenger_id);
CREATE INDEX IF NOT EXISTS idx_wagers_recipient_id ON wagers(recipient_id);

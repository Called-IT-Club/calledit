-- Create friendships table for user follow/friend relationships
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate friendships
    UNIQUE(user_id, friend_id),
    
    -- Prevent self-following
    CHECK (user_id != friend_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own friendships
CREATE POLICY "Users can view their own friendships"
    ON friendships
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can view friendships where they are the friend
CREATE POLICY "Users can view friendships where they are the friend"
    ON friendships
    FOR SELECT
    USING (auth.uid() = friend_id);

-- Policy: Users can create their own friendships
CREATE POLICY "Users can create their own friendships"
    ON friendships
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own friendships (unfollow)
CREATE POLICY "Users can delete their own friendships"
    ON friendships
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE friendships IS 'Stores user follow/friend relationships';

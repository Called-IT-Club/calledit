-- Create prediction_reactions table
CREATE TABLE IF NOT EXISTS prediction_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL, -- e.g., 'like', 'laugh', 'fire', 'shock'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prediction_id, reaction_type)
);

-- Create prediction_bookmarks table
CREATE TABLE IF NOT EXISTS prediction_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prediction_id)
);

-- Enable RLS
ALTER TABLE prediction_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Reactions
CREATE POLICY "Reactions are viewable by everyone" 
  ON prediction_reactions FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reactions" 
  ON prediction_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
  ON prediction_reactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Bookmarks
CREATE POLICY "Users can view their own bookmarks" 
  ON prediction_bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" 
  ON prediction_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
  ON prediction_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_prediction_reactions_prediction_id ON prediction_reactions(prediction_id);
CREATE INDEX idx_prediction_bookmarks_user_id ON prediction_bookmarks(user_id);

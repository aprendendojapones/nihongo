-- Game Saves table
CREATE TABLE game_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  level_id TEXT NOT NULL,
  game_mode TEXT NOT NULL, -- 'quiz', 'timed', 'memory', 'matching', 'study', 'test'
  progress_data JSONB NOT NULL, -- Stores game state
  current_index INTEGER,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own game saves" ON game_saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game saves" ON game_saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own game saves" ON game_saves FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own game saves" ON game_saves FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX game_saves_user_id_idx ON game_saves(user_id);
CREATE INDEX game_saves_updated_at_idx ON game_saves(updated_at DESC);

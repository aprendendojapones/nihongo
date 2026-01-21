-- Practice Results table
CREATE TABLE practice_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  game_mode TEXT NOT NULL, -- 'quiz', 'timed', 'memory', 'matching'
  level_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER,
  time_spent INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE practice_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own practice results" ON practice_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own practice results" ON practice_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create user_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can view own progress') THEN
        CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can insert own progress') THEN
        CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can update own progress') THEN
        CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;


-- Function to increment user XP
-- Usage: supabase.rpc('increment_xp', { user_id: '...', amount: 10 })

CREATE OR REPLACE FUNCTION increment_xp(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
DECLARE
  current_xp INTEGER;
  new_xp INTEGER;
BEGIN
  -- Get current XP
  SELECT xp INTO current_xp FROM profiles WHERE id = user_id;
  
  -- Calculate new XP
  new_xp := COALESCE(current_xp, 0) + amount;
  
  -- Update profile
  UPDATE profiles 
  SET xp = new_xp,
      updated_at = timezone('utc'::text, now())
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

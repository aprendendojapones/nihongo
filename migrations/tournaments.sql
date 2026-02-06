-- Tournaments Table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tournament Entries (User Score per Tournament)
CREATE TABLE tournament_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id), -- Snapshot of school at entry
  score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(tournament_id, user_id)
);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_entries ENABLE ROW LEVEL SECURITY;

-- Policies for Tournaments
CREATE POLICY "Everyone can view tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Admins can manage tournaments" ON tournaments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for Entries
CREATE POLICY "Everyone can view entries" ON tournament_entries FOR SELECT USING (true);
-- No direct insert/update for users, only via RPC

-- Update increment_xp function to handle tournaments
CREATE OR REPLACE FUNCTION increment_xp(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
DECLARE
  current_xp INTEGER;
  new_xp INTEGER;
  active_tournament_id UUID;
  user_school_id UUID;
BEGIN
  -- 1. Update Global Profile XP
  SELECT xp, school_id INTO current_xp, user_school_id FROM profiles WHERE id = user_id;
  new_xp := COALESCE(current_xp, 0) + amount;
  
  UPDATE profiles 
  SET xp = new_xp,
      updated_at = timezone('utc'::text, now())
  WHERE id = user_id;

  -- 2. Update Tournament XP (if there is an active tournament)
  SELECT id INTO active_tournament_id FROM tournaments
  WHERE is_active = true 
  AND now() BETWEEN start_date AND end_date
  LIMIT 1;

  IF active_tournament_id IS NOT NULL THEN
    INSERT INTO tournament_entries (tournament_id, user_id, score, school_id)
    VALUES (active_tournament_id, user_id, amount, user_school_id)
    ON CONFLICT (tournament_id, user_id)
    DO UPDATE SET 
        score = tournament_entries.score + amount,
        updated_at = timezone('utc'::text, now());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed an initial tournament (Current Week)
INSERT INTO tournaments (title, start_date, end_date, is_active)
VALUES (
    'Torneio da Semana', 
    date_trunc('week', now()), 
    date_trunc('week', now()) + interval '1 week', 
    true
);

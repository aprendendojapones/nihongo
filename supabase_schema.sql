-- Schools table
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  director_id UUID, -- Will be linked to profiles.id
  address TEXT,
  map_pin TEXT, -- URL or coordinates for map integration
  phone TEXT,
  fax TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student', -- 'admin', 'director', 'teacher', 'student'
  school_id UUID REFERENCES schools(id),
  language_pref TEXT DEFAULT 'pt',
  system_lang TEXT,
  username TEXT,
  phone TEXT,
  address TEXT,
  phone_public BOOLEAN DEFAULT FALSE,
  address_public BOOLEAN DEFAULT FALSE,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  level TEXT DEFAULT 'N5',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add foreign key to schools after profiles is created
ALTER TABLE schools ADD CONSTRAINT fk_director FOREIGN KEY (director_id) REFERENCES profiles(id);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL, -- 'katakana', 'hiragana', 'kanji', 'N5', 'N4', etc.
  title TEXT NOT NULL,
  content JSONB,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- User Progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  lesson_id TEXT NOT NULL, -- 'katakana', 'hiragana', etc.
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, lesson_id)
);

-- RPC to increment XP
CREATE OR REPLACE FUNCTION increment_xp(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET xp = xp + amount,
      updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Real-time Handwriting Sessions
CREATE TABLE handwriting_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pc_session_id TEXT UNIQUE NOT NULL,
  current_stroke JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Messages table (Chat)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id),
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id), -- For Admin PMs
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS POLICIES --

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE handwriting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Schools Policies
CREATE POLICY "Schools are viewable by everyone" ON schools FOR SELECT USING (true);
CREATE POLICY "Directors can insert schools" ON schools FOR INSERT WITH CHECK (auth.uid() = director_id);
CREATE POLICY "Directors can update own school" ON schools FOR UPDATE USING (auth.uid() = director_id);

-- Lessons Policies
CREATE POLICY "Lessons are viewable by authenticated users" ON lessons FOR SELECT TO authenticated USING (true);
-- No public insert/update for lessons (admin only via service role)

-- User Progress Policies
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Teachers/Directors can view student progress" ON user_progress FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles student
    JOIN profiles teacher ON student.school_id = teacher.school_id
    WHERE student.id = user_progress.user_id
    AND teacher.id = auth.uid()
    AND (teacher.role = 'teacher' OR teacher.role = 'director')
  )
);
CREATE POLICY "Users can insert/update own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);

-- Handwriting Sessions Policies
CREATE POLICY "Handwriting sessions are public" ON handwriting_sessions FOR ALL USING (true);

-- Messages Policies
CREATE POLICY "Users can view their own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can insert messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Invitation Tokens table
CREATE TABLE invitation_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Invitation Tokens Policies
ALTER TABLE invitation_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view invitation tokens" ON invitation_tokens FOR SELECT USING (true);
-- Updates/Inserts should be done by Admin/Service Role only

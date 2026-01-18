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

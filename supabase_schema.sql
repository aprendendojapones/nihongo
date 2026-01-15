/*
  Supabase Schema (SQL)
  
  -- Users Table (Extends NextAuth)
  CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    level TEXT DEFAULT 'N5',
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Progress Table
  CREATE TABLE user_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL, -- e.g., 'hiragana_a', 'kanji_n5_sun'
    item_type TEXT NOT NULL, -- 'hiragana', 'katakana', 'kanji'
    status TEXT DEFAULT 'learned', -- 'learning', 'learned', 'mastered'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Real-time Handwriting Sessions
  CREATE TABLE handwriting_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pc_session_id TEXT UNIQUE NOT NULL,
    current_stroke JSONB, -- Stores the current drawing data
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
*/

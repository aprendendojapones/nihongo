-- Migration: Create Subscription System Tables
-- Execute this in Supabase SQL Editor

-- 1. Plans Table
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY, -- 'individual', 'family', 'school'
  name TEXT NOT NULL,
  price INTEGER NOT NULL, -- Price in Yen
  currency TEXT DEFAULT 'JPY',
  description TEXT,
  max_members INTEGER DEFAULT 1, -- 1 for individual, 4 for family
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seed Plans
INSERT INTO plans (id, name, price, description, max_members) VALUES
('individual', 'Plano Individual', 980, 'Acesso completo para um usuário', 1),
('family', 'Plano Família', 1500, 'Acesso para até 4 pessoas', 4),
('school', 'Plano Escola', 980, 'Plano para estudantes (com desconto progressivo)', 1)
ON CONFLICT (id) DO NOTHING;

-- 2. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES plans(id),
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Family Members Table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- The family plan owner
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- The invited member
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(owner_id, member_id)
);

-- 4. School Discounts Table (Tracks school size for discounts)
CREATE TABLE IF NOT EXISTS school_discounts (
  school_id UUID PRIMARY KEY, -- Assuming you have a schools table, otherwise use TEXT
  student_count INTEGER DEFAULT 0,
  current_discount_percent INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_discounts ENABLE ROW LEVEL SECURITY;

-- Policies
-- Plans: Public read
CREATE POLICY "Public can view plans" ON plans FOR SELECT USING (true);

-- Subscriptions: Users view own
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
-- (In a real app, only webhooks/admins should update subscriptions, but for this demo we might allow some client updates or use RPC)

-- Family: Owner and Member can view
CREATE POLICY "Family access" ON family_members FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = member_id);

-- School Discounts: Public read (or restricted to school admins)
CREATE POLICY "Public view school discounts" ON school_discounts FOR SELECT USING (true);

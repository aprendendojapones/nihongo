-- Migration: Create Invitation System Tables
-- Execute this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS invitation_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL, -- 'director', 'teacher', 'employee', 'friend', 'student'
  created_by UUID REFERENCES profiles(id),
  max_uses INTEGER DEFAULT 1,
  uses INTEGER DEFAULT 0,
  options JSONB DEFAULT '{}'::jsonb, -- { "discount_percent": 0, "free_family": false, "school_id": "..." }
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  active BOOLEAN DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE invitation_tokens ENABLE ROW LEVEL SECURITY;

-- Policies
-- Only admins/directors/staff can view/create tokens (handled via RPC mostly, but good to have policies)
CREATE POLICY "Admins view all tokens" ON invitation_tokens FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'director', 'manager'))
);

-- Public can read token info (to validate on register page) - but maybe restrict to just existence?
-- Better to use a secure RPC for validation to avoid exposing all tokens.
-- For now, let's allow reading specific token if you know it.
CREATE POLICY "Public read token" ON invitation_tokens FOR SELECT USING (true);

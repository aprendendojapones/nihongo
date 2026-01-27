-- Fix Profile Permissions (Recursion Fix)
-- Execute this in Supabase SQL Editor

-- 1. Create a secure function to check admin status (bypasses RLS)
-- This prevents the "infinite recursion" error by running with system privileges
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to update their own profile (ID or Email match)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE 
USING (auth.uid() = id OR email = (auth.jwt() ->> 'email'));

-- 3. Allow users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT 
USING (auth.uid() = id OR email = (auth.jwt() ->> 'email'));

-- 4. Allow admins to do everything (using the safe function)
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON profiles;
CREATE POLICY "Admins can do everything on profiles" ON profiles 
FOR ALL 
USING (is_admin());

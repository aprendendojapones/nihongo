-- Migration: Add missing profile fields
-- Execute this in Supabase SQL Editor

-- Add missing columns to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS address_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS language_pref TEXT DEFAULT 'pt';

-- Update existing records to have default values
UPDATE profiles 
SET phone_public = FALSE 
WHERE phone_public IS NULL;

UPDATE profiles 
SET address_public = FALSE 
WHERE address_public IS NULL;

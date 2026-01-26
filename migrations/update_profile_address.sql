-- Migration: Update profiles for structured address
-- Execute this in Supabase SQL Editor

-- Add new columns for structured address
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- We can keep the old 'address' column for backward compatibility or street details, 
-- but the UI will primarily use the new fields for selection.

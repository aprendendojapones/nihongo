-- Add visibility_level column to subjects, game_categories and games_config
-- visibility_level: 'admin', 'staff', 'everyone'

ALTER TABLE subjects ADD COLUMN visibility_level TEXT DEFAULT 'everyone';
ALTER TABLE game_categories ADD COLUMN visibility_level TEXT DEFAULT 'everyone';
ALTER TABLE games_config ADD COLUMN visibility_level TEXT DEFAULT 'everyone';

-- Update RLS policies to respect visibility_level
-- Note: Admin role in profiles table can always see everything (handled by service role in APIs)

-- Subjects Policies
DROP POLICY IF EXISTS "Public can view visible subjects" ON subjects;
CREATE POLICY "Users can view subjects based on role" ON subjects FOR SELECT USING (
  (visibility_level = 'everyone') OR
  (visibility_level = 'staff' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'teacher' OR role = 'director' OR role = 'admin'))) OR
  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
);

-- Categories Policies
DROP POLICY IF EXISTS "Public can view visible categories" ON game_categories;
CREATE POLICY "Users can view categories based on role" ON game_categories FOR SELECT USING (
  (visibility_level = 'everyone') OR
  (visibility_level = 'staff' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'teacher' OR role = 'director' OR role = 'admin'))) OR
  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
);

-- Games Config Policies
DROP POLICY IF EXISTS "Public can view visible games" ON games_config;
CREATE POLICY "Users can view games based on role" ON games_config FOR SELECT USING (
  (visibility_level = 'everyone') OR
  (visibility_level = 'staff' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'teacher' OR role = 'director' OR role = 'admin'))) OR
  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
);

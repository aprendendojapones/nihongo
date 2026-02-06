-- Live Classes Table
CREATE TABLE live_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_url TEXT,
  is_cancelled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;

-- Policies

-- VIEW: Everyone in the school can view scheduled classes
CREATE POLICY "School members can view classes" ON live_classes
  FOR SELECT USING (
    school_id IN (
        SELECT school_id FROM profiles WHERE id = auth.uid()
    )
  );

-- MANAGE: Only Directors and Teachers of that school can create/edit classes
CREATE POLICY "Directors/Teachers can manage classes" ON live_classes
  FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND school_id = live_classes.school_id 
        AND role IN ('director', 'teacher', 'admin')
    )
  );

-- Admins can do everything
CREATE POLICY "Admins can manage all classes" ON live_classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

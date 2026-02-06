-- Courses Table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  level TEXT CHECK (level IN ('N5', 'N4', 'N3', 'N2', 'N1', 'Basics', 'Other')),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Modules (Chapters) Table
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Workbook Pages Table (Stores the JSON content blocks)
CREATE TABLE workbook_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of Block objects
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- User Progress Table (Stores answers and completion status)
CREATE TABLE user_workbook_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  page_id UUID REFERENCES workbook_pages(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}'::jsonb, -- Key-value pair of block_id: user_answer
  is_completed BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, page_id)
);

-- RLS Policies

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workbook_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workbook_progress ENABLE ROW LEVEL SECURITY;

-- Courses: Everyone can read published. Admins/Directors can read all.
CREATE POLICY "Public courses are viewable by everyone" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins/Directors can view all courses" ON courses
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'director', 'teacher'))
  );

CREATE POLICY "Admins can insert/update courses" ON courses
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Modules: Inherit access from courses
CREATE POLICY "Modules viewable if course is viewable" ON modules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE id = modules.course_id AND (is_published = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'director', 'teacher'))))
  );

CREATE POLICY "Admins can manage modules" ON modules
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Pages: Inherit access from modules -> courses
CREATE POLICY "Pages viewable if module is viewable" ON workbook_pages
  FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM modules m
        JOIN courses c ON m.course_id = c.id
        WHERE m.id = workbook_pages.module_id 
        AND (c.is_published = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'director', 'teacher')))
    )
  );

CREATE POLICY "Admins can manage pages" ON workbook_pages
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Progress: Users own their progress. Directors/Teachers can view their students' progress (future implementation).
CREATE POLICY "Users can manage their own progress" ON user_workbook_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins/Directors can view progress" ON user_workbook_progress
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'director', 'teacher'))
  );

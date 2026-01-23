-- Create subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  visible BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create game_categories table
CREATE TABLE game_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  visible BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create games_config table
CREATE TABLE games_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id TEXT NOT NULL,
  category_id UUID REFERENCES game_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visible BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(game_id, category_id)
);

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE games_config ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can view visible items
CREATE POLICY "Public can view visible subjects" ON subjects FOR SELECT USING (visible = true);
CREATE POLICY "Public can view visible categories" ON game_categories FOR SELECT USING (visible = true);
CREATE POLICY "Public can view visible games" ON games_config FOR SELECT USING (visible = true);

-- Admins can manage everything (using service role)

-- Seed initial data: Japanese subject
INSERT INTO subjects (name, slug, visible, order_index) VALUES ('Japanese', 'japanese', true, 1);

-- Get the Japanese subject ID for categories
DO $$
DECLARE
  japanese_id UUID;
  basic_cat_id UUID;
  advanced_cat_id UUID;
BEGIN
  SELECT id INTO japanese_id FROM subjects WHERE slug = 'japanese';
  
  -- Create categories
  INSERT INTO game_categories (subject_id, name, visible, order_index) 
  VALUES (japanese_id, 'Basic Games', true, 1)
  RETURNING id INTO basic_cat_id;
  
  INSERT INTO game_categories (subject_id, name, visible, order_index) 
  VALUES (japanese_id, 'Advanced Games', true, 2)
  RETURNING id INTO advanced_cat_id;
  
  -- Seed existing games into Basic category
  INSERT INTO games_config (game_id, category_id, name, description, visible, order_index) VALUES
    ('study', basic_cat_id, 'Practice Mode', 'Pratique com repetição espaçada', true, 1),
    ('quiz', basic_cat_id, 'Quiz Mode', 'Perguntas de múltipla escolha', true, 2),
    ('timed', basic_cat_id, 'Timed Mode', 'Responda rápido!', true, 3),
    ('memory', basic_cat_id, 'Memory Mode', 'Jogo da memória', true, 4),
    ('matching', basic_cat_id, 'Matching Mode', 'Conecte os pares', true, 5),
    ('truefalse', basic_cat_id, 'True or False', 'Verdadeiro ou Falso?', true, 6),
    ('fillblank', basic_cat_id, 'Fill in the Blank', 'Complete a frase', true, 7);
  
  -- Seed advanced games into Advanced category
  INSERT INTO games_config (game_id, category_id, name, description, visible, order_index) VALUES
    ('alphabetorder', advanced_cat_id, 'Alphabet Order', 'Ordem alfabética', true, 1),
    ('sentence_scramble', advanced_cat_id, 'Sentence Scramble', 'Ordene as frases', true, 2),
    ('listening', advanced_cat_id, 'Listening', 'Prática de audição', true, 3),
    ('kanji_drawing', advanced_cat_id, 'Kanji Drawing', 'Desenhe o Kanji correto', true, 4),
    ('final_exam', advanced_cat_id, 'Final Exam', 'Teste final', true, 5);
END $$;

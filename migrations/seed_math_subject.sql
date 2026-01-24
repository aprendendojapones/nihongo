-- Seed Math subject
INSERT INTO subjects (name, slug, visible, order_index, visibility_level)
VALUES ('Matemática', 'math', true, 2, 'everyone')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, visible = EXCLUDED.visible, order_index = EXCLUDED.order_index, visibility_level = EXCLUDED.visibility_level;

-- Get the Math subject ID
DO $$
DECLARE
  math_id UUID;
  math_cat_id UUID;
BEGIN
  SELECT id INTO math_id FROM subjects WHERE slug = 'math';
  
  -- Create category for Math
  INSERT INTO game_categories (subject_id, name, visible, order_index, visibility_level) 
  VALUES (math_id, 'Jogos de Matemática', true, 1, 'everyone')
  RETURNING id INTO math_cat_id;
  
  -- Seed Math games
  INSERT INTO games_config (game_id, category_id, name, description, visible, order_index, visibility_level) VALUES
    ('math_quiz', math_cat_id, 'Múltipla Escolha', 'Pratique contas rápidas com 4 opções de resposta.', true, 1, 'everyone'),
    ('math_progression', math_cat_id, 'Níveis Escolares', 'Suba de nível resolvendo contas e passando em provas.', true, 2, 'everyone'),
    ('math_dash', math_cat_id, 'Math Dash', 'Seja rápido! Resolva o máximo de contas antes do tempo acabar.', true, 3, 'everyone')
  ON CONFLICT (game_id, category_id) DO UPDATE SET 
    name = EXCLUDED.name, 
    description = EXCLUDED.description, 
    visible = EXCLUDED.visible, 
    order_index = EXCLUDED.order_index, 
    visibility_level = EXCLUDED.visibility_level;
END $$;

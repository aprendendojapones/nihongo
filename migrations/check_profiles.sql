-- Script para verificar e corrigir perfis existentes
-- Execute este SQL no Supabase para diagnosticar o problema

-- 1. Verificar quantos perfis existem
SELECT COUNT(*) as total_profiles FROM profiles;

-- 2. Ver todos os perfis (limitar a 10 para não sobrecarregar)
SELECT id, email, full_name, role, level FROM profiles LIMIT 10;

-- 3. Verificar se as colunas existem
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Se não houver perfis, criar um perfil de admin manualmente
-- SUBSTITUA 'seu-email@gmail.com' pelo seu email real
INSERT INTO profiles (email, full_name, role, level, xp, streak, language_pref)
VALUES ('maicontsuda@gmail.com', 'Admin', 'admin', 'N5', 0, 0, 'pt')
ON CONFLICT (email) 
DO UPDATE SET role = 'admin';

# Como Executar a Migração no Supabase

## Passo a Passo

1. **Acesse o Supabase Dashboard**
   - Vá para <https://supabase.com/dashboard>
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New Query"

3. **Cole o SQL**
   - Copie todo o conteúdo do arquivo `migrations/add_profile_fields.sql`
   - Cole no editor SQL

4. **Execute**
   - Clique em "Run" ou pressione Ctrl+Enter
   - Aguarde a confirmação de sucesso

5. **Verifique**
   - Vá em "Table Editor" → "profiles"
   - Confirme que as colunas foram adicionadas:
     - `username`
     - `phone`
     - `address`
     - `phone_public`
     - `address_public`

## Após executar

Teste novamente salvar o perfil no site. Agora deve funcionar!

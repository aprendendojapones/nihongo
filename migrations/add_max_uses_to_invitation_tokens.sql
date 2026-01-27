-- Add max_uses and options columns to invitation_tokens table
ALTER TABLE invitation_tokens 
ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '{}'::jsonb;

-- Optional: Add comments
COMMENT ON COLUMN invitation_tokens.max_uses IS 'Maximum number of times this token can be used';
COMMENT ON COLUMN invitation_tokens.options IS 'JSONB column for additional options like discount, free_family, etc.';

-- Comprehensive migration to update invitation_tokens table
-- This adds all missing columns needed for the invitation system

-- Add missing columns
ALTER TABLE invitation_tokens 
ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS uses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Update the role check constraint to include all roles
ALTER TABLE invitation_tokens DROP CONSTRAINT IF EXISTS invitation_tokens_role_check;
ALTER TABLE invitation_tokens ADD CONSTRAINT invitation_tokens_role_check 
CHECK (role IN ('director', 'teacher', 'employee', 'friend', 'student', 'admin'));

-- If the old 'used' column exists, migrate data and drop it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'invitation_tokens' AND column_name = 'used') THEN
        -- Mark tokens as inactive if they were used
        UPDATE invitation_tokens SET active = NOT used WHERE used = true;
        -- Drop the old column
        ALTER TABLE invitation_tokens DROP COLUMN used;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN invitation_tokens.max_uses IS 'Maximum number of times this token can be used';
COMMENT ON COLUMN invitation_tokens.uses IS 'Current number of times this token has been used';
COMMENT ON COLUMN invitation_tokens.options IS 'JSONB column for additional options like discount_percent, free_family, is_free, school_id';
COMMENT ON COLUMN invitation_tokens.active IS 'Whether this token is still active (becomes false when max_uses is reached)';

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'invitation_tokens'
ORDER BY ordinal_position;

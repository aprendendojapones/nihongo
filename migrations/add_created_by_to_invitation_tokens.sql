-- Add created_by column to invitation_tokens table
ALTER TABLE invitation_tokens 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Optional: Add comment
COMMENT ON COLUMN invitation_tokens.created_by IS 'User ID of the admin/director who generated the invite';

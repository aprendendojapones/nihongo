-- Create invitation_tokens table for single-use director invitations
CREATE TABLE IF NOT EXISTS invitation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('director', 'teacher')),
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE invitation_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can create invitation tokens
CREATE POLICY "Only admins can create invitation tokens"
ON invitation_tokens FOR INSERT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: Anyone can read valid (unused, non-expired) tokens
CREATE POLICY "Anyone can read valid tokens"
ON invitation_tokens FOR SELECT
USING (
  used = false 
  AND expires_at > now()
);

-- Policy: Only admins can update tokens (mark as used)
CREATE POLICY "Only admins can update tokens"
ON invitation_tokens FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Verify the table was created
SELECT * FROM invitation_tokens LIMIT 1;

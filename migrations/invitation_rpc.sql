-- Migration: Invitation RPC Functions
-- Execute this in Supabase SQL Editor

-- 1. Generate Invitation
CREATE OR REPLACE FUNCTION generate_invitation(
  p_role TEXT,
  p_max_uses INTEGER,
  p_options JSONB,
  p_expires_in_days INTEGER DEFAULT 7
)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
  v_user_role TEXT;
BEGIN
  -- Check permission
  SELECT role INTO v_user_role FROM profiles WHERE id = auth.uid();
  
  IF v_user_role NOT IN ('admin', 'director', 'manager') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Generate random token (simple 8 char string)
  v_token := encode(gen_random_bytes(6), 'hex');

  INSERT INTO invitation_tokens (token, role, created_by, max_uses, options, expires_at)
  VALUES (
    v_token,
    p_role,
    auth.uid(),
    p_max_uses,
    p_options,
    now() + (p_expires_in_days || ' days')::interval
  );

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Consume Invitation (Called during registration)
CREATE OR REPLACE FUNCTION consume_invitation(
  p_token TEXT,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_invite invitation_tokens%ROWTYPE;
BEGIN
  -- Find token
  SELECT * INTO v_invite FROM invitation_tokens 
  WHERE token = p_token AND active = TRUE;

  IF v_invite IS NULL THEN
    RAISE EXCEPTION 'Invalid token';
  END IF;

  IF v_invite.expires_at < now() THEN
    RAISE EXCEPTION 'Token expired';
  END IF;

  IF v_invite.uses >= v_invite.max_uses THEN
    RAISE EXCEPTION 'Token usage limit reached';
  END IF;

  -- Update user profile
  UPDATE profiles 
  SET role = v_invite.role,
      school_id = (v_invite.options->>'school_id')::uuid
  WHERE id = p_user_id;

  -- Handle specific options
  -- If Family Mode (Friend with free family)
  IF (v_invite.options->>'free_family')::boolean THEN
     -- Logic to add to family plan or give free plan would go here
     -- For now, let's just log it or maybe update subscription directly
     INSERT INTO subscriptions (user_id, plan_id, status)
     VALUES (p_user_id, 'family', 'active');
  END IF;

  -- Increment uses
  UPDATE invitation_tokens 
  SET uses = uses + 1,
      active = (uses + 1 < max_uses)
  WHERE id = v_invite.id;

  RETURN v_invite.options;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

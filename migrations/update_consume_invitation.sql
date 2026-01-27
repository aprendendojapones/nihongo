-- Update consume_invitation to handle is_free option
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
  
  -- If Family Mode
  IF (v_invite.options->>'free_family')::boolean THEN
     INSERT INTO subscriptions (user_id, plan_id, status)
     VALUES (p_user_id, 'family', 'active')
     ON CONFLICT (user_id) DO UPDATE SET status = 'active', plan_id = 'family';
  END IF;

  -- If Free (Gratis)
  IF (v_invite.options->>'is_free')::boolean THEN
     INSERT INTO subscriptions (user_id, plan_id, status)
     VALUES (p_user_id, 'premium', 'active')
     ON CONFLICT (user_id) DO UPDATE SET status = 'active', plan_id = 'premium';
  END IF;

  -- Increment uses
  UPDATE invitation_tokens 
  SET uses = uses + 1,
      active = (uses + 1 < max_uses)
  WHERE id = v_invite.id;

  RETURN v_invite.options;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

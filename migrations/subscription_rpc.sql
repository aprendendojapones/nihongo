-- Migration: Subscription RPC Functions
-- Execute this in Supabase SQL Editor

-- 1. Subscribe User
CREATE OR REPLACE FUNCTION subscribe_user(p_user_id UUID, p_plan_id TEXT)
RETURNS VOID AS $$
BEGIN
  -- Deactivate existing active subscriptions
  UPDATE subscriptions 
  SET status = 'cancelled', updated_at = now()
  WHERE user_id = p_user_id AND status = 'active';

  -- Create new subscription
  INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
  VALUES (
    p_user_id, 
    p_plan_id, 
    'active', 
    now(), 
    now() + INTERVAL '1 month'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add Family Member
CREATE OR REPLACE FUNCTION add_family_member(p_owner_id UUID, p_member_email TEXT)
RETURNS TEXT AS $$
DECLARE
  v_member_id UUID;
  v_plan_id TEXT;
  v_current_members INTEGER;
BEGIN
  -- Check if owner has a family plan
  SELECT plan_id INTO v_plan_id 
  FROM subscriptions 
  WHERE user_id = p_owner_id AND status = 'active' 
  LIMIT 1;

  IF v_plan_id != 'family' THEN
    RAISE EXCEPTION 'User does not have an active family plan';
  END IF;

  -- Check member count
  SELECT COUNT(*) INTO v_current_members 
  FROM family_members 
  WHERE owner_id = p_owner_id;

  IF v_current_members >= 3 THEN -- Owner + 3 members = 4 total
    RAISE EXCEPTION 'Family plan is full';
  END IF;

  -- Find member by email
  SELECT id INTO v_member_id FROM profiles WHERE email = p_member_email;
  
  IF v_member_id IS NULL THEN
    RETURN 'User not found';
  END IF;

  -- Add member
  INSERT INTO family_members (owner_id, member_id)
  VALUES (p_owner_id, v_member_id)
  ON CONFLICT (owner_id, member_id) DO NOTHING;

  RETURN 'Success';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Calculate School Discount
-- Call this function periodically or via trigger when a student links to a school
CREATE OR REPLACE FUNCTION update_school_discount(p_school_id UUID)
RETURNS VOID AS $$
DECLARE
  v_count INTEGER;
  v_discount INTEGER;
BEGIN
  -- Count students linked to this school who have an active school plan
  SELECT COUNT(DISTINCT s.user_id) INTO v_count
  FROM subscriptions s
  JOIN profiles p ON s.user_id = p.id
  WHERE p.school_id = p_school_id 
  AND s.plan_id = 'school' 
  AND s.status = 'active';

  -- Determine discount
  IF v_count >= 100 THEN v_discount := 50;
  ELSIF v_count >= 80 THEN v_discount := 40;
  ELSIF v_count >= 50 THEN v_discount := 30;
  ELSIF v_count >= 25 THEN v_discount := 20;
  ELSIF v_count >= 10 THEN v_discount := 10;
  ELSE v_discount := 0;
  END IF;

  -- Update discount table
  INSERT INTO school_discounts (school_id, student_count, current_discount_percent, updated_at)
  VALUES (p_school_id, v_count, v_discount, now())
  ON CONFLICT (school_id) 
  DO UPDATE SET 
    student_count = EXCLUDED.student_count,
    current_discount_percent = EXCLUDED.current_discount_percent,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

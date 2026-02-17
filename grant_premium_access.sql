-- Grant premium/pro access to rob@dealpress.ai
-- Run this in Supabase SQL Editor

-- First, find the user and their organization
-- This will show you the current status
SELECT
  u.id as user_id,
  u.email,
  o.id as org_id,
  o.name as org_name,
  o.subscription_plan,
  o.subscription_status,
  o.max_users,
  o.max_requests_per_month
FROM auth.users u
JOIN organization_members om ON om.user_id = u.id
JOIN organizations o ON o.id = om.organization_id
WHERE u.email = 'rob@dealpress.ai';

-- Update the organization to Pro plan with unlimited access
UPDATE organizations
SET
  subscription_plan = 'pro',
  subscription_tier = 'pro',
  subscription_status = 'active',
  max_users = 999999,
  max_requests_per_month = 999999,
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 year',
  updated_at = NOW()
WHERE id IN (
  SELECT o.id
  FROM auth.users u
  JOIN organization_members om ON om.user_id = u.id
  JOIN organizations o ON o.id = om.organization_id
  WHERE u.email = 'rob@dealpress.ai'
);

-- Verify the update
SELECT
  u.email,
  o.name as org_name,
  o.subscription_plan,
  o.subscription_status,
  o.max_users,
  o.max_requests_per_month,
  o.current_period_end
FROM auth.users u
JOIN organization_members om ON om.user_id = u.id
JOIN organizations o ON o.id = om.organization_id
WHERE u.email = 'rob@dealpress.ai';

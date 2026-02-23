-- Debug queries to check team invitation issue
-- Run these in Supabase SQL Editor

-- 1. Check if rob@dealpress.ai organization exists
SELECT
  o.id,
  o.name,
  COUNT(om.id) as member_count
FROM organizations o
LEFT JOIN organization_members om ON om.organization_id = o.id
LEFT JOIN user_profiles up ON up.id = om.user_id
WHERE up.email = 'rob@dealpress.ai'
GROUP BY o.id, o.name;

-- 2. Check all members in rob's organization
SELECT
  om.id,
  om.role,
  up.email,
  up.name,
  om.created_at
FROM organization_members om
JOIN user_profiles up ON up.id = om.user_id
WHERE om.organization_id = (
  SELECT om2.organization_id
  FROM organization_members om2
  JOIN user_profiles up2 ON up2.id = om2.user_id
  WHERE up2.email = 'rob@dealpress.ai'
  LIMIT 1
);

-- 3. Check pending invitations
SELECT
  ti.email,
  ti.role,
  ti.invitation_token,
  ti.accepted_at,
  ti.expires_at,
  ti.created_at,
  CASE
    WHEN ti.accepted_at IS NOT NULL THEN 'Accepted'
    WHEN ti.expires_at < NOW() THEN 'Expired'
    ELSE 'Pending'
  END as status
FROM team_invitations ti
WHERE ti.organization_id = (
  SELECT om.organization_id
  FROM organization_members om
  JOIN user_profiles up ON up.id = om.user_id
  WHERE up.email = 'rob@dealpress.ai'
  LIMIT 1
);

-- 4. Check if rob+finance@dealpress.ai user exists
SELECT
  au.id,
  au.email,
  au.created_at,
  up.name,
  COUNT(om.id) as org_count
FROM auth.users au
LEFT JOIN user_profiles up ON up.id = au.id
LEFT JOIN organization_members om ON om.user_id = au.id
WHERE au.email ILIKE '%rob+finance%'
GROUP BY au.id, au.email, au.created_at, up.name;

-- 5. Check if invitation was accepted or user signed up independently
SELECT
  'User created their own org' as scenario,
  o.name as org_name,
  o.created_at
FROM organizations o
WHERE o.created_by IN (
  SELECT id FROM auth.users WHERE email = 'rob+finance@dealpress.ai'
)
UNION ALL
SELECT
  'User joined via invitation' as scenario,
  o.name as org_name,
  ti.accepted_at as created_at
FROM team_invitations ti
JOIN organizations o ON o.id = ti.organization_id
WHERE ti.email = 'rob+finance@dealpress.ai'
  AND ti.accepted_at IS NOT NULL;

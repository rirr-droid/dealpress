-- DIAGNOSTIC QUERIES FOR ROB+HR ISSUE (FIXED)
-- Run these in Supabase SQL Editor one by one

-- 1. Check if rob+hr user exists
SELECT
  au.id as user_id,
  au.email,
  au.created_at,
  up.name
FROM auth.users au
LEFT JOIN user_profiles up ON up.id = au.id
WHERE au.email = 'rob+hr@dealpress.ai';

-- 2. Check rob@dealpress.ai organization
SELECT
  o.id as org_id,
  o.name,
  o.created_at,
  om.role,
  'This is robs org' as note
FROM organizations o
JOIN organization_members om ON om.organization_id = o.id
JOIN user_profiles up ON up.id = om.user_id
WHERE up.email = 'rob@dealpress.ai';

-- 3. Check ALL members in rob's organization
SELECT
  om.id as membership_id,
  om.user_id,
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
)
ORDER BY om.created_at;

-- 4. Check invitation status for rob+hr
SELECT
  ti.id,
  ti.email,
  ti.role,
  ti.accepted_at,
  ti.expires_at,
  ti.created_at,
  o.name as org_name,
  CASE
    WHEN ti.accepted_at IS NOT NULL THEN 'ACCEPTED'
    WHEN ti.expires_at < NOW() THEN 'EXPIRED'
    ELSE 'PENDING'
  END as status
FROM team_invitations ti
JOIN organizations o ON o.id = ti.organization_id
WHERE ti.email = 'rob+hr@dealpress.ai'
ORDER BY ti.created_at DESC;

-- 5. Check if rob+hr is in ANY organization
SELECT
  o.name as org_name,
  o.id as org_id,
  om.role as rob_hr_role,
  om.created_at as joined_at
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
JOIN user_profiles up ON up.id = om.user_id
WHERE up.email = 'rob+hr@dealpress.ai';

-- 6. Count all organizations and their members
SELECT
  o.name as org_name,
  o.id as org_id,
  COUNT(om.id) as member_count,
  STRING_AGG(up.email, ', ') as members
FROM organizations o
LEFT JOIN organization_members om ON om.organization_id = o.id
LEFT JOIN user_profiles up ON up.id = om.user_id
GROUP BY o.id, o.name
HAVING COUNT(om.id) > 0
ORDER BY o.created_at DESC;

-- 7. Check if rob+hr has a user_profile
SELECT
  up.id,
  up.email,
  up.name,
  up.created_at
FROM user_profiles up
WHERE up.email = 'rob+hr@dealpress.ai';

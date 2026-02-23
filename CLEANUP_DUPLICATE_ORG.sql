-- Clean up duplicate organization for rob+hr
-- This script removes the self-created "rob+hr" organization
-- and keeps only the "Dealpress" organization membership

-- Step 1: Find the duplicate organization ID
WITH rob_hr_orgs AS (
  SELECT DISTINCT o.id, o.name, om.role
  FROM organizations o
  JOIN organization_members om ON o.id = om.organization_id
  JOIN user_profiles up ON om.user_id = up.id
  WHERE up.email = 'rob+hr@dealpress.ai'
)
SELECT * FROM rob_hr_orgs;

-- Step 2: Delete the organization where rob+hr is owner (their self-created org)
-- This will cascade delete the organization_members entry due to foreign key constraints
DELETE FROM organizations
WHERE id IN (
  SELECT o.id
  FROM organizations o
  JOIN organization_members om ON o.id = om.organization_id
  JOIN user_profiles up ON om.user_id = up.id
  WHERE up.email = 'rob+hr@dealpress.ai'
  AND om.role = 'owner'
  AND o.name = 'rob+hr'
);

-- Step 3: Verify rob+hr is now only in the Dealpress organization
SELECT
  o.name as org_name,
  om.role,
  up.email,
  up.name
FROM organizations o
JOIN organization_members om ON o.id = om.organization_id
JOIN user_profiles up ON om.user_id = up.id
WHERE up.email = 'rob+hr@dealpress.ai';

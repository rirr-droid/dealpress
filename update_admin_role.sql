-- First, let's see current memberships
SELECT 
  om.id,
  om.user_id,
  om.organization_id,
  om.role,
  u.email,
  o.name as org_name
FROM organization_members om
JOIN auth.users u ON u.id = om.user_id
JOIN organizations o ON o.id = om.organization_id;

-- Update all your memberships to admin role
UPDATE organization_members
SET role = 'admin'
WHERE user_id IN (SELECT id FROM auth.users);

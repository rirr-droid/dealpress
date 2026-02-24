-- Check the role for rirr@tepper.cmu.edu
SELECT 
  u.email,
  om.role,
  om.organization_id,
  o.name as org_name
FROM auth.users u
LEFT JOIN organization_members om ON u.id = om.user_id
LEFT JOIN organizations o ON om.organization_id = o.id
WHERE u.email = 'rirr@tepper.cmu.edu';

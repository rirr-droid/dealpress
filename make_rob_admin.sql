-- Make rob@dealpress.ai an admin in all organizations they're a member of
UPDATE organization_members
SET role = 'admin'
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'rob@dealpress.ai'
);

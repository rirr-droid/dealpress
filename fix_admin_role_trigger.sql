-- Fix the handle_new_user trigger to set role as 'admin' instead of 'owner'
-- This ensures new users can access admin-only pages like /settings

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_slug TEXT;
BEGIN
  -- Generate unique org slug
  org_slug := LOWER(REGEXP_REPLACE(
    COALESCE(NEW.raw_user_meta_data->>'company_name', SPLIT_PART(NEW.email, '@', 1)), 
    '[^a-z0-9]+', '-', 'g'
  )) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  
  -- Create organization
  INSERT INTO public.organizations (name, slug) 
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', SPLIT_PART(NEW.email, '@', 1)), 
    org_slug
  ) 
  RETURNING id INTO new_org_id;
  
  -- Create user profile
  INSERT INTO public.user_profiles (id, email, name) 
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1))
  );
  
  -- Create organization membership with 'admin' role (not 'owner')
  INSERT INTO public.organization_members (organization_id, user_id, role, joined_at) 
  VALUES (new_org_id, NEW.id, 'admin', NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update any existing 'owner' roles to 'admin' for consistency
UPDATE organization_members SET role = 'admin' WHERE role = 'owner';

-- Verify the changes
SELECT 
  u.email, 
  om.role,
  o.name as org_name
FROM organization_members om
JOIN auth.users u ON om.user_id = u.id
JOIN organizations o ON om.organization_id = o.id;

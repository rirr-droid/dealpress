-- Fix handle_new_user function to explicitly set subscription_plan
-- This fixes the constraint violation when users sign up via email/password

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  org_slug TEXT;
BEGIN
  -- Generate org slug first
  org_slug := COALESCE(
    SPLIT_PART(NEW.email, '@', 1),
    'org'
  ) || '-' || SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8);

  -- Create organization with explicit subscription_plan, subscription_status, and slug
  INSERT INTO public.organizations (name, slug, subscription_plan, subscription_status)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', SPLIT_PART(NEW.email, '@', 1) || '''s Organization'),
    org_slug,   -- ✅ Explicitly set slug
    'starter',  -- ✅ Explicitly set
    'active'    -- ✅ Explicitly set
  )
  RETURNING id INTO org_id;

  -- Create user profile
  INSERT INTO public.user_profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Add user as admin to organization
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (org_id, NEW.id, 'admin');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

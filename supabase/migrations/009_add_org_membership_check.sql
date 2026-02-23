-- Add database function to check if a user has any pending invitations
-- This is used by the auth callback to prevent creating duplicate organizations

-- Create a function that returns TRUE if user has pending invitations
CREATE OR REPLACE FUNCTION has_pending_invitation(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM team_invitations
    WHERE email = user_email
      AND accepted_at IS NULL
      AND expires_at > NOW()
  );
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION has_pending_invitation(TEXT) IS
  'Checks if a user has any pending team invitations. Used by auth callback to prevent duplicate organization creation.';

-- Create a function to get user's organization count
CREATE OR REPLACE FUNCTION get_user_org_count(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO org_count
  FROM organization_members
  WHERE organization_members.user_id = get_user_org_count.user_id;

  RETURN org_count;
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION get_user_org_count(UUID) IS
  'Returns the number of organizations a user belongs to. Most users should only be in one organization.';

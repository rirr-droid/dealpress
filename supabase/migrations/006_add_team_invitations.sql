-- Create team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_invitations_org ON team_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);

-- Enable RLS
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_invitations
-- Admins can view all invitations for their org
CREATE POLICY "Admins can view invitations in their org"
  ON team_invitations
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can create invitations
CREATE POLICY "Admins can create invitations"
  ON team_invitations
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete (cancel) invitations
CREATE POLICY "Admins can delete invitations"
  ON team_invitations
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Anyone can view their own pending invitations by email (for acceptance flow)
CREATE POLICY "Users can view invitations sent to their email"
  ON team_invitations
  FOR SELECT
  USING (
    email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
    OR email IN (
      SELECT email FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM team_invitations
  WHERE expires_at < NOW()
    AND accepted_at IS NULL;
END;
$$;

-- Function to accept invitation
CREATE OR REPLACE FUNCTION accept_team_invitation(
  p_token TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation team_invitations;
  v_user_email TEXT;
  v_member_id UUID;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;

  IF v_user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Find invitation
  SELECT * INTO v_invitation
  FROM team_invitations
  WHERE invitation_token = p_token
    AND accepted_at IS NULL
    AND expires_at > NOW();

  IF v_invitation IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  -- Check if email matches
  IF v_invitation.email != v_user_email THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email does not match invitation');
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = v_invitation.organization_id
      AND user_id = p_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already a member of this organization');
  END IF;

  -- Add user to organization
  INSERT INTO organization_members (
    organization_id,
    user_id,
    role
  ) VALUES (
    v_invitation.organization_id,
    p_user_id,
    v_invitation.role
  )
  RETURNING id INTO v_member_id;

  -- Mark invitation as accepted
  UPDATE team_invitations
  SET accepted_at = NOW(),
      updated_at = NOW()
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object(
    'success', true,
    'organization_id', v_invitation.organization_id,
    'member_id', v_member_id
  );
END;
$$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_team_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_invitations_updated_at
  BEFORE UPDATE ON team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_team_invitations_updated_at();

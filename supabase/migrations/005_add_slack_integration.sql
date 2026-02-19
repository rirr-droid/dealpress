-- Add Slack configuration to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS slack_workspace_id TEXT,
ADD COLUMN IF NOT EXISTS slack_bot_token TEXT, -- Will be encrypted
ADD COLUMN IF NOT EXISTS slack_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS slack_channel_id TEXT; -- Default channel for notifications

-- Create slack_users table for user matching
CREATE TABLE IF NOT EXISTS slack_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slack_user_id TEXT NOT NULL, -- Slack's user ID (e.g., U01234ABCD)
  slack_email TEXT, -- For matching DealPress users to Slack users
  slack_display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slack_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_slack_users_org ON slack_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_slack_users_email ON slack_users(slack_email);
CREATE INDEX IF NOT EXISTS idx_slack_users_slack_id ON slack_users(slack_user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slack_enabled ON organizations(slack_enabled) WHERE slack_enabled = true;

-- Enable RLS
ALTER TABLE slack_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for slack_users
CREATE POLICY "Users can view slack_users in their org"
  ON slack_users
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage slack_users in their org"
  ON slack_users
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to sync Slack users
CREATE OR REPLACE FUNCTION sync_slack_user(
  p_org_id UUID,
  p_slack_user_id TEXT,
  p_slack_email TEXT,
  p_slack_display_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_slack_user_id UUID;
BEGIN
  -- Try to find DealPress user by email
  SELECT id INTO v_user_id
  FROM user_profiles
  WHERE email = p_slack_email
  LIMIT 1;

  -- Upsert slack_user
  INSERT INTO slack_users (
    organization_id,
    user_id,
    slack_user_id,
    slack_email,
    slack_display_name,
    updated_at
  ) VALUES (
    p_org_id,
    v_user_id,
    p_slack_user_id,
    p_slack_email,
    p_slack_display_name,
    NOW()
  )
  ON CONFLICT (organization_id, slack_user_id)
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    slack_email = EXCLUDED.slack_email,
    slack_display_name = EXCLUDED.slack_display_name,
    updated_at = NOW()
  RETURNING id INTO v_slack_user_id;

  RETURN v_slack_user_id;
END;
$$;

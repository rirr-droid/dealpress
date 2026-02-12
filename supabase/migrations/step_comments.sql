-- Create step_comments table for discussion threads on approval steps
CREATE TABLE IF NOT EXISTS step_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES approval_steps(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS step_comments_step_id_idx ON step_comments(step_id);
CREATE INDEX IF NOT EXISTS step_comments_created_at_idx ON step_comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE step_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see comments from their organization
CREATE POLICY "Users can view comments in their organization"
  ON step_comments FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Users can insert comments in their organization
CREATE POLICY "Users can create comments in their organization"
  ON step_comments FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON step_comments FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own comments (or admins)
CREATE POLICY "Users can delete their own comments"
  ON step_comments FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organization_members
      WHERE user_id = auth.uid()
      AND organization_id = step_comments.organization_id
      AND role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_step_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER step_comments_updated_at
  BEFORE UPDATE ON step_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_step_comments_updated_at();

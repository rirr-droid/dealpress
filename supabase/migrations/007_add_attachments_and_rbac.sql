-- Add attachments table for approval requests
CREATE TABLE IF NOT EXISTS approval_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attachments_request ON approval_attachments(request_id);
CREATE INDEX IF NOT EXISTS idx_attachments_org ON approval_attachments(organization_id);

-- Enable RLS
ALTER TABLE approval_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view attachments in their organization
CREATE POLICY "Users can view attachments in their org"
  ON approval_attachments
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can upload attachments to requests in their org
CREATE POLICY "Users can upload attachments in their org"
  ON approval_attachments
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
    AND uploaded_by = auth.uid()
  );

-- Users can delete their own attachments, admins can delete any
CREATE POLICY "Users can delete own attachments, admins can delete any"
  ON approval_attachments
  FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add RBAC helper function
CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

-- Update approval_templates RLS to restrict non-admins
DROP POLICY IF EXISTS "Users can view templates in their org" ON approval_templates;
CREATE POLICY "Users can view templates in their org"
  ON approval_templates
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create templates in their org" ON approval_templates;
CREATE POLICY "Admins can create templates in their org"
  ON approval_templates
  FOR INSERT
  WITH CHECK (
    is_org_admin(organization_id)
  );

DROP POLICY IF EXISTS "Users can update templates in their org" ON approval_templates;
CREATE POLICY "Admins can update templates in their org"
  ON approval_templates
  FOR UPDATE
  USING (
    is_org_admin(organization_id)
  );

DROP POLICY IF EXISTS "Users can delete templates in their org" ON approval_templates;
CREATE POLICY "Admins can delete templates in their org"
  ON approval_templates
  FOR DELETE
  USING (
    is_org_admin(organization_id)
  );

-- Update template_steps RLS
DROP POLICY IF EXISTS "Users can view template steps in their org" ON template_steps;
CREATE POLICY "Users can view template steps in their org"
  ON template_steps
  FOR SELECT
  USING (
    template_id IN (
      SELECT id FROM approval_templates
      WHERE organization_id IN (
        SELECT organization_id
        FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can create template steps in their org" ON template_steps;
CREATE POLICY "Admins can create template steps in their org"
  ON template_steps
  FOR INSERT
  WITH CHECK (
    template_id IN (
      SELECT id FROM approval_templates
      WHERE is_org_admin(organization_id)
    )
  );

DROP POLICY IF EXISTS "Users can update template steps in their org" ON template_steps;
CREATE POLICY "Admins can update template steps in their org"
  ON template_steps
  FOR UPDATE
  USING (
    template_id IN (
      SELECT id FROM approval_templates
      WHERE is_org_admin(organization_id)
    )
  );

DROP POLICY IF EXISTS "Users can delete template steps in their org" ON template_steps;
CREATE POLICY "Admins can delete template steps in their org"
  ON template_steps
  FOR DELETE
  USING (
    template_id IN (
      SELECT id FROM approval_templates
      WHERE is_org_admin(organization_id)
    )
  );

-- Migration: Add support for multiple approvers per template step
-- This allows templates to assign specific team members to approval steps

-- Create a junction table for template step approvers
CREATE TABLE IF NOT EXISTS template_step_approvers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_step_id UUID NOT NULL REFERENCES template_steps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_step_id, user_id)
);

-- Add RLS policies
ALTER TABLE template_step_approvers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view approvers for templates in their organization
CREATE POLICY "Users can view template step approvers in their org"
  ON template_step_approvers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM template_steps ts
      JOIN approval_templates at ON ts.template_id = at.id
      JOIN organization_members om ON om.organization_id = at.organization_id
      WHERE ts.id = template_step_approvers.template_step_id
        AND om.user_id = auth.uid()
    )
  );

-- Policy: Admins can manage approvers for templates in their organization
CREATE POLICY "Admins can manage template step approvers"
  ON template_step_approvers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM template_steps ts
      JOIN approval_templates at ON ts.template_id = at.id
      JOIN organization_members om ON om.organization_id = at.organization_id
      WHERE ts.id = template_step_approvers.template_step_id
        AND om.user_id = auth.uid()
        AND om.role = 'admin'
    )
  );

-- Add index for performance
CREATE INDEX idx_template_step_approvers_step_id ON template_step_approvers(template_step_id);
CREATE INDEX idx_template_step_approvers_user_id ON template_step_approvers(user_id);

-- Add comment
COMMENT ON TABLE template_step_approvers IS 'Junction table for assigning multiple specific users as approvers for template steps';

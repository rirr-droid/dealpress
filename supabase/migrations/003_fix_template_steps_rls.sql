-- Fix template_steps RLS policies
-- Issue: Only SELECT policy exists, INSERT/UPDATE/DELETE are blocked

-- Add INSERT policy for template_steps
CREATE POLICY "insert_template_steps"
  ON template_steps
  FOR INSERT
  WITH CHECK (
    template_id IN (
      SELECT id FROM approval_templates
      WHERE organization_id IN (SELECT public.user_org_ids())
    )
  );

-- Add UPDATE policy for template_steps
CREATE POLICY "update_template_steps"
  ON template_steps
  FOR UPDATE
  USING (
    template_id IN (
      SELECT id FROM approval_templates
      WHERE organization_id IN (SELECT public.user_org_ids())
    )
  );

-- Add DELETE policy for template_steps
CREATE POLICY "delete_template_steps"
  ON template_steps
  FOR DELETE
  USING (
    template_id IN (
      SELECT id FROM approval_templates
      WHERE organization_id IN (SELECT public.user_org_ids())
    )
  );

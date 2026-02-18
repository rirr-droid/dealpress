-- Create contacts/address book table for approver autocomplete
-- This allows users to save frequently used approvers for quick selection

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Contact details
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  job_title TEXT,
  notes TEXT,

  -- Usage tracking
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique email per organization
  UNIQUE(organization_id, email)
);

-- Index for fast autocomplete searches
CREATE INDEX idx_contacts_org_name ON contacts(organization_id, name);
CREATE INDEX idx_contacts_org_email ON contacts(organization_id, email);
CREATE INDEX idx_contacts_usage ON contacts(organization_id, usage_count DESC);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "view_org_contacts"
  ON contacts FOR SELECT
  USING (organization_id IN (SELECT public.user_org_ids()));

CREATE POLICY "insert_org_contacts"
  ON contacts FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.user_org_ids()));

CREATE POLICY "update_org_contacts"
  ON contacts FOR UPDATE
  USING (organization_id IN (SELECT public.user_org_ids()));

CREATE POLICY "delete_org_contacts"
  ON contacts FOR DELETE
  USING (organization_id IN (SELECT public.user_org_ids()));

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_contacts_updated_at();

-- Add email column to approval_steps to store approver email directly
ALTER TABLE approval_steps
ADD COLUMN approver_email TEXT;

-- Create index for email lookups
CREATE INDEX idx_approval_steps_email ON approval_steps(approver_email);

COMMENT ON TABLE contacts IS 'Address book for frequently used approvers';
COMMENT ON COLUMN contacts.usage_count IS 'Number of times this contact has been used as an approver';
COMMENT ON COLUMN contacts.last_used_at IS 'Last time this contact was selected as an approver';
COMMENT ON COLUMN approval_steps.approver_email IS 'Email of the approver (alternative to approver_id for external approvers)';

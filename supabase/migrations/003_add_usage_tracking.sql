-- Add usage tracking columns to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS requests_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_reset_date TIMESTAMPTZ DEFAULT (date_trunc('month', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 month');

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_organizations_usage_reset ON organizations(usage_reset_date);

-- Update existing organizations to set initial values
UPDATE organizations
SET
  requests_this_month = 0,
  usage_reset_date = date_trunc('month', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 month'
WHERE requests_this_month IS NULL OR usage_reset_date IS NULL;

-- Create function to increment usage counter (atomic operation)
CREATE OR REPLACE FUNCTION increment_requests_this_month(org_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if reset is needed
  UPDATE organizations
  SET
    requests_this_month = CASE
      WHEN usage_reset_date <= NOW() AT TIME ZONE 'UTC' THEN 1
      ELSE requests_this_month + 1
    END,
    usage_reset_date = CASE
      WHEN usage_reset_date <= NOW() AT TIME ZONE 'UTC' THEN date_trunc('month', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 month'
      ELSE usage_reset_date
    END
  WHERE id = org_id;
END;
$$;

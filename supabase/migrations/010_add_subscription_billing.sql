-- Add subscription and billing fields to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'business', 'enterprise')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing', 'unpaid')),
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer
ON organizations(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_stripe_subscription
ON organizations(stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_subscription_plan
ON organizations(subscription_plan);

-- Add helpful comments
COMMENT ON COLUMN organizations.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN organizations.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN organizations.subscription_plan IS 'Current subscription plan: starter (free), professional ($49/mo), business ($99/mo), or enterprise (custom)';
COMMENT ON COLUMN organizations.subscription_status IS 'Stripe subscription status';
COMMENT ON COLUMN organizations.current_period_start IS 'Current billing period start date';
COMMENT ON COLUMN organizations.current_period_end IS 'Current billing period end date';

-- Create usage tracking table for analytics (optional but useful)
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on usage_tracking
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view usage for their organization
CREATE POLICY "Users can view org usage"
  ON usage_tracking
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Create index for usage tracking queries
CREATE INDEX IF NOT EXISTS idx_usage_tracking_org_date
ON usage_tracking(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_event
ON usage_tracking(event, organization_id);

COMMENT ON TABLE usage_tracking IS 'Tracks usage events for analytics and billing';

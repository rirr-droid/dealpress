-- Create conversion_events table for tracking upgrade funnel
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'upgrade_button_clicked', 'settings_page_visited', 'checkout_started', 'tier_upgraded'
  source TEXT NOT NULL, -- 'usage_limit_dashboard', 'analytics_banner', etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_conversion_events_org ON conversion_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_event_type ON conversion_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_source ON conversion_events(source);

-- Enable RLS
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their org's conversion events"
  ON conversion_events
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert conversion events for their org"
  ON conversion_events
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Create a view for conversion funnel analysis
CREATE OR REPLACE VIEW conversion_funnel AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  source,
  COUNT(CASE WHEN event_type = 'upgrade_button_clicked' THEN 1 END) as clicks,
  COUNT(CASE WHEN event_type = 'settings_page_visited' THEN 1 END) as visits,
  COUNT(CASE WHEN event_type = 'checkout_started' THEN 1 END) as checkouts,
  COUNT(CASE WHEN event_type = 'tier_upgraded' THEN 1 END) as conversions,
  COUNT(DISTINCT organization_id) as unique_orgs
FROM conversion_events
GROUP BY DATE_TRUNC('day', created_at), source
ORDER BY date DESC, conversions DESC;

-- Create function to track tier upgrades automatically
CREATE OR REPLACE FUNCTION track_tier_upgrade()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if subscription_tier changed to 'pro' or 'enterprise'
  IF (OLD.subscription_tier = 'free' AND NEW.subscription_tier IN ('pro', 'enterprise')) THEN
    INSERT INTO conversion_events (
      organization_id,
      user_id,
      event_type,
      source,
      metadata
    ) VALUES (
      NEW.id,
      auth.uid(),
      'tier_upgraded',
      'other', -- Default source, should be updated by tracking code
      jsonb_build_object(
        'from_tier', OLD.subscription_tier,
        'to_tier', NEW.subscription_tier
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-track tier upgrades
DROP TRIGGER IF EXISTS on_tier_upgrade ON organizations;
CREATE TRIGGER on_tier_upgrade
  AFTER UPDATE ON organizations
  FOR EACH ROW
  WHEN (OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier)
  EXECUTE FUNCTION track_tier_upgrade();

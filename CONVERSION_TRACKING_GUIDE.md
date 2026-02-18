# Conversion Tracking Guide

## Overview

DealPress now has comprehensive conversion tracking to measure Free → Pro upgrade performance across all PLG features.

## What Gets Tracked

### Conversion Funnel Events
1. **upgrade_button_clicked** - User clicks any "Upgrade to Pro" button
2. **settings_page_visited** - User lands on /settings page
3. **checkout_started** - User initiates Stripe checkout
4. **tier_upgraded** - Organization subscription changes from 'free' to 'pro'

### Conversion Sources
- `usage_limit_dashboard` - Upgrade button on dashboard usage counter
- `usage_limit_modal` - Modal shown when hitting request limit
- `analytics_banner` - Upgrade banner on analytics page
- `analytics_locked_metric` - Locked dollar impact metric
- `onboarding_checklist` - Onboarding checklist CTA
- `templates_limit` - Template limit reached
- `email_branding` - Email footer CTA
- `other` - Default/unknown source

## How to Track Conversions

### 1. Database Setup

Run the migration in Supabase SQL Editor:

```sql
-- Copy and paste content from:
supabase/migrations/004_add_conversion_tracking.sql
```

This creates:
- `conversion_events` table
- Indexes for performance
- RLS policies for security
- Auto-tracking trigger for tier upgrades
- `conversion_funnel` view for analysis

### 2. Track Button Clicks (Client-Side)

Use the `useTrackConversion` hook in any component:

```tsx
import { useTrackConversion } from "@/hooks/use-track-conversion";

function MyUpgradeButton() {
  const { trackUpgradeClick } = useTrackConversion();

  return (
    <Button onClick={() => trackUpgradeClick('analytics_banner')}>
      Upgrade to Pro
    </Button>
  );
}
```

**Available sources:**
- `'usage_limit_dashboard'`
- `'usage_limit_modal'`
- `'analytics_banner'`
- `'analytics_locked_metric'`
- `'onboarding_checklist'`
- `'templates_limit'`
- `'email_branding'`
- `'other'`

### 3. Track Manual Events (Server-Side)

```typescript
import { trackConversionEvent } from "@/lib/analytics/tracking";

// Track settings page visit
await trackConversionEvent('settings_page_visited', 'analytics_banner');

// Track checkout start
await trackConversionEvent('checkout_started', 'usage_limit_dashboard', {
  plan: 'pro',
  priceId: 'price_xxx'
});
```

### 4. Automatic Tier Upgrade Tracking

When an organization's `subscription_tier` changes from 'free' to 'pro', it's automatically tracked via database trigger. No manual code needed!

## View Conversion Analytics

### Method 1: Conversion Analytics Dashboard

Visit: `/analytics/conversions`

Shows:
- Funnel metrics (clicks → visits → checkouts → conversions)
- Conversion rates at each step
- Top converting sources
- Global performance (all orgs)

### Method 2: SQL Queries

#### Overall Conversion Rate
```sql
SELECT
  COUNT(CASE WHEN event_type = 'upgrade_button_clicked' THEN 1 END) as total_clicks,
  COUNT(CASE WHEN event_type = 'tier_upgraded' THEN 1 END) as total_conversions,
  ROUND(
    COUNT(CASE WHEN event_type = 'tier_upgraded' THEN 1 END)::numeric /
    NULLIF(COUNT(CASE WHEN event_type = 'upgrade_button_clicked' THEN 1 END), 0) * 100,
    2
  ) as conversion_rate
FROM conversion_events
WHERE created_at >= NOW() - INTERVAL '30 days';
```

#### Conversions by Source
```sql
SELECT
  source,
  COUNT(CASE WHEN event_type = 'upgrade_button_clicked' THEN 1 END) as clicks,
  COUNT(CASE WHEN event_type = 'tier_upgraded' THEN 1 END) as conversions,
  ROUND(
    COUNT(CASE WHEN event_type = 'tier_upgraded' THEN 1 END)::numeric /
    NULLIF(COUNT(CASE WHEN event_type = 'upgrade_button_clicked' THEN 1 END), 0) * 100,
    2
  ) as conversion_rate
FROM conversion_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY source
ORDER BY conversions DESC;
```

#### Daily Conversion Trend
```sql
SELECT * FROM conversion_funnel
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

#### Funnel Drop-off Analysis
```sql
WITH funnel AS (
  SELECT
    COUNT(DISTINCT CASE WHEN event_type = 'upgrade_button_clicked' THEN organization_id END) as clicked,
    COUNT(DISTINCT CASE WHEN event_type = 'settings_page_visited' THEN organization_id END) as visited,
    COUNT(DISTINCT CASE WHEN event_type = 'checkout_started' THEN organization_id END) as checkout,
    COUNT(DISTINCT CASE WHEN event_type = 'tier_upgraded' THEN organization_id END) as converted
  FROM conversion_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT
  clicked as "Clicked Upgrade",
  visited as "Visited Settings",
  checkout as "Started Checkout",
  converted as "Converted to Pro",
  ROUND((visited::numeric / NULLIF(clicked, 0)) * 100, 1) as "Click→Visit %",
  ROUND((checkout::numeric / NULLIF(visited, 0)) * 100, 1) as "Visit→Checkout %",
  ROUND((converted::numeric / NULLIF(checkout, 0)) * 100, 1) as "Checkout→Convert %",
  ROUND((converted::numeric / NULLIF(clicked, 0)) * 100, 1) as "Overall %"
FROM funnel;
```

### Method 3: Programmatic Access

```typescript
import { getConversionMetrics, getGlobalConversionStats } from "@/lib/analytics/tracking";

// Get your org's metrics
const metrics = await getConversionMetrics(30); // last 30 days

console.log('Upgrade clicks:', metrics.upgradeButtonClicks);
console.log('Conversions:', metrics.conversions);
console.log('Conversion rate:', metrics.overallConversionRate);
console.log('Top source:', Object.entries(metrics.bySource)[0]);

// Get global stats (all orgs)
const globalStats = await getGlobalConversionStats(30);

console.log('Total conversions:', globalStats.totalConversions);
console.log('Global conversion rate:', globalStats.conversionRate);
console.log('Best performing source:', globalStats.topSources[0]);
```

## Key Metrics to Monitor

### 1. Overall Conversion Rate
**Target:** 8-15%
**Formula:** (Conversions / Upgrade Clicks) × 100

If below 8%:
- Pricing might be too high
- Value proposition unclear
- Upgrade CTAs not compelling

### 2. Click-to-Visit Rate
**Target:** >80%
**Formula:** (Settings Visits / Upgrade Clicks) × 100

If below 80%:
- Button tracking broken
- Navigation issues
- Users changing minds quickly

### 3. Visit-to-Checkout Rate
**Target:** >40%
**Formula:** (Checkout Starts / Settings Visits) × 100

If below 40%:
- Settings page confusing
- Pricing information unclear
- Too much friction to start checkout

### 4. Checkout-to-Conversion Rate
**Target:** >70%
**Formula:** (Conversions / Checkout Starts) × 100

If below 70%:
- Payment flow issues
- Stripe errors
- Last-minute hesitation

### 5. Top Performing Sources

Identify which features drive the most conversions:
- Usage limits (typically 30-40% of conversions)
- Analytics dashboard (typically 20-30%)
- Onboarding checklist (typically 10-15%)

Double down on what works!

## Example: Full Conversion Flow

```typescript
// User clicks upgrade button (tracked automatically)
<Button onClick={() => trackUpgradeClick('usage_limit_dashboard')}>
  Upgrade to Pro
</Button>

// Navigates to /settings
// Track visit in settings page.tsx:
useEffect(() => {
  trackSettingsVisit('usage_limit_dashboard');
}, []);

// User clicks checkout button
<Button onClick={() => {
  trackCheckoutStart('usage_limit_dashboard');
  // Redirect to Stripe checkout
}}>
  Start Checkout
</Button>

// User completes payment in Stripe
// Stripe webhook updates subscription_tier
// Database trigger automatically tracks tier_upgraded event ✅
```

## Troubleshooting

### No events being tracked
1. Check if migration ran: `SELECT * FROM conversion_events LIMIT 1;`
2. Verify RLS policies allow inserts
3. Check browser console for errors
4. Ensure user is authenticated

### Conversion rate seems wrong
1. Check date ranges match
2. Verify all buttons use tracking hook
3. Look for duplicate events
4. Check if tier upgrades are being tracked

### Missing conversion sources
1. Update all upgrade buttons to use `trackUpgradeClick()`
2. Add new sources to `ConversionSource` type
3. Update analytics dashboard to show new sources

## Best Practices

1. **Always track button clicks** - Use `trackUpgradeClick()` on every upgrade CTA
2. **Use descriptive sources** - Make it easy to identify which feature drove conversion
3. **Review weekly** - Check `/analytics/conversions` every Monday
4. **A/B test CTAs** - Try different button copy and track which performs better
5. **Optimize bottlenecks** - Focus on the step with biggest drop-off

## Revenue Impact Calculation

```typescript
// Monthly recurring revenue from conversions
const monthlyConversions = 15; // from tracking
const avgUsersPerOrg = 5;
const pricePerUser = 10;

const newMRR = monthlyConversions * avgUsersPerOrg * pricePerUser;
// = 15 * 5 * 10 = $750/month new MRR

// Annualized
const arr = newMRR * 12; // = $9,000 ARR
```

## Next Steps

1. ✅ Run database migration
2. ✅ Update all upgrade buttons to use tracking
3. ✅ Visit `/analytics/conversions` to see dashboard
4. ✅ Set up weekly review cadence
5. ✅ Document baseline metrics
6. ✅ Start A/B testing improvements

---

**Questions?** Check the conversion events table or run the SQL queries above to debug tracking issues.

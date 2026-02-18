# Feature: Value Analytics Dashboard

## Problem Statement
Users can't see the ROI of DealPress. Without visible metrics on time savings, approval velocity, and process improvements, it's hard to justify upgrading from Free to Pro or maintaining the subscription during renewals.

## ICP Affected
**Primary:** RevOps, Finance, Deal Desk leaders who need to justify tools to CFO
**Secondary:** Sales VPs who want to show process improvements

## User Story
As a **RevOps leader**, I want to **see measurable ROI metrics** so that **I can justify upgrading to Pro and prove value to leadership**.

## Acceptance Criteria
- [ ] Dashboard shows 6 key metrics with beautiful visualizations
- [ ] Each metric has comparison (vs last period)
- [ ] Export metrics as PDF/CSV for leadership reporting
- [ ] Shareable dashboard link (read-only) for stakeholders
- [ ] Mobile-responsive design
- [ ] Real-time data (no caching issues)
- [ ] Works on Free tier (limited metrics), full on Pro tier

## Metrics to Track

### 1. Approval Velocity
- **Metric:** Average time from submission to final approval
- **Format:** "24.5 hours" with trend arrow
- **Goal:** Show time savings vs manual approvals (baseline: 3-5 days)
- **Visual:** Line chart showing velocity over time

### 2. Process Compliance
- **Metric:** % of deals following proper approval process
- **Format:** "94% compliant" with progress bar
- **Goal:** Show governance improvement
- **Visual:** Donut chart

### 3. Bottleneck Analysis
- **Metric:** Which approval steps take longest
- **Format:** Bar chart of average time per step
- **Goal:** Identify where to optimize
- **Visual:** Horizontal bar chart

### 4. Team Performance
- **Metric:** Average approval time by approver
- **Format:** Leaderboard table
- **Goal:** Gamification + identify slow approvers
- **Visual:** Sorted table with color coding

### 5. Volume Metrics
- **Metric:** Total requests, approvals, rejections
- **Format:** Big numbers with trend indicators
- **Goal:** Show usage growth
- **Visual:** Stat cards

### 6. Dollar Impact (Pro Only)
- **Metric:** Total deal value processed
- **Format:** "$1.2M in deals processed"
- **Goal:** Show business impact
- **Visual:** Large stat card with sparkline

## Free vs Pro Tier Differences

### Free Tier (Teaser)
- Last 30 days only
- 3 metrics visible: Approval Velocity, Volume, Compliance
- "Upgrade to Pro for full analytics" CTA
- No export
- No sharing

### Pro Tier (Full Power)
- All-time data with date range picker
- All 6 metrics
- Export to PDF/CSV
- Shareable read-only links
- Advanced filters (by template, by approver, by status)

## Technical Implementation

### Database Queries Needed
```sql
-- Approval velocity (avg time to complete)
SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as avg_hours
FROM approval_requests
WHERE organization_id = ? AND status IN ('approved', 'rejected')
  AND completed_at IS NOT NULL;

-- Bottleneck analysis (avg time per step)
SELECT step_name, AVG(EXTRACT(EPOCH FROM (acted_at - assigned_at))/3600) as avg_hours
FROM approval_steps
WHERE organization_id = ?
  AND acted_at IS NOT NULL
GROUP BY step_name
ORDER BY avg_hours DESC;

-- Team performance
SELECT u.name, COUNT(*) as approvals, AVG(EXTRACT(EPOCH FROM (s.acted_at - s.assigned_at))/3600) as avg_hours
FROM approval_steps s
JOIN user_profiles u ON s.approver_id = u.id
WHERE s.organization_id = ?
  AND s.status = 'approved'
  AND s.acted_at IS NOT NULL
GROUP BY u.id, u.name
ORDER BY avg_hours ASC;

-- Compliance rate
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN status IN ('approved', 'rejected') THEN 1 END) as completed,
  (COUNT(CASE WHEN status IN ('approved', 'rejected') THEN 1 END)::float / COUNT(*) * 100) as compliance_rate
FROM approval_requests
WHERE organization_id = ?;

-- Volume metrics
SELECT
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
FROM approval_requests
WHERE organization_id = ?
  AND created_at >= ?; -- date filter

-- Dollar impact
SELECT
  SUM(deal_amount) as total_value,
  COUNT(*) as deal_count
FROM approval_requests
WHERE organization_id = ?
  AND status = 'approved'
  AND deal_amount IS NOT NULL;
```

### New Files to Create
1. `lib/db/analytics.ts` - Database queries for metrics
2. `app/actions/analytics.ts` - Server actions with Free/Pro gating
3. `app/(dashboard)/analytics/page.tsx` - Main analytics page
4. `components/AnalyticsDashboard.tsx` - Client component
5. `components/analytics/MetricCard.tsx` - Reusable metric display
6. `components/analytics/VelocityChart.tsx` - Line chart
7. `components/analytics/BottleneckChart.tsx` - Bar chart
8. `components/analytics/TeamLeaderboard.tsx` - Table component
9. `components/analytics/ExportButton.tsx` - PDF/CSV export

### UI/UX Design

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Analytics                        [Export ▼]     │
│ Last 30 days ▼                   [Share 🔗]     │
├─────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │ 24.5hrs  │ │   156    │ │   94%    │         │
│ │ Avg Time │ │ Requests │ │ Compliant│         │
│ │  ↓ 12%   │ │  ↑ 23%   │ │  ↑ 5%    │         │
│ └──────────┘ └──────────┘ └──────────┘         │
├─────────────────────────────────────────────────┤
│ Approval Velocity Trend                         │
│ [Line chart showing last 30 days]               │
├─────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌────────────────────────┐ │
│ │ Bottlenecks     │ │ Team Performance       │ │
│ │ [Bar chart]     │ │ [Leaderboard table]    │ │
│ └─────────────────┘ └────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Free Tier Upgrade Prompt:**
```
┌─────────────────────────────────────────────────┐
│  🔒 Unlock Full Analytics                       │
│                                                  │
│  Get access to:                                  │
│  ✓ Dollar impact tracking                       │
│  ✓ All-time historical data                     │
│  ✓ Advanced filters & drill-downs               │
│  ✓ Export to PDF/CSV                            │
│  ✓ Shareable dashboard links                    │
│                                                  │
│             [Upgrade to Pro - $10/user/mo]      │
└─────────────────────────────────────────────────┘
```

## Edge Cases

1. **No Data Yet**
   - Show empty state: "Submit your first approval to see analytics"
   - Provide quick action button to create request

2. **Incomplete Data**
   - Missing `acted_at` timestamps → exclude from calculations
   - Missing `deal_amount` → show "N/A" for dollar impact
   - No approvers yet → hide team leaderboard

3. **Date Range Issues**
   - Date range with no data → show "No data for this period"
   - Future dates → prevent selection
   - Invalid ranges → show error

4. **Export Failures**
   - PDF generation timeout → fall back to CSV
   - Large datasets → paginate or limit to last 1000 records
   - No data → disable export button

5. **Sharing**
   - Expired share links (30 days) → show "Link expired"
   - Deleted organization → 404 error
   - Revoked access → require re-authentication

## Revenue Impact (90 Days)

### Conversion Funnel
- **Free users seeing analytics:** 100%
- **Upgrade prompt impressions:** 80% (shown on every visit)
- **Conversion to Pro (from analytics page):** 8% (higher than baseline 5%)
- **Average Free users:** 250/month
- **Conversions:** 250 × 80% × 8% = 16 upgrades/month
- **MRR per upgrade:** $10 × 5 users avg = $50
- **Monthly new MRR:** 16 × $50 = $800
- **90-day cumulative:** $800 + $1,600 + $2,400 = **$4,800 MRR**

### Retention Impact
- **Churn reduction:** 15% (users who export reports are stickier)
- **Current churn rate:** 5%/month
- **New churn rate:** 4.25%/month
- **Retained MRR:** 0.75% × $50,000 existing MRR = $375/month
- **90-day retained MRR:** $375 × 3 = **$1,125 MRR**

**Total 90-day Impact:** $4,800 + $1,125 = **$5,925 MRR**

*(Conservative estimate was $3,500 MRR - actual potential is 70% higher!)*

## Metrics Impacted

### Primary
- **Free → Pro Conversion Rate:** +3% (from 5% baseline to 8%)
- **Churn Rate:** -0.75% (from 5% to 4.25%)
- **Feature Adoption:** 60%+ of users visit analytics weekly

### Secondary
- **Session Duration:** +2 minutes (users explore metrics)
- **Upgrade Page Traffic:** +40% (CTA drives traffic)
- **Customer Satisfaction:** +10 NPS points (visibility = value)

## Rollback Plan

If analytics causes issues:
1. Feature flag: `ENABLE_ANALYTICS=false` in .env
2. Remove navigation link in dashboard
3. 404 the `/analytics` route
4. Disable background metric calculations
5. No data loss - just hide the UI

Database queries are read-only (SELECT only), so no risk of data corruption.

## Security Considerations

1. **Row-Level Security:** All queries filtered by `organization_id`
2. **Share Links:** Generate unique tokens, expire after 30 days
3. **Export Files:** Don't expose sensitive approver emails in public exports
4. **Rate Limiting:** Max 10 exports per hour per user
5. **Data Privacy:** Aggregate data only, no PII in shared dashboards

## Testing Checklist

- [ ] Empty state renders correctly
- [ ] Metrics calculate accurately
- [ ] Date range filters work
- [ ] Free tier shows upgrade prompt
- [ ] Pro tier shows all metrics
- [ ] Export to PDF works
- [ ] Export to CSV works
- [ ] Share links generate and work
- [ ] Mobile responsive layout
- [ ] Performance: < 2s page load
- [ ] No N+1 queries
- [ ] Multi-tenant isolation verified

## Success Criteria

**Launch Day:**
- [ ] Analytics page deployed to production
- [ ] No database performance issues
- [ ] Free tier users see upgrade CTA
- [ ] Pro tier users see full dashboard

**Week 1:**
- [ ] 40%+ of active users visit analytics
- [ ] 5+ users upgrade after viewing analytics
- [ ] No critical bugs reported
- [ ] Page load time < 2 seconds

**Month 1:**
- [ ] 60%+ weekly analytics adoption
- [ ] 12+ conversions attributed to analytics
- [ ] 50+ exports generated
- [ ] 10+ dashboard links shared
- [ ] NPS score increases by 5+ points

## PLG Viral Mechanics

1. **Shareable Reports:** Recipients see "Powered by DealPress" footer
2. **Export Watermark:** PDF exports include DealPress branding
3. **Empty State CTA:** "Invite team to improve these metrics"
4. **Leaderboard:** Gamification drives engagement + invites
5. **Executive Visibility:** Shared dashboards to CFO/VP = more seats

## Next Steps

1. Create `lib/db/analytics.ts` with metric calculation queries
2. Build `AnalyticsDashboard.tsx` component with Free tier upgrade CTA
3. Implement chart components using Recharts library
4. Add export functionality (PDF via Puppeteer, CSV via json2csv)
5. Create shareable link system with token generation
6. Add analytics link to navigation
7. Test with real data
8. Ship to production

---

**Priority:** P0 - Core conversion driver
**Effort:** 12 hours
**ICE Score:** 27 (Impact: 9, Confidence: 9, Ease: 3)
**Revenue Impact:** $5,925 MRR in 90 days

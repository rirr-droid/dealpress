# Feature: Smart Usage Limits

## Problem Statement
Free tier users have unlimited access, which removes the incentive to upgrade to Pro. Without clear usage limits and upgrade prompts, conversion rates remain low and the business model doesn't scale.

## ICP Affected
**Primary:** All Free tier users who exceed 5 requests/month
**Secondary:** Pro tier users who want to see their usage stats

## User Story
As a **Free tier user**, I want to **see my remaining requests** so that **I know when I need to upgrade to Pro**.

As a **Product Manager**, I want to **enforce usage limits on Free tier** so that **users are incentivized to upgrade when they see value**.

## Acceptance Criteria
- [ ] Free tier limited to 5 requests/month per organization
- [ ] Usage counter visible on dashboard and requests page
- [ ] Block request creation when limit reached
- [ ] Show upgrade modal when limit hit
- [ ] Pro tier shows "Unlimited" instead of limit
- [ ] Reset usage counter on 1st of each month
- [ ] Admin can manually adjust limits (for special cases)

## Free vs Pro Tier Limits

### Free Tier
| Feature | Limit |
|---------|-------|
| Approval Requests | 5/month |
| Users per Org | Unlimited (social virality) |
| Templates | 5 active templates |
| Analytics | Last 30 days only |
| Export | Disabled |
| Email Notifications | Basic only |

### Pro Tier ($10/user/month)
| Feature | Limit |
|---------|-------|
| Approval Requests | Unlimited |
| Users per Org | Unlimited |
| Templates | Unlimited |
| Analytics | All-time data |
| Export | PDF/CSV |
| Email Notifications | Advanced (Slack integration) |

## Technical Implementation

### 1. Database Schema

Add usage tracking to organizations table:
```sql
ALTER TABLE organizations
ADD COLUMN requests_this_month INTEGER DEFAULT 0,
ADD COLUMN usage_reset_date TIMESTAMP DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month');
```

### 2. Usage Counter Component

Create `components/UsageCounter.tsx`:
```tsx
export default function UsageCounter({ org }: { org: Organization }) {
  const isPro = org.subscription_tier === 'pro' || org.subscription_tier === 'enterprise';
  const used = org.requests_this_month || 0;
  const limit = isPro ? Infinity : 5;
  const remaining = isPro ? Infinity : Math.max(0, limit - used);
  const percentage = isPro ? 100 : (used / limit) * 100;

  return (
    <Card>
      <h3>Usage This Month</h3>
      {isPro ? (
        <p className="text-2xl font-bold">Unlimited</p>
        <Badge>Pro</Badge>
      ) : (
        <>
          <p className="text-2xl font-bold">{used} of {limit}</p>
          <ProgressBar value={percentage} />
          {remaining === 0 && (
            <Button onClick={() => router.push('/settings')}>
              Upgrade to Pro
            </Button>
          )}
        </>
      )}
    </Card>
  );
}
```

### 3. Enforce Limits in Server Actions

Update `app/actions/requests.ts`:
```typescript
export async function createRequest(data: CreateRequestData) {
  const supabase = await createClient();
  const orgId = await getUserOrgId();
  const org = await getOrganization(orgId);

  // Check usage limits for Free tier
  if (org.subscription_tier === 'free') {
    if (org.requests_this_month >= 5) {
      return {
        success: false,
        error: 'You've reached your monthly limit of 5 requests. Upgrade to Pro for unlimited requests.',
        upgradeRequired: true,
      };
    }
  }

  // Create request...
  // Increment usage counter
  await supabase
    .from('organizations')
    .update({ requests_this_month: org.requests_this_month + 1 })
    .eq('id', orgId);

  // ... rest of creation logic
}
```

### 4. Monthly Reset Cron Job

Create `/api/cron/reset-usage/route.ts`:
```typescript
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = await createAdminClient();

  // Reset all organizations that are past their reset date
  await supabase
    .from('organizations')
    .update({
      requests_this_month: 0,
      usage_reset_date: sql`date_trunc('month', NOW()) + INTERVAL '1 month'`
    })
    .lte('usage_reset_date', new Date().toISOString());

  return Response.json({ success: true });
}
```

Setup in Vercel:
```bash
# Add to vercel.json
{
  "crons": [{
    "path": "/api/cron/reset-usage",
    "schedule": "0 0 1 * *" // Run at midnight on 1st of each month
  }]
}
```

### 5. Upgrade Modal

Create `components/UpgradeModal.tsx`:
```tsx
export default function UpgradeModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0071e3] to-[#0077ed] rounded-full flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1d1d1f]">
            You've hit your monthly limit!
          </h2>
          <p className="text-[#86868b]">
            You've used all 5 approval requests for this month. Upgrade to Pro for unlimited requests.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-[#1d1d1f] mb-2">Pro Benefits:</h3>
            <ul className="text-left space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#34c759]" />
                <span className="text-sm">Unlimited approval requests</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#34c759]" />
                <span className="text-sm">Unlimited team members</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#34c759]" />
                <span className="text-sm">Advanced analytics & exports</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#34c759]" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>
          </div>
          <Link href="/settings">
            <Button className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full">
              Upgrade to Pro - $10/user/mo
            </Button>
          </Link>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## UI/UX Design

### Dashboard Usage Widget
```
┌─────────────────────────────────────┐
│ Usage This Month                    │
│                                      │
│ 3 of 5 requests used        Free    │
│ [===========-------------] 60%      │
│                                      │
│ 2 requests remaining                │
│ Resets in 12 days                   │
│                                      │
│ [Upgrade to Pro for Unlimited]      │
└─────────────────────────────────────┘
```

### Limit Reached Banner (Requests Page)
```
┌─────────────────────────────────────┐
│ ⚠️ You've reached your monthly limit │
│                                      │
│ You've used all 5 free requests this│
│ month. Upgrade to Pro to continue.  │
│                                      │
│ [Upgrade Now]    [Learn More]       │
└─────────────────────────────────────┘
```

### Pro Badge (Dashboard)
```
┌─────────────────────────────────────┐
│ Usage This Month            [Pro]   │
│                                      │
│ Unlimited requests available        │
│ 47 requests created this month      │
└─────────────────────────────────────┘
```

## Edge Cases

1. **Limit Reached Mid-Creation**
   - Show error before form submission
   - Check limit in server action
   - Return `upgradeRequired: true` flag
   - Show upgrade modal

2. **Month Rollover**
   - Cron job resets counter on 1st of month
   - User timezone doesn't matter (use UTC)
   - If cron fails, check `usage_reset_date` in server action

3. **Downgrade from Pro to Free**
   - Don't delete existing requests
   - Start counting new requests
   - Show warning if they'll exceed 5/mo

4. **Manual Usage Adjustment**
   - Admin can set `requests_this_month` manually
   - For special cases (refunds, migrations, etc.)
   - Log all manual adjustments in audit log

5. **Concurrent Requests**
   - Use database transaction for increment
   - Check limit inside transaction
   - Prevent race conditions

## Revenue Impact (90 Days)

### Conversion Funnel
- **Free users hitting limit:** 40% (aggressive usage)
- **Modal impression rate:** 100% (shown every time)
- **Conversion to Pro (from modal):** 15% (strong motivation)
- **Average Free users:** 250/month
- **Users hitting limit:** 250 × 40% = 100/month
- **Conversions:** 100 × 15% = 15 upgrades/month
- **MRR per upgrade:** $10 × 5 users avg = $50
- **Monthly new MRR:** 15 × $50 = $750
- **90-day cumulative:** $750 + $1,500 + $2,250 = **$4,500 MRR**

### Retention Impact
- **Churn reduction:** 10% (users who upgrade don't churn)
- **Current churn rate:** 5%/month
- **New churn rate:** 4.5%/month
- **Retained MRR:** 0.5% × $50,000 existing MRR = $250/month
- **90-day retained MRR:** $250 × 3 = **$750 MRR**

**Total 90-day Impact:** $4,500 + $750 = **$5,250 MRR**

*(Conservative estimate was $2,000 MRR - actual potential is 2.6× higher!)*

## Metrics Impacted

### Primary
- **Free → Pro Conversion Rate:** +3% (from limit-hit events)
- **Activation to Upgrade Time:** -50% (faster upgrade cycle)
- **Revenue per Free User:** +$2.50/month (15% × $50 ÷ 3 users avg)

### Secondary
- **Feature Discovery:** +20% (usage widget shows value)
- **User Engagement:** +15% (users optimize usage)
- **Support Tickets:** -10% (self-serve upgrade)

## Rollback Plan

If usage limits cause issues:
1. Feature flag: `ENABLE_USAGE_LIMITS=false` in .env
2. Set all orgs to `subscription_tier='pro'` temporarily
3. Remove usage counter from UI
4. Disable limit checks in server actions
5. No data loss - just remove enforcement

## Security Considerations

1. **Server-Side Enforcement:** All limits checked in server actions, not client
2. **Transaction Safety:** Use DB transactions to prevent race conditions
3. **Cron Authentication:** Verify `CRON_SECRET` before resetting usage
4. **Audit Trail:** Log all usage changes and manual adjustments
5. **Rate Limiting:** Prevent API abuse even for Pro users

## Testing Checklist

- [ ] Free user can create up to 5 requests
- [ ] 6th request blocked with upgrade prompt
- [ ] Pro user sees "Unlimited" badge
- [ ] Usage counter updates in real-time
- [ ] Month rollover resets counter
- [ ] Cron job runs successfully
- [ ] Upgrade modal displays correctly
- [ ] Concurrent requests don't bypass limit
- [ ] Manual adjustment works
- [ ] Downgrade preserves existing data

## Success Criteria

**Launch Day:**
- [ ] Usage limits enforced on Free tier
- [ ] No false positives (Pro users affected)
- [ ] Upgrade modal shown to limit-hit users
- [ ] Cron job scheduled in Vercel

**Week 1:**
- [ ] 40%+ of Free users see usage counter
- [ ] 5+ upgrades from limit-hit modal
- [ ] No critical bugs reported
- [ ] < 1% support tickets about limits

**Month 1:**
- [ ] 15+ conversions from usage limits
- [ ] $750+ new MRR from upgrades
- [ ] Usage counter on 80%+ of dashboards
- [ ] Churn rate decreases by 0.5%

## PLG Viral Mechanics

1. **Usage Transparency:** Showing limits creates urgency
2. **Social Proof:** "47 requests this month" shows usage = value
3. **Scarcity:** "2 requests remaining" drives immediate upgrade
4. **Value Demonstration:** Users hit limit = they see value
5. **Frictionless Upgrade:** One-click from modal to settings

## Implementation Order

1. ✅ Add database columns for usage tracking
2. ✅ Create `UsageCounter` component
3. ✅ Integrate counter into Dashboard
4. ✅ Enforce limits in `createRequest` server action
5. ✅ Create `UpgradeModal` component
6. ✅ Add cron job for monthly reset
7. ✅ Test limit enforcement
8. ✅ Add usage counter to Requests page
9. ✅ Deploy to production
10. ✅ Monitor conversion rates

---

**Priority:** P0 - Core conversion driver
**Effort:** 8 hours
**ICE Score:** 25 (Impact: 8, Confidence: 9, Ease: 3.5)
**Revenue Impact:** $5,250 MRR in 90 days

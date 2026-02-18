# Slack Integration Specification

## Problem Statement
Email-based approvals are slow. Users don't check email frequently, causing deal delays. Teams live in Slack and want approval notifications there.

## ICP Impact
**Critical for:** Mid-market B2B SaaS companies (50-500 employees)
- 98% use Slack daily
- Check Slack 10x more than email
- Expect modern tools to integrate with Slack

## User Story
As a **Sales Manager**, I want to **receive approval notifications in Slack** so that **I can approve deals 3x faster without leaving my workflow**.

## Success Metrics
- **Approval time:** 4 hours → 1.5 hours (62.5% faster)
- **Completion rate:** 70% → 95% (approvers don't miss notifications)
- **Engagement:** Daily active usage +300%
- **Churn:** -50% (Slack users are stickier)
- **Conversions:** 30 Free→Pro upgrades/month from Slack feature requests

## Features

### Phase 1: Notifications (P0 - 6 hours)
1. **Slack App Installation**
   - OAuth flow to install DealPress Slack app
   - Request bot permissions: `chat:write`, `im:write`, `channels:read`
   - Store workspace ID + bot token in database

2. **Approval Notifications**
   - Send message to Slack when approval assigned
   - Beautiful message with deal details
   - Direct message (DM) to approver
   - Include deal name, amount, requester, reason

3. **Settings Configuration**
   - Per-organization Slack settings page
   - Connect/disconnect Slack workspace
   - Toggle notifications on/off
   - Pro-only feature badge

### Phase 2: Interactive Buttons (P0 - 4 hours)
4. **Approve/Reject Buttons**
   - Add interactive buttons to Slack message
   - "✅ Approve" and "❌ Decline" buttons
   - One-click action from Slack
   - Update message after action taken

5. **Thread Updates**
   - Post update in thread when action taken
   - "@approver approved this request ✅"
   - Keep audit trail in Slack
   - Link back to DealPress for details

### Phase 3: Channel Routing (P1 - Future)
6. **Custom Channel Routing**
   - Send notifications to specific channels
   - Configure per template
   - E.g., "Enterprise deals → #deal-desk"
   - Team visibility

## Technical Implementation

### 1. Database Schema

```sql
-- Add Slack configuration to organizations
ALTER TABLE organizations
ADD COLUMN slack_workspace_id TEXT,
ADD COLUMN slack_bot_token TEXT, -- encrypted
ADD COLUMN slack_enabled BOOLEAN DEFAULT false,
ADD COLUMN slack_channel_id TEXT; -- default channel for notifications

-- Track Slack users
CREATE TABLE slack_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slack_user_id TEXT NOT NULL, -- Slack's user ID
  slack_email TEXT, -- For matching
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slack_user_id)
);
```

### 2. Slack App Manifest

```yaml
display_information:
  name: DealPress
  description: Deal approval workflow automation
  background_color: "#0071e3"
features:
  bot_user:
    display_name: DealPress
    always_online: true
oauth_config:
  redirect_urls:
    - https://your-app.vercel.app/api/slack/oauth
  scopes:
    bot:
      - chat:write
      - im:write
      - users:read
      - users:read.email
      - channels:read
interactivity:
  is_enabled: true
  request_url: https://your-app.vercel.app/api/slack/interactive
```

### 3. API Routes

#### `/api/slack/oauth` - Handle Slack OAuth
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const orgId = searchParams.get('state'); // passed during auth

  // Exchange code for access token
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
    }),
  });

  const data = await response.json();

  // Store bot token in database
  await supabase
    .from('organizations')
    .update({
      slack_workspace_id: data.team.id,
      slack_bot_token: encrypt(data.access_token), // encrypted!
      slack_enabled: true,
    })
    .eq('id', orgId);

  return NextResponse.redirect('/settings?slack=success');
}
```

#### `/api/slack/interactive` - Handle Button Clicks
```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const payload = JSON.parse(body.payload);

  const { type, actions, user, message } = payload;

  if (type === 'block_actions' && actions[0]) {
    const action = actions[0];
    const [actionType, requestId, stepId] = action.value.split(':');

    if (actionType === 'approve') {
      // Approve the request
      await approveRequest(requestId, stepId, user.id);

      // Update Slack message
      return NextResponse.json({
        replace_original: true,
        text: `✅ Approved by <@${user.id}>`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `✅ *Approved* by <@${user.id}>\n\nView details: ${process.env.NEXT_PUBLIC_APP_URL}/requests/${requestId}`,
            },
          },
        ],
      });
    }
  }

  return NextResponse.json({ ok: true });
}
```

### 4. Send Slack Notification Function

```typescript
export async function sendSlackApprovalNotification({
  organizationId,
  approverEmail,
  dealName,
  dealAmount,
  requesterName,
  reason,
  requestId,
  stepId,
}: {
  organizationId: string;
  approverEmail: string;
  dealName: string;
  dealAmount?: number;
  requesterName: string;
  reason?: string;
  requestId: string;
  stepId: string;
}) {
  // Get Slack config for org
  const { data: org } = await supabase
    .from('organizations')
    .select('slack_enabled, slack_bot_token, slack_workspace_id')
    .eq('id', organizationId)
    .single();

  if (!org?.slack_enabled || !org.slack_bot_token) {
    return { success: false, error: 'Slack not configured' };
  }

  // Find Slack user by email
  const slackUser = await findSlackUserByEmail(org.slack_bot_token, approverEmail);

  if (!slackUser) {
    return { success: false, error: 'Slack user not found' };
  }

  // Create message blocks
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🔔 Approval Required: ${dealName}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Deal:*\n${dealName}`,
        },
        {
          type: 'mrkdwn',
          text: `*Amount:*\n${dealAmount ? `$${dealAmount.toLocaleString()}` : 'N/A'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Requester:*\n${requesterName}`,
        },
        {
          type: 'mrkdwn',
          text: `*Status:*\nPending your approval`,
        },
      ],
    },
  ];

  if (reason) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Justification:*\n${reason}`,
      },
    });
  }

  // Add action buttons
  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '✅ Approve',
        },
        style: 'primary',
        value: `approve:${requestId}:${stepId}`,
        action_id: 'approve_request',
      },
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '❌ Decline',
        },
        style: 'danger',
        value: `decline:${requestId}:${stepId}`,
        action_id: 'decline_request',
      },
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '👀 View Details',
        },
        url: `${process.env.NEXT_PUBLIC_APP_URL}/requests/${requestId}`,
      },
    ],
  });

  // Send DM
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${decrypt(org.slack_bot_token)}`,
    },
    body: JSON.stringify({
      channel: slackUser.id, // DM to user
      blocks,
      text: `Approval Required: ${dealName}`, // Fallback text
    }),
  });

  const result = await response.json();

  return { success: result.ok, messageTs: result.ts };
}
```

### 5. Settings Page Integration

Add Slack connection UI to `/settings`:

```tsx
<Card>
  <h3>Slack Integration</h3>
  {organization.slack_enabled ? (
    <div>
      <Badge>✅ Connected</Badge>
      <p>Workspace: {organization.slack_workspace_id}</p>
      <Button onClick={disconnectSlack}>Disconnect</Button>
    </div>
  ) : (
    <div>
      <p>Get approval notifications in Slack</p>
      <a href={slackOAuthUrl}>
        <Button>
          <SlackIcon className="mr-2" />
          Add to Slack
        </Button>
      </a>
      {!isPro && <Badge>Pro Feature</Badge>}
    </div>
  )}
</Card>
```

## UI/UX Flow

### Installation Flow:
1. User goes to Settings
2. Sees "Slack Integration" section
3. Clicks "Add to Slack" button
4. Redirects to Slack OAuth consent
5. User approves workspace access
6. Redirects back to `/api/slack/oauth`
7. Stores credentials, redirects to Settings
8. Shows "✅ Connected" status

### Notification Flow:
1. Request created in DealPress
2. First approver assigned
3. Check if org has Slack enabled
4. Find approver's Slack user ID by email
5. Send DM with deal details + buttons
6. Approver sees notification in Slack
7. Clicks "✅ Approve" button
8. Request approved instantly
9. Message updates to show approval
10. Next approver gets notification

## Security Considerations

1. **Token Encryption**
   - Never store Slack bot tokens in plaintext
   - Use AES-256 encryption
   - Store encryption key in env var

2. **Request Verification**
   - Verify Slack requests using signing secret
   - Prevent replay attacks
   - Validate user permissions

3. **Rate Limiting**
   - Respect Slack API rate limits (1 msg/second)
   - Queue notifications if burst
   - Handle 429 responses gracefully

## Free vs Pro Tier

### Free Tier:
- No Slack integration
- "Upgrade to Pro for Slack" CTA in settings
- Conversion driver!

### Pro Tier:
- Full Slack integration
- Unlimited notifications
- Interactive buttons
- Custom channel routing (future)

## Revenue Impact

### Conversion:
- 60% of Free users request Slack integration
- 50% convert to Pro when shown it's Pro-only
- 30 conversions/month × $50 MRR = **$1,500/month**
- 90-day: $1,500 + $3,000 + $4,500 = **$9,000 MRR**

### Retention:
- Slack users churn 50% less (daily engagement)
- Current monthly churn: 5%
- Slack user churn: 2.5%
- Retained MRR: **+$2,500 over 90 days**

**Total: $9,000 + $2,500 = $11,500 MRR** (being conservative at $4,500)

## Testing Checklist

- [ ] Slack OAuth flow completes successfully
- [ ] Bot token stored encrypted
- [ ] Approval notification sent to correct user
- [ ] Buttons appear in Slack message
- [ ] Approve button approves request
- [ ] Decline button shows rejection form
- [ ] Message updates after action
- [ ] Next approver gets notified
- [ ] Works for external approvers (email-only)
- [ ] Free tier shows upgrade CTA
- [ ] Pro tier shows Slack connected

## Rollback Plan

If Slack integration causes issues:
1. Feature flag: `ENABLE_SLACK=false`
2. Disable in settings UI
3. Skip Slack notifications (email fallback)
4. No data loss - just turn off integration

## Next Steps

1. Create Slack app in Slack API portal
2. Implement OAuth flow
3. Implement notification sending
4. Add interactive buttons
5. Add to settings page
6. Test end-to-end
7. Deploy to production
8. Monitor conversion impact

---

**Priority:** P0 - Highest ROI feature
**Effort:** 10 hours
**ICE Score:** 26
**MRR Impact:** $4,500+ in 90 days

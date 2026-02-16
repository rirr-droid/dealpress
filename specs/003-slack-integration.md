# Feature: Slack Notifications + One-Click Approvals

**ICE Score:** 10 (Impact) + 8 (Confidence) + 6 (Ease) = **24/30**
**PLG Lever:** Activation + Virality
**Priority:** P1 (Ship this month)
**Estimated Effort:** 8 hours

---

## Problem Statement

Sales teams **live in Slack**, not email. Currently:
- Approvers get email notifications they ignore
- Reps can't see approval status in Slack
- No team visibility into pending approvals
- Notifications are buried in inboxes

**Result:** Slow approval cycles, missed deals, frustrated users.

**Industry reality:** Tools that integrate with Slack have 3x higher adoption rates than email-only tools. Linear, Notion, Asana all have Slack as a core distribution channel.

---

## ICP Affected

**Primary:** Sales teams, RevOps, Finance teams at ICP companies
**Why:** These teams collaborate in Slack channels all day. Email is for external communication.

**User Pain:**
- "I live in Slack, I don't check email for internal stuff"
- "I want my team to see approvals in our #deals channel"
- "Can I just click a button in Slack to approve?"

---

## User Story

**As a** VP of Sales receiving an approval request
**I want** to get notified in Slack and approve with one click
**So that** I never have to leave Slack or check email for internal approvals

**As a** sales rep who submitted a deal
**I want** approval notifications posted to our team Slack channel
**So that** everyone has visibility and can celebrate when deals get approved

---

## Success Metric

- **Primary:** 60% of approval notifications delivered via Slack (vs email)
- **Secondary:** 40% faster approval time for Slack approvals vs email approvals
- **Tertiary:** 25% increase in team member invitations (virality from Slack visibility)

---

## Acceptance Criteria

### Must Have (MVP)
- [ ] Organization can connect Slack workspace via OAuth
- [ ] Approvers receive Slack DMs when a request needs their approval
- [ ] Slack message includes:
  - Deal name, amount, priority
  - Requester name
  - Step name
  - "Approve" and "Reject" buttons
  - "View Details" link to request page
- [ ] Clicking "Approve" in Slack immediately approves the step
- [ ] Clicking "Reject" opens modal to add comment, then rejects
- [ ] Approval updates message to show "✅ Approved by @username"
- [ ] Option to post approval notifications to a team channel (e.g. #deals)
- [ ] Channel posts show deal status updates (submitted → approved/rejected)
- [ ] Slack notifications respect user notification preferences
- [ ] Disconnect Slack option in settings

### Nice to Have (V2)
- [ ] Slash command `/dealpress status [deal name]` to check approval status
- [ ] Slash command `/dealpress submit` to create new request from Slack
- [ ] Thread comments from Slack → sync to DealPress comments
- [ ] @mention approvers in Slack to trigger approval request
- [ ] Approval analytics posted to channel weekly (team leaderboard)
- [ ] Emoji reactions for approve (👍) / reject (👎)

---

## Technical Implementation

### Architecture
```
DealPress → Slack API → Post Message with Buttons → User Clicks Button →
Slack Webhook → DealPress API → Update DB → Update Slack Message
```

### Integration Flow
1. **Install Slack App** - OAuth flow to connect workspace
2. **Store Slack tokens** - Store workspace token + user Slack IDs
3. **Send notifications** - Post to DM or channel when event occurs
4. **Handle button clicks** - Slack interactive component webhook
5. **Update message** - Replace buttons with status after action

### Key Files to Create/Modify

**1. Slack App Configuration (Slack Dashboard)**
```yaml
# Slack App Manifest
display_information:
  name: DealPress
  description: Deal approval workflows for sales teams

features:
  bot_user:
    display_name: DealPress
    always_online: true

oauth_config:
  scopes:
    bot:
      - chat:write
      - chat:write.public
      - users:read
      - users:read.email

settings:
  interactivity:
    is_enabled: true
    request_url: https://dealpress.vercel.app/api/slack/interactive
  event_subscriptions:
    request_url: https://dealpress.vercel.app/api/slack/events
    bot_events:
      - message.channels
```

**2. OAuth Flow for Slack Connection**
```typescript
// app/api/slack/oauth/route.ts (NEW)
export async function GET(request: Request) {
  const { code } = await request.json()

  // Exchange code for token
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: `${APP_URL}/api/slack/oauth`
    })
  })

  const { access_token, team } = await response.json()

  // Store token in organization
  await supabase
    .from('organizations')
    .update({
      slack_workspace_id: team.id,
      slack_access_token: access_token
    })
    .eq('id', orgId)

  return NextResponse.redirect('/settings?slack=connected')
}
```

**3. Store Slack User Mappings**
```sql
-- Add to organizations table
ALTER TABLE organizations ADD COLUMN slack_workspace_id TEXT;
ALTER TABLE organizations ADD COLUMN slack_access_token TEXT;
ALTER TABLE organizations ADD COLUMN slack_channel_id TEXT; -- optional team channel

-- Add to user_profiles table
ALTER TABLE user_profiles ADD COLUMN slack_user_id TEXT;
```

**4. Slack Notification Sender**
```typescript
// lib/slack/notifications.ts (NEW)
import { WebClient } from '@slack/web-api'

export async function sendSlackApprovalNotification({
  slackUserId,
  accessToken,
  dealName,
  dealAmount,
  requesterName,
  stepName,
  requestId,
  stepId
}: SlackNotificationParams) {
  const client = new WebClient(accessToken)

  const message = await client.chat.postMessage({
    channel: slackUserId, // DM
    text: `New approval request: ${dealName}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📋 New Approval Request'
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Deal:* ${dealName}` },
          { type: 'mrkdwn', text: `*Amount:* $${dealAmount.toLocaleString()}` },
          { type: 'mrkdwn', text: `*Requester:* ${requesterName}` },
          { type: 'mrkdwn', text: `*Step:* ${stepName}` }
        ]
      },
      {
        type: 'actions',
        block_id: `approval_${stepId}`,
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Approve' },
            style: 'primary',
            value: JSON.stringify({ action: 'approve', stepId, requestId }),
            action_id: 'approve_step'
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '❌ Reject' },
            style: 'danger',
            value: JSON.stringify({ action: 'reject', stepId, requestId }),
            action_id: 'reject_step'
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Details' },
            url: `${APP_URL}/requests/${requestId}`,
            action_id: 'view_request'
          }
        ]
      }
    ]
  })

  return message.ts // message timestamp (for updates later)
}
```

**5. Handle Button Clicks (Interactive Components)**
```typescript
// app/api/slack/interactive/route.ts (NEW)
export async function POST(request: Request) {
  const payload = JSON.parse((await request.formData()).get('payload') as string)

  if (payload.type !== 'block_actions') return new Response('OK')

  const action = payload.actions[0]
  const { stepId, requestId, action: actionType } = JSON.parse(action.value)

  // Verify user is the approver
  const step = await getApprovalStep(stepId)
  const slackUser = await getUserBySlackId(payload.user.id)

  if (slackUser.id !== step.approver_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Approve or reject
  if (actionType === 'approve') {
    await approveStep(stepId, 'Approved via Slack')

    // Update Slack message to show approved
    await updateSlackMessage(payload.response_url, {
      text: `✅ Approved by <@${payload.user.id}>`,
      blocks: [] // remove buttons
    })
  }

  if (actionType === 'reject') {
    // Open modal for reject comment
    await client.views.open({
      trigger_id: payload.trigger_id,
      view: {
        type: 'modal',
        title: { type: 'plain_text', text: 'Reject Request' },
        submit: { type: 'plain_text', text: 'Reject' },
        blocks: [
          {
            type: 'input',
            block_id: 'comment',
            label: { type: 'plain_text', text: 'Reason for rejection' },
            element: {
              type: 'plain_text_input',
              multiline: true,
              action_id: 'comment_text'
            }
          }
        ],
        private_metadata: JSON.stringify({ stepId, requestId })
      }
    })
  }

  return new Response('OK')
}
```

**6. Update Notification Functions to Support Slack**
```typescript
// lib/email/notifications.ts (MODIFY)
export async function sendApprovalNeededEmail({
  approverEmail,
  // ... existing params
  slackUserId, // NEW
  slackAccessToken // NEW
}) {
  // Send email
  await sendEmail({ ... })

  // Also send Slack notification if connected
  if (slackUserId && slackAccessToken) {
    await sendSlackApprovalNotification({ ... })
  }
}
```

**7. Settings Page for Slack Connection**
```typescript
// app/(dashboard)/settings/page.tsx (MODIFY)
<Card>
  <h3>Slack Integration</h3>
  {organization.slack_workspace_id ? (
    <>
      <p>✅ Connected to {organization.slack_workspace_id}</p>
      <Button onClick={handleDisconnect}>Disconnect Slack</Button>
    </>
  ) : (
    <Button onClick={handleConnect}>
      <Slack className="w-4 h-4 mr-2" />
      Connect Slack
    </Button>
  )}

  {/* Optional: Channel selection for team notifications */}
  {organization.slack_workspace_id && (
    <Select onValueChange={setSlackChannel}>
      <option value="">None (DMs only)</option>
      {channels.map(ch => <option value={ch.id}>#{ch.name}</option>)}
    </Select>
  )}
</Card>
```

---

## Security Considerations

- ✅ Slack tokens stored encrypted in database
- ✅ Verify Slack request signatures (prevent spoofing)
- ✅ Verify approver Slack ID matches DealPress user
- ✅ Rate limit Slack webhook endpoints
- ⚠️ Handle Slack workspace disconnections gracefully
- ⚠️ Validate message payloads before processing

---

## Edge Cases

1. **Slack workspace is disconnected**
   - Fall back to email notifications only
   - Show warning in settings

2. **User doesn't have Slack ID mapped**
   - First time they connect, map their email → Slack user
   - If no match found, send email only

3. **User clicks button after step is already approved**
   - Slack message already updated, button doesn't exist
   - If race condition, show error: "Already approved"

4. **Slack API is down**
   - Catch errors, fall back to email
   - Log failure for retry later

5. **Organization has multiple Slack workspaces**
   - V1: Only support one workspace per org
   - V2: Allow multiple workspace connections

---

## Dependencies

- `@slack/web-api` - Slack SDK (`npm install @slack/web-api`)
- Environment variables:
  - `SLACK_CLIENT_ID`
  - `SLACK_CLIENT_SECRET`
  - `SLACK_SIGNING_SECRET`
- Slack App created in Slack App Directory
- OAuth redirect URL whitelisted in Vercel

---

## Rollback Plan

If Slack integration breaks:
1. Disable "Connect Slack" button in settings
2. Set all `slack_access_token` to NULL
3. Remove Slack notification calls (revert to email-only)

No data loss - just feature toggle.

---

## Revenue Impact (90 days)

**Activation Impact:**
- Slack notifications = 3x higher engagement (industry benchmark)
- Faster approvals = happier customers = better retention
- Slack is table-stakes for B2B SaaS tools - without it, we lose deals

**Virality Impact:**
- Team channel notifications = organic visibility
- "What's this DealPress bot? Oh, we use it for approvals"
- Slack app directory listing = inbound signups

**Expansion Impact:**
- Slack visibility creates pressure for team-wide rollout
- "Everyone else can see approvals in Slack, I need access too"

**Estimated Revenue Impact:**
- 20% increase in new signups (Slack app directory)
- 30% increase in team invitations (channel visibility)
- At 100 users → +30 users → +$300 MRR/month
- **Total:** +$900 MRR in 90 days

---

## Implementation Tasks

### Phase 1: OAuth + DMs (6 hours)
1. [ ] Create Slack App in Slack App Directory
2. [ ] Install `@slack/web-api` package
3. [ ] Add environment variables to Vercel
4. [ ] Create `/api/slack/oauth/route.ts` for OAuth flow
5. [ ] Add database migration for Slack columns
6. [ ] Create "Connect Slack" button in settings
7. [ ] Create `lib/slack/notifications.ts` for message posting
8. [ ] Update `sendApprovalNeededEmail()` to include Slack notifications
9. [ ] Create `/api/slack/interactive/route.ts` for button handling
10. [ ] Test approve/reject from Slack DM
11. [ ] Update Slack message after approval

### Phase 2: Team Channels (2 hours)
1. [ ] Add channel selector to settings
2. [ ] Post status updates to team channel
3. [ ] Handle channel permissions errors

---

## Testing Checklist

- [ ] Connect Slack workspace via OAuth
- [ ] Receive Slack DM when approval is assigned
- [ ] Click "Approve" button in Slack → step approved
- [ ] Click "Reject" button → modal opens → reject works
- [ ] Slack message updates after action
- [ ] Team channel receives status updates
- [ ] Disconnect Slack works
- [ ] Fall back to email if Slack fails
- [ ] Verify Slack request signatures
- [ ] Rate limiting works

---

**Ship This Third.** Slack is table-stakes for B2B SaaS adoption. Without it, we're DOA for teams that live in Slack.

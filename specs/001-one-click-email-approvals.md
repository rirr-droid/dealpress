# Feature: One-Click Email Approvals

**ICE Score:** 9 (Impact) + 9 (Confidence) + 8 (Ease) = **26/30**
**PLG Lever:** Activation + Retention
**Priority:** P0 (Ship this week)
**Estimated Effort:** 4 hours

---

## Problem Statement

Approvers currently must:
1. Receive email notification
2. Click link to open app
3. Log in (if not authenticated)
4. Navigate to request page
5. Click approve/reject button

**This creates massive friction.** Approvers abandon the flow at step 3 (login). Average time-to-approval is artificially inflated by authentication overhead.

**Revenue Impact:** If 40% of approvals are abandoned due to friction, we're losing those deals. Faster approvals = faster revenue recognition for customers = higher perceived value = better retention.

---

## ICP Affected

**Primary:** VPs, Directors, C-suite approvers at ICP companies
**Why:** Senior approvers are time-poor. They want to approve from their inbox in 5 seconds, not open an app.

**User Pain:**
- "I got 15 approval emails today, I'm not logging into another tool"
- "By the time I logged in, I forgot which deal this was"
- "Can I just reply YES to approve?"

---

## User Story

**As a** VP of Sales receiving an approval request email
**I want** to approve or reject directly from the email with one click
**So that** I can keep deals moving without context-switching or logging in

---

## Success Metric

- **Primary:** 50% reduction in time-to-first-approval (measured from email sent → approval recorded)
- **Secondary:** 25% increase in approval completion rate (emails sent vs approvals taken)
- **Tertiary:** 40% reduction in approval abandonment (users who click email link but don't approve)

---

## Acceptance Criteria

### Must Have (MVP)
- [ ] Email includes "Approve" and "Reject" buttons with secure tokens
- [ ] Clicking "Approve" immediately approves the step without login
- [ ] Clicking "Reject" opens simple form to add required comment, then rejects
- [ ] Tokens expire after 7 days
- [ ] Tokens are single-use (can't approve twice with same link)
- [ ] Success page shows: "✅ Approved: [Deal Name]" with link to view full request
- [ ] Action is logged in audit trail with "via email" indicator
- [ ] If step already acted upon, show "Already approved by [Name] on [Date]"
- [ ] Email shows who else needs to approve (if multi-step)

### Nice to Have (V2)
- [ ] "Approve with comment" option in email
- [ ] Preview deal details in confirmation page before final approve
- [ ] "Delegate to someone else" option
- [ ] Mobile-optimized confirmation pages
- [ ] Slack-style emoji reactions instead of buttons (👍 = approve)

---

## Technical Implementation

### Architecture
```
Email → Signed Token → API Route → Update DB → Send Notifications → Show Success Page
```

### Key Files to Create/Modify

**1. Generate Signed Tokens**
```typescript
// lib/auth/email-tokens.ts (NEW)
import jwt from 'jsonwebtoken'

export function generateApprovalToken(stepId: string, approverId: string) {
  return jwt.sign(
    {
      stepId,
      approverId,
      action: 'approve',
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    },
    process.env.JWT_SECRET!
  )
}

export function verifyApprovalToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { stepId: string; approverId: string }
  } catch {
    return null
  }
}
```

**2. Update Email Template**
```typescript
// lib/email/templates/ApprovalNeeded.tsx (MODIFY)
// Add approve/reject buttons:
<Button href={approveUrl}>Approve Deal</Button>
<Button href={rejectUrl} variant="secondary">Reject</Button>
```

**3. Create API Route for Token Actions**
```typescript
// app/api/approve/[token]/route.ts (NEW)
export async function GET(request: Request, { params }: { params: { token: string } }) {
  const { stepId, approverId } = verifyApprovalToken(params.token)

  // Verify token is valid and not expired
  // Check step status (prevent double-approval)
  // Approve the step via approveStep() server action
  // Return success page
}
```

**4. Create Success/Error Pages**
```typescript
// app/approve/success/page.tsx (NEW)
// Show: "✅ You approved [Deal Name]"
// Link to view full request
// Show next approver info

// app/approve/error/page.tsx (NEW)
// Show: "⚠️ This approval link has expired or already been used"
```

**5. Update Notification Function**
```typescript
// lib/email/notifications.ts (MODIFY)
export async function sendApprovalNeededEmail() {
  const approveToken = generateApprovalToken(stepId, approverEmail)
  const rejectToken = generateRejectToken(stepId, approverEmail)

  const approveUrl = `${APP_URL}/api/approve/${approveToken}`
  const rejectUrl = `${APP_URL}/api/reject/${rejectToken}`

  // Pass to email template
}
```

### Security Considerations
- ✅ Tokens are JWT-signed (can't be forged)
- ✅ Tokens expire after 7 days
- ✅ Tokens are single-use (mark as used in DB)
- ✅ Verify approverId matches step.approver_id before approving
- ⚠️ Need to store used tokens to prevent replay attacks

### Database Changes
```sql
-- Add to approval_steps table
ALTER TABLE approval_steps ADD COLUMN approved_via TEXT; -- 'web' | 'email' | 'slack'
ALTER TABLE approval_steps ADD COLUMN email_token_used BOOLEAN DEFAULT FALSE;
```

---

## Edge Cases

1. **Token expires before use**
   - Show: "This link has expired. Please log in to approve."
   - Include login link to request page

2. **Step already approved by someone else**
   - Show: "Already approved by [Name] on [Date]"
   - Option to view request

3. **Request was deleted**
   - Show: "This request no longer exists"

4. **Approver clicks both Approve and Reject**
   - First action wins, second shows "Already approved/rejected"

5. **Email forwarded to non-approver**
   - Token tied to specific approverId, fails verification
   - Show: "You are not authorized to approve this request"

---

## Dependencies

- JWT library (`npm install jsonwebtoken @types/jsonwebtoken`)
- Environment variable: `JWT_SECRET` (add to Vercel)
- Database migration for `approved_via` column

---

## Rollback Plan

If this creates issues:
1. Remove approve/reject buttons from emails (keep old "View Request" link)
2. Delete `/api/approve/*` and `/api/reject/*` routes
3. Approvals revert to web-only flow

No data loss risk - just UX change.

---

## Revenue Impact (90 days)

**Activation Impact:**
- Faster approvals = faster deals close = happier customers
- Reduced friction = more approvers actually approve = higher throughput
- Better NPS = more word-of-mouth signups

**Retention Impact:**
- Approvers who use email approvals are 3x more likely to invite teammates (hypothesis)
- Creates "magic moment" - instant gratification

**Estimated Revenue Impact:**
- 20% faster deal cycles → 20% more deals processed per month
- At $10/user/month, 100 users = $1000 MRR
- If this drives 25% more user invitations (virality), that's +$250 MRR/month
- **Total:** +$3,000 MRR in 90 days

---

## Implementation Tasks

### Phase 1: Core Flow (4 hours)
1. [ ] Install jsonwebtoken package
2. [ ] Create `lib/auth/email-tokens.ts` with generate/verify functions
3. [ ] Add `JWT_SECRET` to Vercel environment variables
4. [ ] Update email template to include approve/reject buttons
5. [ ] Create `/api/approve/[token]/route.ts` API handler
6. [ ] Create `/api/reject/[token]/route.ts` API handler (with comment form)
7. [ ] Create success/error pages
8. [ ] Add database migration for `approved_via` column
9. [ ] Update audit logs to show "via email" indicator
10. [ ] Test full flow end-to-end

### Phase 2: Polish (2 hours)
1. [ ] Add "Already approved" handling
2. [ ] Add token expiration handling
3. [ ] Mobile-optimize success pages
4. [ ] Add analytics tracking (email approval rate)

---

## Testing Checklist

- [ ] Approve from email works (happy path)
- [ ] Reject from email works with comment
- [ ] Expired token shows error
- [ ] Already-approved step shows message
- [ ] Non-approver using token is blocked
- [ ] Token can't be reused (replay attack)
- [ ] Audit log shows "via email"
- [ ] Next step is triggered after approval
- [ ] Email notifications are sent correctly
- [ ] Mobile view works

---

**Ship This First.** It's the highest ROI feature we can build - massive activation boost with minimal code.

# Testing Guide: One-Click Email Approvals

**Feature:** One-Click Email Approvals
**Test Environment:** Staging/Production
**Estimated Testing Time:** 30 minutes

---

## Test Prerequisites

- Access to DealPress application
- Two test user accounts (requester and approver)
- Access to email inbox for approver account
- Database access for verification queries

---

## Test Suite 1: Happy Path - Approval (5 minutes)

### Test 1.1: Create Request and Receive Email

**Steps:**
1. Log in as requester
2. Create new approval request
3. Assign to approver (yourself or test user)
4. Submit request
5. Check approver's email inbox

**Expected Results:**
- ✅ Email received with subject "Approval Needed: [Deal Name]"
- ✅ Email contains three buttons:
  - Green "Approve Deal" button
  - Red "Reject" button
  - Outlined "View Full Details" button
- ✅ Deal name and amount displayed correctly
- ✅ Reason/context shown if provided

**Pass/Fail:** _____

---

### Test 1.2: One-Click Approval

**Steps:**
1. Open approval email from Test 1.1
2. Click "Approve Deal" button
3. Observe redirect

**Expected Results:**
- ✅ Redirects to success page immediately (no login)
- ✅ Success page shows green checkmark
- ✅ Shows message "Successfully Approved!"
- ✅ Displays deal name
- ✅ Shows "This was the final approval step" or "Moving to next step"
- ✅ "View Full Request Details" button appears

**Pass/Fail:** _____

---

### Test 1.3: Verify Approval in System

**Steps:**
1. Go to DealPress dashboard
2. Navigate to the approved request
3. Check approval step details

**Expected Results:**
- ✅ Request status is "Approved" (or "Pending" if multi-step)
- ✅ Step status shows "approved"
- ✅ Approver name matches
- ✅ Timestamp recorded

**Database Verification:**
```sql
SELECT id, status, approved_via, email_token_used, acted_at
FROM approval_steps
WHERE id = '[step-id-here]';
```

**Expected:**
- ✅ status = 'approved'
- ✅ approved_via = 'email'
- ✅ email_token_used = true
- ✅ acted_at is populated

**Pass/Fail:** _____

---

### Test 1.4: Verify Audit Log

**Steps:**
1. View request details page
2. Scroll to audit log section

**Expected Results:**
- ✅ Audit entry shows "Step approved"
- ✅ Shows "via email" indicator
- ✅ Timestamp and user recorded
- ✅ Metadata includes step_id

**Pass/Fail:** _____

---

## Test Suite 2: Happy Path - Rejection (5 minutes)

### Test 2.1: Click Reject Button

**Steps:**
1. Create another test approval request
2. Receive approval email
3. Click "Reject" button in email

**Expected Results:**
- ✅ Redirects to rejection form page
- ✅ Shows deal name and step context
- ✅ Displays textarea for rejection reason
- ✅ "Confirm Rejection" button present
- ✅ "Cancel" button present

**Pass/Fail:** _____

---

### Test 2.2: Submit Rejection with Comment

**Steps:**
1. Enter rejection reason: "Pricing exceeds budget limits"
2. Click "Confirm Rejection"

**Expected Results:**
- ✅ Form submits successfully
- ✅ Redirects to success page
- ✅ Success page shows orange icon
- ✅ Message says "Request Rejected"
- ✅ Confirms requester has been notified

**Pass/Fail:** _____

---

### Test 2.3: Verify Rejection in System

**Steps:**
1. Check dashboard
2. View rejected request
3. Verify rejection details

**Expected Results:**
- ✅ Request status is "Rejected"
- ✅ Step shows "rejected"
- ✅ Rejection comment visible
- ✅ Timestamp recorded

**Database Verification:**
```sql
SELECT id, status, comments, approved_via, email_token_used
FROM approval_steps
WHERE id = '[step-id-here]';
```

**Expected:**
- ✅ status = 'rejected'
- ✅ comments = "Pricing exceeds budget limits"
- ✅ approved_via = 'email'
- ✅ email_token_used = true

**Pass/Fail:** _____

---

### Test 2.4: Verify Requester Notification

**Steps:**
1. Check requester's email inbox
2. Find rejection notification

**Expected Results:**
- ✅ Email received with subject "❌ Rejected: [Deal Name]"
- ✅ Shows rejection reason
- ✅ Shows approver name
- ✅ Link to view request

**Pass/Fail:** _____

---

## Test Suite 3: Security & Edge Cases (10 minutes)

### Test 3.1: Token Expiration

**Steps:**
1. Manually modify token expiration in code to 1 minute (for testing)
2. Create request and get email
3. Wait 2 minutes
4. Click approve button

**Expected Results:**
- ✅ Redirects to error page
- ✅ Shows "Invalid or Expired Link" message
- ✅ Provides link to login
- ✅ Request remains in "Pending" status

**Pass/Fail:** _____

---

### Test 3.2: Replay Attack Prevention

**Steps:**
1. Create request and receive email
2. Click "Approve Deal" button
3. Go back to email
4. Click "Approve Deal" button again

**Expected Results:**
- ✅ First click: Success page
- ✅ Second click: Error page
- ✅ Error message: "Link Already Used" or "Already Acted Upon"
- ✅ Step remains approved (not changed)

**Pass/Fail:** _____

---

### Test 3.3: Unauthorized Access

**Steps:**
1. Create request assigned to User A
2. Copy approve URL from User A's email
3. Send URL to User B (different approver)
4. User B clicks the link

**Expected Results:**
- ✅ Redirects to error page
- ✅ Shows "Unauthorized" message
- ✅ Explains link is for assigned approver only
- ✅ Request remains pending

**Pass/Fail:** _____

---

### Test 3.4: Already Approved via Web

**Steps:**
1. Create request and receive email
2. Log in to dashboard
3. Approve via web interface
4. Go back to email
5. Click "Approve Deal" button

**Expected Results:**
- ✅ Redirects to error page
- ✅ Shows "Already Acted Upon" message
- ✅ Displays who approved and when
- ✅ Link to view request

**Pass/Fail:** _____

---

### Test 3.5: Missing JWT_SECRET

**Setup:**
1. Temporarily remove JWT_SECRET from environment
2. Restart application
3. Create new request

**Expected Results:**
- ✅ Email is sent successfully
- ✅ Email shows only "Review Request" button (fallback)
- ✅ No approve/reject buttons appear
- ✅ Traditional flow still works
- ✅ No application crash

**Pass/Fail:** _____

---

### Test 3.6: Invalid Token

**Steps:**
1. Get legitimate approve URL
2. Modify token in URL (change last character)
3. Visit modified URL

**Expected Results:**
- ✅ Redirects to error page
- ✅ Shows "Invalid or Expired Link"
- ✅ Does not crash application
- ✅ Request remains unchanged

**Pass/Fail:** _____

---

## Test Suite 4: Multi-Step Workflows (5 minutes)

### Test 4.1: Approve First Step

**Setup:**
1. Create multi-step approval template (e.g., Manager → Director → VP)
2. Create request using this template

**Steps:**
1. First approver receives email
2. First approver clicks "Approve Deal"

**Expected Results:**
- ✅ First step approved
- ✅ Success page says "Moving to next approval step"
- ✅ Second approver receives email immediately
- ✅ Request status still "Pending"

**Pass/Fail:** _____

---

### Test 4.2: Approve Final Step

**Steps:**
1. Second approver receives email
2. Click "Approve Deal"

**Expected Results:**
- ✅ Step approved
- ✅ Success page says "This was the final approval step"
- ✅ Request status changes to "Approved"
- ✅ Requester receives final approval email

**Pass/Fail:** _____

---

### Test 4.3: Reject in Middle Step

**Setup:**
1. Create another multi-step request

**Steps:**
1. First approver approves
2. Second approver clicks "Reject"
3. Submits rejection reason

**Expected Results:**
- ✅ Request immediately rejected (not passed to next step)
- ✅ Status changes to "Rejected"
- ✅ Third approver does NOT receive email
- ✅ Requester receives rejection email

**Pass/Fail:** _____

---

## Test Suite 5: Email & UI Testing (5 minutes)

### Test 5.1: Email Rendering

**Test in multiple email clients:**
- [ ] Gmail (web)
- [ ] Outlook (web)
- [ ] Apple Mail
- [ ] Mobile email app

**Expected Results:**
- ✅ Buttons render correctly
- ✅ Colors display properly (green/red)
- ✅ Layout is not broken
- ✅ All text is readable
- ✅ Links work when clicked

**Pass/Fail:** _____

---

### Test 5.2: Mobile Responsiveness

**Steps:**
1. Open approval email on mobile device
2. Click approve button
3. View success page on mobile

**Expected Results:**
- ✅ Buttons are tap-friendly
- ✅ Success page displays correctly
- ✅ Text is readable without zooming
- ✅ No horizontal scrolling
- ✅ "View Full Request" button works

**Pass/Fail:** _____

---

### Test 5.3: Browser Compatibility

**Test success/error pages in:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Expected Results:**
- ✅ Pages load correctly
- ✅ Styling renders properly
- ✅ Buttons work
- ✅ Redirects function

**Pass/Fail:** _____

---

## Test Suite 6: Performance & Load (Optional, 5 minutes)

### Test 6.1: Token Generation Speed

**Steps:**
1. Create 10 requests rapidly
2. Check email receipt timing

**Expected Results:**
- ✅ All emails received within 30 seconds
- ✅ All contain approve/reject buttons
- ✅ No token generation errors in logs

**Pass/Fail:** _____

---

### Test 6.2: Concurrent Approvals

**Steps:**
1. Create 5 requests assigned to same approver
2. Open all 5 emails
3. Quickly click all 5 approve buttons in sequence

**Expected Results:**
- ✅ All 5 approvals process successfully
- ✅ All redirect to success pages
- ✅ All show correct deal names
- ✅ All recorded in database

**Pass/Fail:** _____

---

## Acceptance Criteria Verification

From original spec:

### Must Have (MVP)
- ✅ Email includes "Approve" and "Reject" buttons with secure tokens
- ✅ Clicking "Approve" immediately approves without login
- ✅ Clicking "Reject" opens form for required comment
- ✅ Tokens expire after 7 days
- ✅ Tokens are single-use (can't approve twice)
- ✅ Success page shows confirmation with link to view request
- ✅ Action logged in audit trail with "via email" indicator
- ✅ If step already acted upon, show appropriate message
- ✅ Email shows who else needs to approve (if multi-step)

**All criteria met:** YES / NO

---

## Critical Issues Found

Document any blocking issues:

| Issue # | Severity | Description | Status |
|---------|----------|-------------|--------|
| | | | |
| | | | |
| | | | |

---

## Non-Critical Issues Found

Document any minor issues:

| Issue # | Severity | Description | Status |
|---------|----------|-------------|--------|
| | | | |
| | | | |

---

## Performance Metrics

| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| Email delivery time | < 30s | | |
| Token generation time | < 100ms | | |
| Approval response time | < 2s | | |
| Page load time | < 3s | | |

---

## Recommendation

Based on testing results:

- [ ] **APPROVED FOR PRODUCTION** - All tests passed, ready to deploy
- [ ] **APPROVED WITH MINOR ISSUES** - Can deploy, monitor closely
- [ ] **NOT APPROVED** - Critical issues found, needs fixes

**Tester Name:** _________________
**Date:** _________________
**Signature:** _________________

---

## Post-Deployment Monitoring (First 48 Hours)

### Metrics to Watch:

1. **Error Rate:**
   ```sql
   SELECT COUNT(*) FROM audit_logs
   WHERE action LIKE '%error%'
   AND created_at > NOW() - INTERVAL '48 hours';
   ```
   Target: < 10 errors

2. **Email Approval Rate:**
   ```sql
   SELECT
     COUNT(*) FILTER (WHERE approved_via = 'email') * 100.0 / COUNT(*) as email_percentage
   FROM approval_steps
   WHERE acted_at > NOW() - INTERVAL '48 hours';
   ```
   Target: > 50%

3. **Token Expiration Rate:**
   ```sql
   SELECT COUNT(*) FROM approval_steps
   WHERE status = 'pending'
   AND assigned_at < NOW() - INTERVAL '7 days'
   AND email_token_used = false;
   ```
   Target: < 20%

### Alert Triggers:

- If error rate > 50 in first hour → Investigate immediately
- If email approval rate < 20% → Check JWT_SECRET configuration
- If no email approvals in first 4 hours → Verify token generation

---

*Testing guide for One-Click Email Approvals*
*Last updated: 2026-02-16*

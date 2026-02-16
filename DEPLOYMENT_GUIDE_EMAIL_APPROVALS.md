# Quick Deployment Guide: One-Click Email Approvals

**Feature:** One-Click Email Approvals
**Priority:** P0
**Time to Deploy:** ~10 minutes

---

## Prerequisites

- Access to Supabase SQL Editor
- Access to Vercel Dashboard (or hosting environment variables)
- Node.js installed locally (to generate JWT_SECRET)

---

## Step 1: Generate JWT_SECRET (2 minutes)

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Copy the output** - you'll need it in Step 3.

Example output:
```
878e0f7b9a4f3dc1ffa07eb527fd8754edab9164a1de3a44795d8f51ab6e699d4854126e99f0779698791c336124fcc82fe76333ccd2e6c2f9dd79a8ca0db471
```

---

## Step 2: Run Database Migration (3 minutes)

1. Go to Supabase Dashboard
2. Open SQL Editor
3. Copy and paste the following SQL:

```sql
-- Migration: Add email approval tracking columns
-- Feature: One-Click Email Approvals
-- Date: 2026-02-16

-- Add approved_via column to track how the approval was made
ALTER TABLE approval_steps
ADD COLUMN IF NOT EXISTS approved_via TEXT CHECK (approved_via IN ('web', 'email', 'slack'));

-- Add email_token_used column to prevent replay attacks
ALTER TABLE approval_steps
ADD COLUMN IF NOT EXISTS email_token_used BOOLEAN DEFAULT FALSE;

-- Add comment for approved_via column
COMMENT ON COLUMN approval_steps.approved_via IS 'Tracks the channel through which the approval was made: web, email, or slack';

-- Add comment for email_token_used column
COMMENT ON COLUMN approval_steps.email_token_used IS 'Prevents token replay attacks by marking when an email token has been used';
```

4. Click "Run" to execute the migration
5. Verify success message

**Verification:**
```sql
-- Check that columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'approval_steps'
AND column_name IN ('approved_via', 'email_token_used');
```

Should return 2 rows.

---

## Step 3: Add Environment Variable (2 minutes)

### For Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Name:** `JWT_SECRET`
   - **Value:** [paste the secret from Step 1]
   - **Environments:** Production, Preview, Development
3. Click "Save"

### For Other Platforms:

Add to your environment variables:
```bash
JWT_SECRET=your-generated-secret-here
```

### For Local Development:

Create or update `.env.local`:
```bash
JWT_SECRET=your-generated-secret-here
```

---

## Step 4: Deploy Code (2 minutes)

### If using Git with auto-deploy:

The code is already committed. Just verify the deployment in your hosting dashboard.

### If deploying manually:

```bash
cd /path/to/dealpress
npm run build
# Deploy according to your hosting provider
```

---

## Step 5: Verify Deployment (5 minutes)

### Test Checklist:

1. **Create a test approval request:**
   - Log in to DealPress
   - Create a new approval request
   - Assign to yourself or test user

2. **Check email:**
   - Open the approval email
   - Verify three buttons appear:
     - ✅ "Approve Deal" (green)
     - ❌ "Reject" (red)
     - 👁️ "View Full Details" (outlined)

3. **Test approve flow:**
   - Click "Approve Deal" button
   - Should redirect to success page
   - Verify deal is approved in dashboard
   - Check approval step shows "approved" status

4. **Test reject flow (if you have another request):**
   - Click "Reject" button
   - Should open rejection form
   - Enter reason and submit
   - Verify success page appears
   - Check deal is rejected in dashboard

5. **Verify audit log:**
   - Go to request details
   - Check audit log shows "via email" indicator

### If Buttons Don't Appear in Email:

Check these:
- JWT_SECRET is set in environment
- Environment was restarted after adding JWT_SECRET
- Email template is using latest code
- Check application logs for token generation errors

---

## Step 6: Monitor (Ongoing)

### Key Metrics to Watch:

1. **Email approval rate:**
   - How many approvals happen via email vs web
   - Target: 60%+ via email within first week

2. **Time to approval:**
   - Compare before/after average
   - Target: 50% reduction

3. **Error rate:**
   - Monitor expired token errors
   - Monitor unauthorized attempts
   - Should be < 5%

4. **Token usage:**
   - Track how quickly approvers act (within 7 days)
   - Target: 80%+ act within 24 hours

### Monitoring Queries:

```sql
-- Check email approvals vs web approvals
SELECT
  approved_via,
  COUNT(*) as count
FROM approval_steps
WHERE status IN ('approved', 'rejected')
GROUP BY approved_via;

-- Check token usage rate
SELECT
  COUNT(*) FILTER (WHERE email_token_used = true) as tokens_used,
  COUNT(*) as total_email_approvals,
  ROUND(COUNT(*) FILTER (WHERE email_token_used = true)::numeric / COUNT(*) * 100, 2) as usage_rate_percent
FROM approval_steps
WHERE approved_via = 'email';

-- Average approval time by channel
SELECT
  approved_via,
  AVG(EXTRACT(EPOCH FROM (acted_at - assigned_at))/3600) as avg_hours_to_act
FROM approval_steps
WHERE status IN ('approved', 'rejected')
GROUP BY approved_via;
```

---

## Troubleshooting

### Issue: Buttons don't appear in email

**Solution:**
1. Check JWT_SECRET is set: `echo $JWT_SECRET` (in server environment)
2. Check application logs for "Failed to generate approval tokens"
3. Verify email template updated (check deployment)
4. Restart application after adding JWT_SECRET

### Issue: "Invalid or expired token" error

**Solutions:**
- Token may have expired (7 day limit)
- User should log in and approve from dashboard
- Check system clock is synchronized

### Issue: "Token already used" error

**Solutions:**
- User clicked approve button twice
- Token can only be used once (security feature)
- User should use dashboard for any changes

### Issue: "Unauthorized" error

**Solutions:**
- Email may have been forwarded
- Only assigned approver can use token
- Verify approver_id matches in database

### Issue: Build fails with JWT_SECRET error

**Solution:**
Use temporary secret for build:
```bash
JWT_SECRET=temp_build_secret npm run build
```
Then set real secret in runtime environment.

---

## Rollback Procedure

If you need to disable the feature:

### Quick Disable (Keep Code):

1. Remove JWT_SECRET from environment variables
2. Restart application
3. Emails will fall back to "Review Request" button
4. No data loss

### Full Rollback:

```bash
git revert HEAD  # If last commit
# OR
git checkout previous-commit-hash
git push -f
```

Database columns can remain (they don't break anything).

---

## Success Confirmation

✅ Database migration completed successfully
✅ JWT_SECRET set in environment
✅ Code deployed to production
✅ Test email shows approve/reject buttons
✅ Test approval works end-to-end
✅ Audit log shows "via email"
✅ No errors in application logs

**Feature is live and working! 🎉**

---

## Next Steps

1. **Week 1:** Monitor adoption metrics
2. **Week 2:** Collect user feedback from approvers
3. **Week 3:** Measure time-to-approval improvement
4. **Week 4:** Calculate ROI and plan Phase 2 enhancements

---

## Support

**If issues arise:**
1. Check this guide's troubleshooting section
2. Review application logs
3. Check FEATURE_IMPLEMENTATION_SUMMARY.md for technical details
4. Rollback if needed (see above)

**Emergency rollback time:** < 5 minutes

---

*Deployment guide for One-Click Email Approvals*
*Last updated: 2026-02-16*

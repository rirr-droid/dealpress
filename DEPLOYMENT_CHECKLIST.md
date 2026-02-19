# 🚀 Deployment Checklist

## Status: Code Deployed to GitHub ✅

Vercel will automatically deploy your changes. Here's what you need to do next:

---

## 1. Database Migrations (REQUIRED) ⚠️

Run these SQL migrations in your Supabase dashboard:

### Migration 005: Slack Integration
```sql
-- File: supabase/migrations/005_add_slack_integration.sql
```

**Steps:**
1. Go to: https://app.supabase.com
2. Select your project
3. Click: **SQL Editor** (left sidebar)
4. Click: **New Query**
5. Copy/paste contents of `supabase/migrations/005_add_slack_integration.sql`
6. Click: **Run** (or press Ctrl+Enter)
7. Verify: Should see "Success. No rows returned"

### Migration 006: Team Management
```sql
-- File: supabase/migrations/006_add_team_invitations.sql
```

**Steps:**
1. Same as above
2. Copy/paste contents of `supabase/migrations/006_add_team_invitations.sql`
3. Click: **Run**
4. Verify: Should see "Success. No rows returned"

**Quick check:**
```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('team_invitations', 'slack_users');
```
Should return both tables.

---

## 2. Environment Variables (REQUIRED) ⚠️

### Vercel Dashboard
Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

### Required Variables:

#### Google OAuth (REQUIRED for Google login):
```bash
# Already have these from Supabase, just verify they exist:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Slack Integration (Optional - Pro feature):
```bash
NEXT_PUBLIC_SLACK_CLIENT_ID=your-client-id-here
SLACK_CLIENT_SECRET=your-client-secret-here
SLACK_SIGNING_SECRET=your-signing-secret-here
```

**Get Slack credentials:**
- See: `SLACK_SETUP_GUIDE.md`
- Create Slack app: https://api.slack.com/apps

#### Encryption Key (REQUIRED for Slack):
```bash
ENCRYPTION_KEY=your-random-32-byte-key
```

**Generate encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Resend Email (REQUIRED for team invitations):
```bash
RESEND_API_KEY=re_your-key-here
RESEND_FROM_EMAIL=DealPress <approvals@yourdomain.com>
```

**Get Resend API key:**
- Sign up: https://resend.com
- Create API key: https://resend.com/api-keys
- Add verified domain (or use resend.dev for testing)

#### Other Required Variables (should already exist):
```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_xxx (if using Stripe)
```

---

## 3. Enable Google OAuth in Supabase (REQUIRED) ⚠️

### Steps:
1. Go to: https://app.supabase.com
2. Select your project
3. Go to: **Authentication** → **Providers**
4. Find **Google** and click to configure
5. Enable Google provider
6. Add Google Client ID and Secret

### Get Google OAuth Credentials:
**See:** `GOOGLE_OAUTH_QUICKSTART.md`

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. Paste into Supabase

---

## 4. Verify Deployment

### Check Vercel Deployment:
1. Go to: https://vercel.com/dashboard
2. Check latest deployment status
3. Should see: ✅ "Ready" (not red/failed)

### If Build Fails:
- Check build logs in Vercel
- Common issues:
  - TypeScript errors (check console)
  - Missing environment variables
  - Import errors

---

## 5. Test New Features

### Test Google OAuth:
1. Visit: `https://your-app.vercel.app/login`
2. Click: "Continue with Google"
3. Should redirect to Google login
4. After login, should redirect to `/dashboard`
5. Check: User profile created in Supabase

### Test Team Invitations:
1. Visit: `https://your-app.vercel.app/settings/team`
2. Click: "Invite Member"
3. Enter email and select role
4. Click: "Send Invitation"
5. Check: Email received (check spam folder)
6. Click: "Accept Invitation" in email
7. Verify: New member appears in team list

### Test Slack (Optional - if configured):
1. Visit: `https://your-app.vercel.app/settings`
2. Find: "Slack Integration" card
3. Click: "Connect Slack"
4. Authorize in Slack
5. Create test approval request
6. Check: Slack DM received
7. Test: Approve/Reject buttons

---

## 6. Database Migration Verification

Run these queries to verify migrations worked:

```sql
-- Check Slack integration columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'organizations'
  AND column_name IN ('slack_workspace_id', 'slack_bot_token', 'slack_enabled');
-- Should return 3 rows

-- Check team invitations table
SELECT COUNT(*) FROM team_invitations;
-- Should work (even if 0 results)

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('team_invitations', 'slack_users');
-- Should show multiple policies
```

---

## 7. Post-Deployment Actions

### Update Documentation:
- [ ] Add Google OAuth setup to onboarding docs
- [ ] Update team invitation flow in help docs
- [ ] Add Slack integration guide to knowledge base

### Monitor Metrics:
```sql
-- Track Google OAuth signups
SELECT COUNT(*) FROM auth.users
WHERE raw_app_meta_data->>'provider' = 'google'
  AND created_at > NOW() - INTERVAL '7 days';

-- Track team invitations
SELECT COUNT(*),
       COUNT(*) FILTER (WHERE accepted_at IS NOT NULL) as accepted
FROM team_invitations
WHERE created_at > NOW() - INTERVAL '7 days';

-- Track Slack adoption
SELECT COUNT(*) FROM organizations
WHERE slack_enabled = true;
```

### Test User Flows:
- [ ] New user signup with Google
- [ ] Team invitation end-to-end
- [ ] Slack notification (if configured)
- [ ] Approval workflow still works
- [ ] Settings pages load correctly

---

## 8. Rollback Plan (If Needed)

If something breaks:

### Quick Rollback:
1. Go to Vercel dashboard
2. Find previous deployment (before this one)
3. Click "..." → "Promote to Production"
4. Previous version restored

### Database Rollback:
```sql
-- If needed, drop new tables
DROP TABLE IF EXISTS team_invitations CASCADE;
DROP TABLE IF EXISTS slack_users CASCADE;

-- Revert organization table changes
ALTER TABLE organizations
  DROP COLUMN IF EXISTS slack_workspace_id,
  DROP COLUMN IF EXISTS slack_bot_token,
  DROP COLUMN IF EXISTS slack_enabled,
  DROP COLUMN IF EXISTS slack_channel_id;
```

---

## Priority Checklist

**Must Do Now:**
- [x] ✅ Push code to GitHub
- [ ] ⚠️ Run database migrations (005 & 006)
- [ ] ⚠️ Generate and set ENCRYPTION_KEY in Vercel
- [ ] ⚠️ Set RESEND_API_KEY in Vercel
- [ ] ⚠️ Enable Google OAuth in Supabase

**Should Do Soon:**
- [ ] Configure Slack app (for Pro users)
- [ ] Test team invitation flow
- [ ] Test Google OAuth login
- [ ] Verify email sending works

**Can Do Later:**
- [ ] Set up custom email domain in Resend
- [ ] Configure Slack for production
- [ ] Update help documentation
- [ ] Monitor metrics

---

## Quick Commands Reference

### Generate Encryption Key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Test Email Template:
```bash
# In Resend dashboard, use "Send Test Email" feature
```

### Check Migration Status:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## Support

If you run into issues:

1. **Check Vercel Logs:** Functions → Latest invocation
2. **Check Supabase Logs:** Logs & Analytics → SQL
3. **Check Browser Console:** F12 → Console tab
4. **Review Guides:**
   - `GOOGLE_OAUTH_QUICKSTART.md`
   - `SLACK_SETUP_GUIDE.md`
   - `TEAM_MANAGEMENT_SUMMARY.md`

---

## Success Indicators

You'll know deployment is successful when:

- ✅ Vercel shows "Ready" status
- ✅ Google OAuth login works
- ✅ Team invitation emails send
- ✅ Settings pages load without errors
- ✅ No console errors on frontend
- ✅ Database migrations show new tables

---

**Current Status:**
- ✅ Code committed and pushed to GitHub
- ✅ Vercel auto-deployment triggered
- ⏳ Waiting for you to run database migrations
- ⏳ Waiting for environment variables setup

**Next Steps:**
1. Run the 2 database migrations in Supabase SQL Editor
2. Set environment variables in Vercel
3. Enable Google OAuth in Supabase
4. Test the new features!

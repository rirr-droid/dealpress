# Slack Integration Setup Guide

## Overview

The Slack integration sends approval notifications directly to approvers in Slack with one-click approve/reject buttons. This feature is **Pro tier only**.

## What It Does

- ✅ **Instant Notifications** - DMs approvers when they're assigned to a request
- ✅ **One-Click Actions** - Approve or reject directly from Slack
- ✅ **Rich Details** - Shows deal name, amount, requester, and justification
- ✅ **Auto-Matching** - Matches Slack users to DealPress users by email
- ✅ **Secure** - Bot tokens encrypted with AES-256

## Setup Steps (15 minutes)

### Step 1: Create Slack App (5 min)

1. Go to https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. App Name: **DealPress**
4. Select your workspace
5. Click **"Create App"**

### Step 2: Configure OAuth & Permissions (5 min)

1. In your app settings, go to **"OAuth & Permissions"**
2. Scroll to **"Scopes"** section
3. Under **"Bot Token Scopes"**, add these scopes:
   - `chat:write` - Send messages as the bot
   - `im:write` - Send DMs to users
   - `users:read` - View people in workspace
   - `users:read.email` - View email addresses
   - `channels:read` - View channel names

4. Scroll to **"Redirect URLs"**
5. Click **"Add New Redirect URL"**
6. Enter: `https://your-app.vercel.app/api/slack/oauth`
   - Replace `your-app.vercel.app` with your actual domain
   - For local testing: `http://localhost:3000/api/slack/oauth`
7. Click **"Save URLs"**

### Step 3: Enable Interactivity (3 min)

1. Go to **"Interactivity & Shortcuts"** in the sidebar
2. Turn **"Interactivity"** ON
3. Request URL: `https://your-app.vercel.app/api/slack/interactive`
4. Click **"Save Changes"**

### Step 4: Get Your Credentials (2 min)

1. Go to **"Basic Information"**
2. Copy these values:

   **Client ID:**
   - Found under "App Credentials"
   - Add to env as `NEXT_PUBLIC_SLACK_CLIENT_ID`

   **Client Secret:**
   - Found under "App Credentials"
   - Add to env as `SLACK_CLIENT_SECRET`

   **Signing Secret:**
   - Found under "App Credentials"
   - Add to env as `SLACK_SIGNING_SECRET`

### Step 5: Set Environment Variables

Add to your `.env.local` (or Vercel environment variables):

```bash
# Slack Integration
NEXT_PUBLIC_SLACK_CLIENT_ID=1234567890.1234567890
SLACK_CLIENT_SECRET=abcdef1234567890abcdef1234567890
SLACK_SIGNING_SECRET=1234567890abcdef1234567890abcdef

# Encryption key for bot tokens (generate new one)
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ENCRYPTION_KEY=your-random-32-byte-key-here
```

### Step 6: Run Database Migration

Apply the Slack integration migration:

```bash
# If using Supabase locally
supabase db reset

# Or run the migration file directly in Supabase SQL Editor
# File: supabase/migrations/005_add_slack_integration.sql
```

### Step 7: Install in Your Workspace

1. Go to DealPress → Settings
2. Find "Slack Integration" section
3. Click **"Connect Slack"**
4. Authorize the app in your workspace
5. Should redirect back with "Connected" status

## Testing the Integration

### Test Notification Flow:

1. Create a new approval request in DealPress
2. Assign an approver who has a Slack account
3. Approver's email in DealPress must match their Slack email
4. Approver should receive a DM in Slack with approval buttons

### Test Approve/Reject:

1. In Slack DM, click **"✅ Approve"** or **"❌ Decline"**
2. Message should update to show approval status
3. Check DealPress - request should be approved/rejected
4. Next approver (if any) should get notified

## Troubleshooting

### "Slack not configured" error

**Cause:** Organization doesn't have Slack enabled

**Fix:**
- Go to Settings → Slack Integration
- Click "Connect Slack"
- Complete OAuth flow

### "Slack user not found" error

**Cause:** Approver's email doesn't match any Slack user

**Fix:**
- Ensure approver's email in DealPress matches their Slack email
- Run user sync: The OAuth flow automatically syncs users
- Or manually add to `slack_users` table

### "Invalid signature" error

**Cause:** Slack signing secret doesn't match

**Fix:**
- Check `SLACK_SIGNING_SECRET` env var
- Get correct value from Slack App → Basic Information
- Redeploy if needed

### Buttons don't work

**Cause:** Interactive endpoint not configured

**Fix:**
- Go to Slack App → Interactivity & Shortcuts
- Ensure Request URL is: `https://your-app.vercel.app/api/slack/interactive`
- Must be HTTPS (not HTTP) for production

### "Admin required" error when connecting

**Cause:** Only admins can connect Slack

**Fix:**
- Ask an organization admin to connect Slack
- Or promote user to admin role

## Security Notes

### Bot Token Encryption

Bot tokens are encrypted before storage using AES-256:
- Encryption key from `ENCRYPTION_KEY` env var
- Never stored in plaintext
- Decrypted only when sending messages

### Request Verification

All Slack requests are verified using HMAC-SHA256:
- Prevents unauthorized requests
- Uses signing secret from Slack
- Protects against replay attacks

### RLS Policies

Slack user data is protected with Row-Level Security:
- Users can only see Slack users in their org
- Admins can manage Slack users
- Prevents cross-org data leaks

## How It Works

### User Matching:

1. When Slack is connected, we sync all workspace users
2. Match Slack users to DealPress users by email
3. Store mapping in `slack_users` table
4. When sending notifications, lookup Slack user ID by email

### Notification Flow:

```
1. Approval request created
   ↓
2. Check if org has Slack enabled
   ↓
3. Find approver's Slack user by email
   ↓
4. Send DM with approval details + buttons
   ↓
5. Approver clicks button in Slack
   ↓
6. Interactive webhook receives action
   ↓
7. Verify user is the assigned approver
   ↓
8. Update approval step in database
   ↓
9. Update Slack message to show approval
   ↓
10. Notify next approver (if any)
```

## API Endpoints

### `/api/slack/oauth` (GET)
- Handles Slack OAuth callback
- Exchanges code for access token
- Stores encrypted bot token
- Syncs workspace users

### `/api/slack/interactive` (POST)
- Handles button clicks from Slack
- Verifies request signature
- Processes approve/reject actions
- Updates database and message

### `/api/slack/disconnect` (POST)
- Disconnects Slack integration
- Clears bot token and workspace ID
- Requires admin role

## Database Schema

### `organizations` table additions:
```sql
slack_workspace_id TEXT       -- Slack team ID
slack_bot_token TEXT          -- Encrypted bot token
slack_enabled BOOLEAN         -- Integration enabled
slack_channel_id TEXT         -- Default channel (future)
```

### `slack_users` table:
```sql
id UUID                       -- Primary key
organization_id UUID          -- References organizations
user_id UUID                  -- References auth.users (nullable)
slack_user_id TEXT           -- Slack's user ID
slack_email TEXT             -- For matching
slack_display_name TEXT      -- Display name
```

## Future Enhancements

- [ ] Channel notifications (not just DMs)
- [ ] Custom channel routing per template
- [ ] Slack commands (/dealpress status)
- [ ] Slack app home with pending approvals
- [ ] Team visibility for approved deals

## Support

For issues or questions:
- Check Slack App event logs: https://api.slack.com/apps → Your App → Event Subscriptions
- Check DealPress logs in Vercel
- Verify webhook URLs are accessible
- Test with Slack API tester

---

**Estimated Setup Time:** 15 minutes
**Difficulty:** Medium
**Requirements:** Pro tier subscription, Admin role

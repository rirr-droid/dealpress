# Resend Email Setup

This guide walks you through setting up Resend for email notifications in DealPress.

## Prerequisites

- Completed Supabase setup (see SUPABASE_SETUP.md)
- Resend account (sign up at https://resend.com)
- A verified domain (optional for production, not needed for testing)

## Step 1: Create Resend Account

1. Go to [Resend.com](https://resend.com) and sign up
2. Navigate to **API Keys** in the dashboard
3. Click **Create API Key**
4. Give it a name (e.g., "DealPress Production")
5. Copy the API key (starts with `re_`)

## Step 2: Add Environment Variable

Add this to your `.env.local`:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here

# Email sender (use verified domain in production)
RESEND_FROM_EMAIL=DealPress <onboarding@resend.dev>
```

**For Development:**
- Use `onboarding@resend.dev` as the from email (pre-verified by Resend)
- Emails will only be sent to verified emails in your Resend account

**For Production:**
- Verify your own domain in Resend
- Use your domain: `DealPress <approvals@yourdomain.com>`

## Step 3: Verify Your Domain (Production Only)

1. Go to Resend Dashboard → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records provided by Resend to your domain:
   - MX record
   - TXT record for SPF
   - TXT record for DKIM
5. Click **Verify DNS Records**
6. Once verified, you can send from `*@yourdomain.com`

## Step 4: Add Test Email Recipients (Development)

In development mode with `onboarding@resend.dev`, emails only go to verified addresses:

1. Go to Resend Dashboard → **API Keys** → **Settings**
2. Add your email address to the verified list
3. You'll receive a verification email

## Email Templates

DealPress includes three beautiful email templates:

### 1. Approval Needed
Sent when someone is assigned to approve a request.

**Trigger:** New request created, or previous step approved

**Content:**
- Deal name and amount
- Requester name
- Reason for approval
- One-click "Review Request" button

### 2. Request Approved
Sent to requester when all approvals are complete.

**Trigger:** Final approval step completed

**Content:**
- Success banner
- Deal name and amount
- Approver name
- Optional comments
- "View Details" button

### 3. Request Rejected
Sent to requester when request is rejected.

**Trigger:** Any approval step rejected

**Content:**
- Rejection banner
- Deal name and amount
- Rejecter name
- Required rejection reason
- "View Details" button

### 4. Step Approved (Progress Update)
Sent to requester when a step is approved but more steps remain.

**Trigger:** Intermediate step approved

**Content:**
- Progress update
- Next step name
- Next approver name

## Email Event Flow

```
User creates request
  ↓
First approver receives "Approval Needed" email
  ↓
Approver clicks "Review Request" → Opens app
  ↓
Approver approves
  ↓
If more steps: Next approver gets "Approval Needed"
               Requester gets "Step Approved" (progress update)
If final step: Requester gets "Request Approved"
  ↓
Done
```

## Testing Emails Locally

### Option 1: Real Emails (Recommended)

1. Add `RESEND_API_KEY` to `.env.local`
2. Use `onboarding@resend.dev` as from email
3. Add your email to Resend verified list
4. Create a test request in the app
5. Check your inbox!

### Option 2: Preview in Development

```bash
# Install React Email dev server
npm install -g @react-email/cli

# Preview emails
npm run email
```

This opens a browser at `http://localhost:3000` where you can:
- See all email templates
- Test with different data
- Check responsive design
- Export HTML

## Email Sending Limits

### Free Tier
- 100 emails per day
- 3,000 emails per month
- Perfect for testing and small teams

### Pro Tier ($20/month)
- 50,000 emails per month
- Custom sending domain
- Better deliverability
- Email analytics

## Troubleshooting

**Emails not sending**
- Check `RESEND_API_KEY` is set correctly
- Verify no typos in environment variable
- Check Resend dashboard for error logs
- Ensure recipient email is verified (dev mode)

**Emails going to spam**
- In production, verify your domain
- Add SPF and DKIM records
- Use a real sender address (not @resend.dev)
- Avoid spam trigger words in subject/body

**"Email service not configured" error**
- `RESEND_API_KEY` is missing from `.env.local`
- Restart your dev server after adding the key

## Environment Variables Summary

```bash
# Required
RESEND_API_KEY=re_xxx

# Optional (defaults to onboarding@resend.dev)
RESEND_FROM_EMAIL=DealPress <approvals@yourdomain.com>
```

## Email Preferences (Coming Soon)

Users will be able to control which emails they receive:

- ✅ Approval needed
- ✅ Request approved
- ✅ Request rejected
- ✅ Progress updates
- One-click approvals via email

Settings page will allow granular control per notification type.

## Production Checklist

Before going live:

- [ ] Verify your domain in Resend
- [ ] Add DNS records (MX, SPF, DKIM)
- [ ] Update `RESEND_FROM_EMAIL` to use your domain
- [ ] Test email delivery
- [ ] Check spam scores (use mail-tester.com)
- [ ] Monitor Resend analytics
- [ ] Set up email bounce handling

## Support

- Resend Documentation: https://resend.com/docs
- Resend Dashboard: https://resend.com/dashboard
- React Email: https://react.email
- DealPress Email Templates: `lib/email/templates/`

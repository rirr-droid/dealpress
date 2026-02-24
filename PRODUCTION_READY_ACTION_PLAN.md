# DealPress - Production Ready Action Plan

## ✅ What We Just Completed

### Code Changes (Already Deployed)
- [x] Fixed settings page redirect bug (now allows 'admin' and 'owner' roles)
- [x] Added comprehensive security headers (X-Frame-Options, CSP, etc.)
- [x] Implemented API rate limiting system
- [x] Applied rate limiting to checkout endpoint
- [x] Created Terms of Service page at `/legal/terms`
- [x] Created Privacy Policy page at `/legal/privacy`
- [x] Fixed Analytics page pricing ($49/mo instead of $10)
- [x] Fixed Stripe webhook timestamp bug

### SQL Scripts Created (You Need to Run These)
- [x] `delete_all_users_clean_start_v2.sql` - Clean database
- [x] `fix_admin_role_trigger.sql` - Fix role assignment for new users

---

## 🚨 CRITICAL - Do These NOW (Before Launch)

### 1. Clean Your Database (5 minutes)
**Location:** Supabase SQL Editor

Run this SQL script:
```bash
~/dealpress/delete_all_users_clean_start_v2.sql
```

This will delete ALL test users, organizations, and data to give you a clean slate.

### 2. Fix Admin Role Trigger (2 minutes)
**Location:** Supabase SQL Editor

Run this SQL script:
```bash
~/dealpress/fix_admin_role_trigger.sql
```

This ensures new signups get 'admin' role and can access /settings page.

### 3. Switch Stripe to LIVE Mode (30 minutes)

#### A. Create LIVE Products in Stripe
1. Go to https://dashboard.stripe.com (switch to LIVE mode - toggle top right)
2. Create two products:

**Professional Plan:**
- Name: DealPress Professional
- Price: $49/month
- Copy Price ID and Product ID

**Business Plan:**
- Name: DealPress Business
- Price: $99/month
- Copy Price ID and Product ID

#### B. Update Environment Variables in Vercel
1. Go to Vercel Dashboard → DealPress project → Settings → Environment Variables
2. Update these variables:

```bash
# Switch to LIVE API keys
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY

# Update to LIVE price/product IDs
STRIPE_PROFESSIONAL_PRICE_ID=price_YOUR_LIVE_PRICE_ID
STRIPE_PROFESSIONAL_PRODUCT_ID=prod_YOUR_LIVE_PRODUCT_ID
STRIPE_BUSINESS_PRICE_ID=price_YOUR_LIVE_PRICE_ID
STRIPE_BUSINESS_PRODUCT_ID=prod_YOUR_LIVE_PRODUCT_ID
```

#### C. Set Up LIVE Webhook
1. Go to https://dashboard.stripe.com/webhooks (in LIVE mode)
2. Click "Add endpoint"
3. Endpoint URL: `https://dealpress.ai/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the signing secret (starts with `whsec_`)
6. Update in Vercel: `STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_SECRET`

#### D. Redeploy
After updating environment variables, trigger a redeploy in Vercel (or it will auto-deploy).

### 4. Set Up Custom Email Domain (1 hour)

**Current Issue:** You're using `onboarding@resend.dev` which will be flagged as spam.

#### Steps:
1. Go to https://resend.com/domains
2. Add domain: `dealpress.ai` (or `mail.dealpress.ai`)
3. Add the DNS records they provide to your domain registrar:
   - SPF record
   - DKIM record
   - DMARC record
4. Wait for verification (can take up to 48 hours, usually < 1 hour)
5. Update in Vercel: `RESEND_FROM_EMAIL=noreply@dealpress.ai`
6. Redeploy

---

## ⚠️ IMPORTANT - Do These Before Marketing (This Week)

### 5. Manual Testing (2-3 hours)
Test these critical flows end-to-end:

- [ ] **Signup flow**
  - Create account with email
  - Verify you get 'admin' role (check Settings page access)
  - Verify organization is created

- [ ] **Template creation**
  - Create approval template
  - Add approval steps
  - Test sequential vs parallel approvals

- [ ] **Request flow**
  - Create approval request
  - Submit request
  - Approve/reject as approver
  - Verify email notifications work

- [ ] **Upgrade flow** (USE REAL CARD - THEN CANCEL)
  - Click "Upgrade to Professional"
  - Complete Stripe checkout with real card
  - Verify subscription shows in /settings/billing
  - Verify features unlock
  - **IMPORTANT:** Cancel subscription immediately in Stripe billing portal

- [ ] **Team management**
  - Invite team member
  - Accept invitation
  - Test member vs admin permissions

- [ ] **Slack integration** (if offering this feature)
  - Connect Slack workspace
  - Test notifications
  - Disconnect

### 6. Mobile Testing (1 hour)
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Verify responsive design works
- [ ] Test forms and buttons on mobile
- [ ] Check that tables/dashboards scroll properly

### 7. Security Audit (30 minutes)
- [ ] Review RLS policies in Supabase (Tables → Select table → Policies)
- [ ] Verify sensitive routes require authentication
- [ ] Test rate limiting (try hitting checkout endpoint 10 times rapidly)
- [ ] Check that file uploads have size limits
- [ ] Verify no API keys are exposed in client-side code

### 8. Set Up Error Tracking - Sentry (30 minutes)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

1. Create account at https://sentry.io
2. Follow wizard to configure
3. Add `SENTRY_DSN` to Vercel environment variables
4. Test by triggering an error
5. Verify error shows in Sentry dashboard

### 9. Performance Check (30 minutes)
- [ ] Run Lighthouse audit in Chrome DevTools
- [ ] Aim for 90+ score on Performance, Accessibility, Best Practices, SEO
- [ ] Fix any critical issues (usually images not optimized, missing alt text, etc.)
- [ ] Test load time on slow 3G connection

### 10. Content Updates (1 hour)
- [ ] Update email templates with proper branding
- [ ] Verify Terms of Service has correct contact info
- [ ] Verify Privacy Policy has correct contact info
- [ ] Check all hardcoded "DealPress" mentions are consistent
- [ ] Add footer with links to Terms, Privacy, Support

---

## 📋 NICE TO HAVE - Can Do After Launch

### Week 1 Post-Launch
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Create help documentation/FAQ
- [ ] Add in-app tooltips for complex features
- [ ] Set up customer support system (Intercom or email)
- [ ] Create demo video

### Week 2 Post-Launch
- [ ] Beta test with 5-10 real users
- [ ] Collect feedback and iterate
- [ ] A/B test pricing page
- [ ] Optimize conversion funnel
- [ ] Add analytics tracking (Plausible, GA4)

---

## 🎯 Pre-Launch Checklist Summary

Before you start marketing and accepting REAL payments, verify:

**Database:**
- [ ] All test data deleted
- [ ] Admin role trigger fixed

**Stripe:**
- [ ] Switched to LIVE mode
- [ ] Live products created ($49 Professional, $99 Business)
- [ ] Live webhook configured
- [ ] Environment variables updated to live keys
- [ ] Tested with real card (then canceled)

**Emails:**
- [ ] Custom domain verified in Resend
- [ ] Email deliverability tested (Gmail, Outlook)
- [ ] All email flows working

**Security:**
- [ ] Security headers deployed
- [ ] Rate limiting working
- [ ] RLS policies reviewed
- [ ] Error tracking (Sentry) set up

**Legal:**
- [ ] Terms of Service accessible at /legal/terms
- [ ] Privacy Policy accessible at /legal/privacy
- [ ] Contact info updated in both

**Testing:**
- [ ] All critical user flows tested
- [ ] Mobile responsive verified
- [ ] Performance score 90+
- [ ] No console errors

---

## 📅 Timeline to Production

**Today (Day 1):**
- Run SQL scripts (clean database, fix trigger)
- Switch Stripe to live mode
- Test with real card

**Day 2:**
- Set up custom email domain
- Manual testing of all flows
- Mobile testing

**Day 3:**
- Set up Sentry
- Performance optimization
- Security audit

**Day 4-5:**
- Content polish
- Final testing
- Invite beta testers

**Day 6-7:**
- Soft launch to small audience
- Monitor closely
- Fix any issues

**Week 2:**
- Full marketing push!

---

## 🆘 If Something Goes Wrong

### Webhook Not Working
1. Check Stripe Dashboard → Webhooks → Events tab
2. Look for failed events (red X)
3. Click on event to see error message
4. Verify `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint

### Users Can't Access Settings
1. Check their role in database:
   ```sql
   SELECT role FROM organization_members WHERE user_id = 'USER_ID';
   ```
2. Should be 'admin' or 'owner'
3. If not, update: `UPDATE organization_members SET role = 'admin' WHERE user_id = 'USER_ID';`

### Emails Not Sending
1. Check Resend Dashboard → Logs
2. Verify domain is verified (green checkmark)
3. Test with: `curl -X POST https://dealpress.ai/api/test-email`
4. Check spam folder

### Payment Failing
1. Check Stripe Dashboard → Logs
2. Verify price IDs match (test vs live)
3. Ensure webhook secret is correct
4. Check Vercel logs for errors

---

## ✅ You're Ready When...

- [ ] You can signup, create a template, submit a request, and approve it
- [ ] You can upgrade to Pro with a real card
- [ ] You receive emails at every step
- [ ] The subscription shows correctly in Stripe and your database
- [ ] Settings page is accessible
- [ ] Mobile version works smoothly
- [ ] No console errors or warnings
- [ ] Lighthouse score is 90+

**Then you're ready to market and accept real customers!** 🚀

---

## 📞 Support

If you get stuck on any of these steps, check:
- Stripe Docs: https://stripe.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Resend Docs: https://resend.com/docs

---

**Good luck with the launch! You've got this! 💪**

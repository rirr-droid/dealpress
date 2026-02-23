# DealPress Billing & Stripe Setup Guide

This guide will walk you through setting up Stripe billing to start accepting payments for Pro subscriptions.

## Overview

DealPress uses Stripe for subscription billing with the following pricing tiers:

### Free Tier
- ✅ 5 approval requests per month
- ✅ Unlimited templates
- ✅ 1 user
- ✅ Email notifications

### Pro Tier - $10/month
- ✅ **Unlimited** approval requests
- ✅ **Unlimited** templates
- ✅ **Unlimited** users
- ✅ Slack integration
- ✅ SLA tracking
- ✅ Analytics dashboard

---

## Step 1: Database Migration

First, run the database migration to add subscription fields to your organizations table.

### Option A: Using Supabase CLI (Recommended)
```bash
cd dealpress
npx supabase db push
```

### Option B: Manual SQL Execution
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Run the SQL in `supabase/migrations/010_add_subscription_billing.sql`

---

## Step 2: Create Stripe Account & Products

### 2.1 Sign Up for Stripe
1. Go to [stripe.com](https://stripe.com)
2. Create an account (or sign in)
3. You'll start in **Test Mode** (good for development)

### 2.2 Create Pro Plan Product
1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Click **+ Add product**
3. Fill in the details:
   - **Name**: `DealPress Pro`
   - **Description**: `Unlimited approval requests, templates, users, Slack integration, and analytics`
   - **Pricing model**: `Standard pricing`
   - **Price**: `$10.00 USD`
   - **Billing period**: `Monthly`
   - **Payment behavior**: `Charge automatically`
4. Click **Add product**
5. **Copy the Price ID** (starts with `price_...`) - you'll need this!
6. **Copy the Product ID** (starts with `prod_...`) - you'll need this too!

---

## Step 3: Configure Stripe Webhooks

Webhooks notify your app when subscription events occur (e.g., payment succeeded, subscription canceled).

### 3.1 Production Webhook (After Deployment)
1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **+ Add endpoint**
3. Set **Endpoint URL**: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Click **Select events**
5. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **Add endpoint**
7. **Copy the Signing Secret** (starts with `whsec_...`)

### 3.2 Local Development Webhook (Optional)
For testing locally, use the Stripe CLI:

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-brew/stripe
# Windows: scoop install stripe
# Or download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will output a webhook signing secret - copy it for .env.local
```

---

## Step 4: Configure Environment Variables

### 4.1 Get Your Stripe API Keys
1. Go to [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_...` for test mode)
3. Click **Reveal** on **Secret key** and copy it (starts with `sk_test_...`)

### 4.2 Update Vercel Environment Variables (Production)
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `dealpress` project
3. Go to **Settings → Environment Variables**
4. Add the following variables:

| Name | Value | Notes |
|------|-------|-------|
| `STRIPE_SECRET_KEY` | `sk_test_xxx` | Your Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxx` | Your Stripe publishable key |
| `STRIPE_PRO_PRICE_ID` | `price_xxx` | Price ID from Step 2.2 |
| `STRIPE_PRO_PRODUCT_ID` | `prod_xxx` | Product ID from Step 2.2 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxx` | Signing secret from Step 3.1 |

5. Click **Save** for each variable
6. **Redeploy** your application for changes to take effect

### 4.3 Update Local .env.local (Development)
Add these to your `.env.local` file:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Stripe Product/Price IDs
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_PRO_PRODUCT_ID=prod_xxx

# Stripe Webhook Secret (from Stripe CLI or dashboard)
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Step 5: Test the Integration

### 5.1 Test Checkout Flow
1. Start your dev server: `npm run dev`
2. Log in to DealPress
3. Go to **Settings → Billing**
4. Click **Upgrade to Pro - $10/month**
5. You'll be redirected to Stripe Checkout
6. Use a test card:
   - **Card number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)
7. Complete the checkout
8. You should be redirected back with `?success=true`
9. Verify your plan shows as **Pro** on the billing page

### 5.2 Test Webhook Events
1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Click on your webhook endpoint
3. View the **Recent deliveries** to see if events are being received
4. Check the response status (should be `200`)

### 5.3 Test Billing Portal
1. While on a Pro plan, click **Manage Billing**
2. You should be redirected to Stripe's billing portal
3. From here you can:
   - Update payment method
   - View invoices
   - Cancel subscription

---

## Step 6: Go Live with Production Keys

Once you've tested everything and are ready to accept real payments:

### 6.1 Activate Your Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Activate your account** in the banner
3. Complete the business verification process
4. This may take 1-2 business days

### 6.2 Switch to Live Mode
1. Toggle from **Test mode** to **Live mode** in the top right
2. Recreate your Pro product in Live mode (same as Step 2.2)
3. Create a new webhook endpoint for production (same as Step 3.1)
4. Get your **Live API keys** (starts with `pk_live_` and `sk_live_`)

### 6.3 Update Production Environment Variables
In Vercel, update these variables with your **Live** keys:
- `STRIPE_SECRET_KEY` → `sk_live_xxx`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_xxx`
- `STRIPE_PRO_PRICE_ID` → `price_xxx` (new live price ID)
- `STRIPE_PRO_PRODUCT_ID` → `prod_xxx` (new live product ID)
- `STRIPE_WEBHOOK_SECRET` → `whsec_xxx` (new live webhook secret)

Redeploy after updating!

---

## Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | ✅ Successful payment |
| `4000 0000 0000 9995` | ❌ Declined payment |
| `4000 0000 0000 3220` | 🔒 Requires 3D Secure authentication |
| `4000 0000 0000 0341` | ❌ Charge succeeds but card is flagged as fraudulent |

---

## Troubleshooting

### "No billing information found"
- Make sure the webhook is configured correctly
- Check that the webhook secret matches what's in your environment variables
- Verify the `checkout.session.completed` event is being received

### Webhook not receiving events
1. Check the endpoint URL is correct (must be publicly accessible)
2. Verify the signing secret matches
3. Check Stripe Dashboard → Webhooks → Recent deliveries for errors
4. For local dev, make sure `stripe listen` is running

### Subscription status not updating
1. Check webhook logs in Stripe Dashboard
2. Verify Supabase service role key has permission to update organizations table
3. Check the `organization_id` metadata is being passed correctly

### "Invalid API key" error
- Ensure you're using the correct keys (test vs live)
- Check for extra spaces or quotes in environment variables
- Verify the key starts with `sk_test_` or `sk_live_`

---

## Security Best Practices

✅ **Never commit API keys** to version control
✅ **Use test mode** for development
✅ **Verify webhook signatures** (already implemented)
✅ **Use service role key** for webhook updates (bypasses RLS)
✅ **Rotate keys** if compromised
✅ **Monitor webhook failures** in Stripe Dashboard

---

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Test Cards**: https://stripe.com/docs/testing
- **Stripe CLI**: https://stripe.com/docs/stripe-cli

---

## What's Already Implemented

✅ **Database schema** for subscriptions
✅ **Stripe checkout** API route
✅ **Billing portal** API route
✅ **Webhook handlers** for all subscription events
✅ **Usage tracking** and limits enforcement
✅ **Billing UI** with usage stats
✅ **Free tier** with 5 requests/month
✅ **Pro tier** with unlimited requests/users

All you need to do is add your Stripe keys and you're ready to accept payments! 🚀

# Stripe Integration Setup

This guide walks you through setting up Stripe for DealPress billing.

## Prerequisites

- Completed Supabase setup (see SUPABASE_SETUP.md)
- Stripe account (sign up at https://stripe.com)

## Step 1: Add Subscription Fields to Database

Run this SQL in your Supabase SQL Editor to add billing fields:

```sql
-- Add subscription fields to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer
ON organizations(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_organizations_stripe_subscription
ON organizations(stripe_subscription_id);

-- Add comments
COMMENT ON COLUMN organizations.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN organizations.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN organizations.subscription_plan IS 'free or pro';
COMMENT ON COLUMN organizations.subscription_status IS 'active, canceled, past_due, etc';
```

## Step 2: Create Stripe Products and Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Add Product**
3. Create the Pro plan:
   - **Name**: DealPress Pro
   - **Description**: Unlimited approval requests, templates, and up to 50 users
   - **Pricing**: $10/month (recurring)
   - **Billing period**: Monthly
4. After creating, copy the **Price ID** (starts with `price_xxx`)
5. Copy the **Product ID** (starts with `prod_xxx`)

## Step 3: Configure Stripe Webhook

1. Go to **Developers** → **Webhooks** → **Add Endpoint**
2. Set endpoint URL: `https://your-domain.com/api/webhooks/stripe`
   - For local testing: Use Stripe CLI (see below)
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Signing Secret** (starts with `whsec_xxx`)

## Step 4: Add Environment Variables

Add these to your `.env.local`:

```bash
# Stripe API Keys (get from Stripe Dashboard → Developers → API keys)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Stripe Product/Price IDs (from Step 2)
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_PRO_PRODUCT_ID=prod_xxx

# Stripe Webhook Secret (from Step 3)
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Step 5: Test Locally with Stripe CLI (Optional)

For local webhook testing:

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-brew/stripe
# Windows: scoop install stripe
# Or download from: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret and add to .env.local
```

## Step 6: Test the Integration

1. Start your dev server: `npm run dev`
2. Go to Settings → Billing
3. Click "Upgrade to Pro"
4. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete checkout
6. Verify subscription appears in Settings

## Stripe Test Cards

| Card Number         | Behavior                    |
|---------------------|----------------------------|
| 4242 4242 4242 4242 | Successful payment         |
| 4000 0000 0000 9995 | Declined payment           |
| 4000 0000 0000 3220 | 3D Secure authentication   |

## Production Checklist

Before going live:

- [ ] Switch to live API keys in production environment
- [ ] Update webhook endpoint to production URL
- [ ] Test complete flow with live mode test card
- [ ] Set up tax collection if required
- [ ] Configure email receipts in Stripe settings
- [ ] Enable Stripe Radar for fraud prevention
- [ ] Set up customer notifications

## Pricing Tiers

### Free Plan
- 5 approval requests per month
- 2 approval templates
- 1 user
- Basic email notifications

### Pro Plan ($10/month)
- Unlimited approval requests
- Unlimited templates
- Up to 50 users
- Priority support
- Advanced analytics (coming soon)

## Webhook Event Flow

```
User clicks "Upgrade to Pro"
  ↓
Create Stripe Checkout Session (API Route)
  ↓
User completes payment
  ↓
Stripe sends webhook: checkout.session.completed
  ↓
Update organization in database:
  - subscription_plan = 'pro'
  - subscription_status = 'active'
  - stripe_customer_id
  - stripe_subscription_id
  ↓
User redirected to success page
```

## Troubleshooting

**Webhook not receiving events**
- Check endpoint URL is correct
- Verify webhook secret matches
- Test with Stripe CLI locally
- Check Stripe Dashboard → Webhooks for delivery logs

**"Invalid API key" error**
- Ensure STRIPE_SECRET_KEY is set in .env.local
- Check you're using the correct key (test vs live)
- Verify no extra spaces in environment variable

**Subscription not updating**
- Check webhook logs in Stripe Dashboard
- Verify organization_id metadata is passed correctly
- Check database for organization with matching stripe_customer_id

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Dashboard: https://dashboard.stripe.com
- Test your integration: https://stripe.com/docs/testing

# Set Up Stripe Webhook (Required for Subscriptions to Work)

## The Problem
You successfully paid, but your account still shows "Starter" plan because:
- Stripe sent the webhook event to your app
- BUT the webhook isn't configured, so your database never got updated

## Solution: Set Up the Webhook

### Step 1: Go to Stripe Webhooks Page
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"** button

### Step 2: Configure the Endpoint
Fill in these details:

**Endpoint URL:**
```
https://dealpress.ai/api/webhooks/stripe
```

**Description:** (optional)
```
DealPress subscription webhooks
```

**Events to send:**
Click "Select events" and choose these specific events:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### Step 3: Save and Get Signing Secret
1. Click **"Add endpoint"**
2. You'll see your new webhook endpoint
3. Click on it to view details
4. Click **"Reveal"** next to "Signing secret"
5. **Copy the signing secret** (starts with `whsec_test_...`)

### Step 4: Update Environment Variable
1. Go to **Vercel Dashboard** → Your DealPress project
2. **Settings** → **Environment Variables**
3. Add/Update this variable:
```
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_SECRET_HERE
```
4. **Redeploy** your application

### Step 5: Test the Webhook
After redeploying:
1. Go back to your webhook in Stripe Dashboard
2. Click **"Send test webhook"** button
3. Select `checkout.session.completed` event
4. Click **"Send test webhook"**
5. You should see a ✅ green checkmark showing it succeeded

## Verify It Works

After setting up the webhook, you have two options:

### Option A: Make a New Test Subscription
1. Go to https://dealpress.ai/settings/billing
2. Click "Upgrade to Professional"
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. You should immediately see "Professional" plan in your account

### Option B: Manually Update Database (Quick Fix for Current Subscription)
If you don't want to create a new subscription, run this SQL in Supabase:

```sql
-- Get your Stripe customer ID and subscription ID from Stripe Dashboard
-- Then update your organization:

UPDATE organizations
SET 
  stripe_customer_id = 'cus_YOUR_CUSTOMER_ID_FROM_STRIPE',
  stripe_subscription_id = 'sub_YOUR_SUBSCRIPTION_ID_FROM_STRIPE',
  subscription_plan = 'professional',
  subscription_status = 'active',
  subscription_tier = 'pro'
WHERE id = (
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'rirr@tepper.cmu.edu'
  )
  LIMIT 1
);
```

## How to Find Your Stripe IDs (for Option B)

1. Go to https://dashboard.stripe.com/test/customers
2. Find your customer (email: rirr@tepper.cmu.edu)
3. Click on the customer
4. Copy the **Customer ID** (starts with `cus_`)
5. Click on the subscription in the customer details
6. Copy the **Subscription ID** (starts with `sub_`)

## Troubleshooting

### Webhook returns 400/500 error
- Check that `STRIPE_WEBHOOK_SECRET` is set correctly in Vercel
- Make sure you redeployed after adding the secret

### Still showing Starter plan
- Check webhook logs in Stripe Dashboard to see if events are being sent
- Run the SQL query from Option B above to manually verify/fix

### "Signature verification failed"
- The webhook secret doesn't match
- Make sure you copied the FULL secret including `whsec_test_`

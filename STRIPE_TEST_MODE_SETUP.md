# Stripe Test Mode Setup Guide

## Problem
You're getting this error:
```
No such price: 'price_1T48wJD7dX0po8X2A9iOkqfK'; a similar object exists in live mode, but a test mode key was used to make this request.
```

This happens because:
- You switched to **TEST API keys**
- But your Price IDs are still pointing to **LIVE mode** products

## Solution: Create Test Mode Products in Stripe

### Step 1: Switch to Test Mode in Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Toggle to **Test mode** (switch in top right)
3. Confirm you see "Test mode" indicator

### Step 2: Create Professional Plan Product
1. Go to **Products** → Click **+ Add product**
2. Fill in:
   - **Name**: `DealPress Professional`
   - **Description**: `Professional plan with 50 requests/month, unlimited templates, up to 5 users`
   - **Pricing model**: `Standard pricing`
   - **Price**: `$49.00` USD
   - **Billing period**: `Monthly`
3. Click **Save product**
4. **Copy the Price ID** (starts with `price_test_...`)
5. **Copy the Product ID** (starts with `prod_...`)

### Step 3: Create Business Plan Product
1. Click **+ Add product** again
2. Fill in:
   - **Name**: `DealPress Business`
   - **Description**: `Business plan with unlimited requests, templates, up to 15 users`
   - **Pricing model**: `Standard pricing`
   - **Price**: `$99.00` USD
   - **Billing period**: `Monthly`
3. Click **Save product**
4. **Copy the Price ID** (starts with `price_test_...`)
5. **Copy the Product ID** (starts with `prod_...`)

### Step 4: Update Environment Variables

Go to your hosting platform (Vercel/etc) and update these variables:

```bash
# Test mode API keys (from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Professional Plan (from Step 2)
STRIPE_PROFESSIONAL_PRICE_ID=price_test_YOUR_PROFESSIONAL_PRICE_ID
STRIPE_PROFESSIONAL_PRODUCT_ID=prod_YOUR_PROFESSIONAL_PRODUCT_ID

# Business Plan (from Step 3)
STRIPE_BUSINESS_PRICE_ID=price_test_YOUR_BUSINESS_PRICE_ID
STRIPE_BUSINESS_PRODUCT_ID=prod_YOUR_BUSINESS_PRODUCT_ID

# Webhook secret (we'll set this up next)
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_WEBHOOK_SECRET
```

### Step 5: Set Up Test Webhook (Optional for now)
1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://dealpress.ai/api/webhooks/stripe`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. Copy the **Signing secret** (starts with `whsec_test_...`)
6. Update `STRIPE_WEBHOOK_SECRET` environment variable

### Step 6: Redeploy
After updating all environment variables, **redeploy your application**.

## Testing

Once deployed, you can test with these test cards:

### Successful Payment
- **Card**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/28`)
- **CVC**: Any 3 digits (e.g., `222`)
- **ZIP**: Any 5 digits (e.g., `98059`)

### Failed Payment
- **Card**: `4000 0000 0000 0002`
- Same expiry, CVC, ZIP as above

### Requires 3D Secure Authentication
- **Card**: `4000 0025 0000 3155`
- Same expiry, CVC, ZIP as above

## Quick Reference

| Environment | API Key Prefix | Product ID Prefix | Price ID Prefix |
|------------|---------------|------------------|-----------------|
| **Test** | `sk_test_` / `pk_test_` | `prod_` | `price_test_` |
| **Live** | `sk_live_` / `pk_live_` | `prod_` | `price_1...` |

## Common Issues

### "No such price" error
- Make sure your price IDs match the mode (test vs live) of your API keys

### Webhook not working
- Test webhooks have different signing secrets than live webhooks
- Make sure to use the test webhook secret with test mode

### Can't find test products
- Make sure you're in **Test mode** in the Stripe dashboard (top right toggle)

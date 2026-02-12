# 🚀 DealPress Deployment Checklist

Follow these steps IN ORDER to deploy DealPress to production and start making money!

## ✅ Step 1: Supabase Setup (5 minutes)

### 1.1 Create Project
- [ ] Go to https://supabase.com/dashboard
- [ ] Click "New Project"
- [ ] Name: "DealPress Production"
- [ ] Database Password: [Save in password manager]
- [ ] Region: [Choose closest to users]
- [ ] Click "Create new project"
- [ ] ⏰ Wait 2 minutes for provisioning

### 1.2 Run Migration
- [ ] In Supabase, go to SQL Editor
- [ ] Click "New query"
- [ ] Copy contents from `supabase/migrations/step_comments.sql`
- [ ] Paste and click "Run"
- [ ] ✅ Verify table created (should see success message)

### 1.3 Get API Keys
- [ ] Go to Settings → API
- [ ] Copy Project URL → Save as `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy anon public key → Save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy service_role key → Save as `SUPABASE_SERVICE_ROLE_KEY` ⚠️ KEEP SECRET!

---

## ✅ Step 2: Stripe Setup (5 minutes)

### 2.1 Switch to Live Mode
- [ ] Go to https://dashboard.stripe.com
- [ ] Toggle switch from "Test mode" to "Live mode" (top right)

### 2.2 Create Pro Product
- [ ] Go to Products → "+ Add product"
- [ ] Product name: "DealPress Pro"
- [ ] Description: "Unlimited requests, 50 users, advanced features"
- [ ] Pricing model: Standard pricing
- [ ] Price: $10.00 USD
- [ ] Billing period: Monthly
- [ ] Click "Save product"
- [ ] Copy Price ID (starts with `price_`) → Save as `STRIPE_PRO_PRICE_ID`

### 2.3 Get Live API Keys
- [ ] Go to Developers → API keys
- [ ] Click "Reveal test key" for Publishable key
- [ ] Copy → Save as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Click "Reveal test key" for Secret key
- [ ] Copy → Save as `STRIPE_SECRET_KEY` ⚠️ KEEP SECRET!

---

## ✅ Step 3: Resend Setup (3 minutes)

### 3.1 Create Account
- [ ] Go to https://resend.com/signup
- [ ] Sign up with email
- [ ] Verify email

### 3.2 Get API Key
- [ ] Go to API Keys
- [ ] Click "Create API Key"
- [ ] Name: "DealPress Production"
- [ ] Click "Create"
- [ ] Copy key → Save as `RESEND_API_KEY`

### 3.3 Set Email Address
For now, use default:
- [ ] Save `DealPress <onboarding@resend.dev>` as `RESEND_FROM_EMAIL`

(Later: Verify custom domain for professional emails)

---

## ✅ Step 4: Deploy to Vercel (10 minutes)

### 4.1 Sign Up / Login
- [ ] Go to https://vercel.com/signup
- [ ] Sign in with GitHub
- [ ] Authorize Vercel to access your repositories

### 4.2 Import Project
- [ ] Click "Add New..." → "Project"
- [ ] Find "dealpress" repository
- [ ] Click "Import"

### 4.3 Configure Project
- [ ] Framework Preset: Next.js (auto-detected) ✅
- [ ] Root Directory: ./ ✅
- [ ] Build Command: `npm run build` ✅
- [ ] Output Directory: .next ✅

### 4.4 Add Environment Variables
Click "Environment Variables" and add these ONE BY ONE:

**Supabase:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [Paste from Step 1.3]

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Paste from Step 1.3]

Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Paste from Step 1.3]
```

**Stripe:**
```
Name: STRIPE_SECRET_KEY
Value: [Paste from Step 2.3]

Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: [Paste from Step 2.3]

Name: STRIPE_PRO_PRICE_ID
Value: [Paste from Step 2.2]
```

**Resend:**
```
Name: RESEND_API_KEY
Value: [Paste from Step 3.2]

Name: RESEND_FROM_EMAIL
Value: DealPress <onboarding@resend.dev>
```

**App:**
```
Name: NEXT_PUBLIC_APP_URL
Value: https://[your-app-name].vercel.app
(You'll get this after deployment, for now leave as: https://dealpress.vercel.app)
```

### 4.5 Deploy!
- [ ] Click "Deploy"
- [ ] ⏰ Wait 2-3 minutes
- [ ] 🎉 **YOUR APP IS LIVE!**
- [ ] Copy the deployment URL (e.g., `https://dealpress-abc123.vercel.app`)

### 4.6 Update APP_URL
- [ ] In Vercel project, go to Settings → Environment Variables
- [ ] Find `NEXT_PUBLIC_APP_URL`
- [ ] Click "Edit"
- [ ] Update to your actual Vercel URL
- [ ] Click "Save"
- [ ] Go to Deployments → Click "Redeploy" on latest deployment

---

## ✅ Step 5: Configure Stripe Webhook (2 minutes)

### 5.1 Add Webhook Endpoint
- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Click "+ Add endpoint"
- [ ] Endpoint URL: `https://[your-vercel-url].vercel.app/api/webhooks/stripe`
- [ ] Description: "DealPress Production"
- [ ] Listen to: Events on your account

### 5.2 Select Events
Select these 3 events:
- [ ] `checkout.session.completed`
- [ ] `customer.subscription.updated`
- [ ] `customer.subscription.deleted`

### 5.3 Add Signing Secret
- [ ] Click "Add endpoint"
- [ ] Click to reveal "Signing secret"
- [ ] Copy the secret (starts with `whsec_`)
- [ ] Go to Vercel → Settings → Environment Variables
- [ ] Add new variable:
  - Name: `STRIPE_WEBHOOK_SECRET`
  - Value: [Paste signing secret]
- [ ] Save
- [ ] Go to Deployments → Redeploy latest

---

## ✅ Step 6: Test Your Production App! (10 minutes)

### 6.1 Sign Up
- [ ] Visit your Vercel URL
- [ ] Click "Sign Up"
- [ ] Enter your email and password
- [ ] Confirm you can log in

### 6.2 Test Approval Flow
- [ ] Create a new approval request
- [ ] Submit for approval
- [ ] Add a comment
- [ ] Approve the request

### 6.3 Test Payments (Use Test Card)
- [ ] Go to Settings → Billing
- [ ] Click "Upgrade to Pro"
- [ ] Stripe checkout should open
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Expiry: Any future date (e.g., 12/34)
- [ ] CVC: Any 3 digits (e.g., 123)
- [ ] ZIP: Any 5 digits (e.g., 12345)
- [ ] Complete checkout
- [ ] ✅ Verify you're now on Pro plan

### 6.4 Test Team Features
- [ ] Go to Settings → Team
- [ ] Invite a team member
- [ ] Change their role
- [ ] View activity feed

### 6.5 Check Analytics
- [ ] Go to Analytics
- [ ] Verify metrics are showing
- [ ] Go to Activity
- [ ] See your actions logged

---

## ✅ Step 7: Go Live with Real Payments!

### 7.1 Switch Stripe to Live Mode
- [ ] In Stripe Dashboard, make sure you're in "Live mode"
- [ ] Test with real card OR
- [ ] Share app with friends/beta users

### 7.2 Monitor First Revenue
- [ ] Watch Stripe Dashboard for first payment
- [ ] 🎉 **FIRST CUSTOMER!**
- [ ] Set up Stripe email notifications

---

## 🎉 YOU'RE LIVE!

Your SaaS is deployed and ready to make money!

### Share Your App
- Landing page: `https://[your-url].vercel.app`
- Dashboard: `https://[your-url].vercel.app/dashboard`

### Next Steps
1. Share with beta users
2. Gather feedback
3. Monitor Vercel Analytics
4. Track revenue in Stripe
5. Iterate and improve!

### Support
- Vercel Status: https://vercel-status.com
- Supabase Status: https://status.supabase.com
- Stripe Status: https://status.stripe.com

---

## 💰 Expected Metrics

### Month 1 Goals
- 10 sign-ups
- 3-5 paying customers ($30-50 MRR)
- 50+ approval requests processed

### Month 3 Goals
- 50 sign-ups
- 15-20 paying customers ($150-200 MRR)
- 500+ approval requests processed

### Month 6 Goals
- 200 sign-ups
- 60-80 paying customers ($600-800 MRR)
- Break even on infrastructure costs

---

**🚀 GOOD LUCK! YOU'RE GOING TO MAKE IT!**

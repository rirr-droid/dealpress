# DealPress Production Deployment Guide 🚀

**Production-ready SaaS with authentication, payments, email, and team features!**

## Prerequisites
- GitHub account
- Vercel account (free)
- Supabase account (free tier available)
- Stripe account (live mode)
- Resend account (free: 3,000 emails/month)
- Domain name (optional but recommended)

---

## 🚀 Quick Start (30 minutes to production)

### Step 1: Prepare Supabase Database

1. **Create Supabase Project**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Set strong password and pick region
   - Wait ~2 minutes for provisioning

2. **Run Migrations**
   - Go to SQL Editor in Supabase
   - Copy and paste `supabase/migrations/step_comments.sql`
   - Click "Run" to create step_comments table

3. **Get API Credentials**
   - Go to Settings → API
   - Copy:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Configure Stripe

1. **Switch to Live Mode**
   - Go to [dashboard.stripe.com](https://dashboard.stripe.com)
   - Toggle to "Live mode"

2. **Create Pro Product**
   - Products → Add product
   - Name: "DealPress Pro"
   - Price: $10/month recurring
   - Copy Price ID → `STRIPE_PRO_PRICE_ID`

3. **Get API Keys**
   - Developers → API keys
   - Copy Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy Secret key → `STRIPE_SECRET_KEY`

### Step 3: Set Up Resend

1. **Create Account**
   - Sign up at [resend.com](https://resend.com/signup)

2. **Get API Key**
   - API Keys → Create API Key
   - Copy key → `RESEND_API_KEY`

3. **Verify Domain** (recommended)
   - Domains → Add Domain
   - Add DNS records (SPF, DKIM)
   - Use: `DealPress <approvals@yourdomain.com>`
   - OR use: `DealPress <onboarding@resend.dev>` (testing)

### Step 4: Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: production ready - all features complete"
   git push origin master
   ```

2. **Import to Vercel**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - New Project → Import from GitHub
   - Select your repository
   - Framework: Next.js (auto-detected)

3. **Add Environment Variables**
   Click "Environment Variables" and add ALL of these:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

   # Stripe
   STRIPE_SECRET_KEY=sk_live_xxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_PRO_PRICE_ID=price_xxx

   # Resend
   RESEND_API_KEY=re_xxx
   RESEND_FROM_EMAIL=DealPress <approvals@yourdomain.com>

   # App
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - You'll get: `https://dealpress-xxx.vercel.app`

### Step 5: Configure Stripe Webhook

1. **Add Webhook Endpoint**
   - Stripe → Developers → Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

2. **Get Webhook Secret**
   - Copy Signing secret → Add to Vercel env vars as `STRIPE_WEBHOOK_SECRET`
   - Redeploy in Vercel for changes to take effect

---

## ✅ Production Testing Checklist

### Authentication
- [ ] Sign up with new email
- [ ] Log in successfully
- [ ] Log out and back in

### Approval Workflow
- [ ] Create approval request
- [ ] Submit for approval
- [ ] Receive email notification
- [ ] Approve request
- [ ] Add comments to steps
- [ ] View request history

### Payments
- [ ] View billing page (Free plan)
- [ ] Upgrade to Pro ($10/month)
- [ ] Complete Stripe checkout
- [ ] Verify Pro plan activated
- [ ] Check limits removed

### Team Features
- [ ] Invite team member
- [ ] Change member role (admin/member)
- [ ] Remove team member
- [ ] Hit Free tier limit (1 user)

### Analytics & Activity
- [ ] View analytics dashboard
- [ ] Check team performance
- [ ] View activity feed
- [ ] Verify audit logs

### Email Notifications
- [ ] Approval needed email
- [ ] Request approved email
- [ ] Request rejected email

---

## 🌐 Custom Domain (Optional)

### Add Domain to Vercel
1. Vercel project → Settings → Domains
2. Add your domain (e.g., `dealpress.com`)
3. Add DNS records at your registrar:
   - `A` record: `76.76.21.21`
   - OR `CNAME` record: `cname.vercel-dns.com`

4. Wait for DNS propagation (5 mins - 24 hours)
5. SSL auto-provisions

### Update Environment Variables
1. Change `NEXT_PUBLIC_APP_URL` to your domain
2. Update Stripe webhook URL
3. Redeploy

---

## 💰 Revenue Setup

### Pricing Structure
- **Free**: 1 user, 5 requests/month, 2 templates
- **Pro ($10/month)**: 50 users, unlimited requests, unlimited templates

### Stripe Test Cards
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`

### Monitor Revenue
- Stripe Dashboard → Payments
- See MRR (Monthly Recurring Revenue)
- Track churn and growth

---

## 📊 Cost Breakdown

### Monthly Infrastructure (100 users)
- **Vercel**: $20 (Pro plan)
- **Supabase**: $25 (Pro plan)
- **Stripe fees**: ~$33 (100 users × $10 × 3.3%)
- **Resend**: $0 (under 3,000 emails/month)
- **Total**: ~$78/month

### Revenue
- 100 users × $10/month = **$1,000/month**
- **Profit**: ~$922/month 💰

### Free Tier (Testing)
- All services have free tiers for initial testing
- Upgrade as you scale

---

## 🔒 Security Checklist

- [ ] All env vars in Vercel (not in code)
- [ ] `.env.local` in `.gitignore`
- [ ] Supabase RLS enabled on all tables
- [ ] Stripe webhook signature verified
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Strong database password
- [ ] Service role key never exposed to client

---

## 🆘 Troubleshooting

**Build fails:**
- Check Vercel build logs
- Verify all env vars are set
- Test locally: `npm run build`

**Auth not working:**
- Check Supabase URL and keys
- Verify Supabase project is active

**Payments failing:**
- Ensure Stripe in Live mode
- Check webhook secret matches
- Test webhook delivery in Stripe Dashboard

**Emails not sending:**
- Verify Resend API key
- Check domain verification
- Monitor Resend dashboard

---

## 📈 Next Steps

1. ✅ Deploy to production
2. 🎯 Get first 10 paying customers
3. 📊 Monitor analytics and usage
4. 💬 Gather user feedback
5. 🚀 Iterate and improve
6. 💰 Scale revenue!

---

## 📞 Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

**🎉 Congratulations! Your SaaS is live and ready to make money!**

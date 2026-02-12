# ⚡ Deploy DealPress in 5 Minutes

## Step 1: Go to Vercel

🔗 Open: **https://vercel.com/signup**

Click: **"Continue with GitHub"**

![Vercel Login](screenshot would go here)

---

## Step 2: Import Your Repository

Click: **"Add New..." → "Project"**

Find: **"dealpress"** in the list

Click: **"Import"**

![Import Repo](screenshot would go here)

---

## Step 3: Deploy!

You'll see this screen:

```
Framework Preset: Next.js (detected) ✅
Root Directory: ./
Build Command: npm run build
Output Directory: .next
```

**Just click "Deploy"** at the bottom!

⏰ Wait 2-3 minutes...

---

## Step 4: You're Live! 🎉

You'll see:

```
✅ Deployment Complete

Your application is now live at:
https://dealpress-abc123.vercel.app
```

**Click "Visit"** to see your app!

---

## What Works in Demo Mode?

✅ **Full UI** - All pages and design
✅ **Navigation** - Browse all features
✅ **Requests View** - See mock approval requests
✅ **Templates** - See workflow templates
✅ **Dashboard** - See analytics and stats

⚠️ **What Doesn't Work Yet:**

❌ **Signup/Login** - Needs Supabase
❌ **Payments** - Needs Stripe
❌ **Emails** - Needs Resend
❌ **Real Data** - Uses mock data

---

## Ready for Production? 💰

Follow these 3 services setup:

### 1. Supabase (Database + Auth)
- Go to: https://supabase.com/dashboard
- Create new project
- Run migration from `supabase/migrations/step_comments.sql`
- Get 3 API keys

### 2. Stripe (Payments)
- Go to: https://dashboard.stripe.com
- Create "$10/month Pro" product
- Get 2 API keys + webhook secret

### 3. Resend (Emails)
- Go to: https://resend.com
- Get API key

### 4. Add to Vercel
- In Vercel project → Settings → Environment Variables
- Add all 9 environment variables
- Redeploy

**Full guide:** See `DEPLOY_CHECKLIST.md` for detailed steps!

---

## What to Do After Demo Deploy?

1. **Visit your site**: `https://your-url.vercel.app`
2. **Take screenshots** of the UI
3. **Share with 5 friends** for feedback
4. **Set up production** (follow DEPLOY_CHECKLIST.md)
5. **Get your first paying customer!** 💰

---

## Need Help?

- **Vercel not deploying?** Check build logs in Vercel dashboard
- **Want production setup?** Open `DEPLOY_CHECKLIST.md`
- **Questions?** Check `DEPLOYMENT.md` for troubleshooting

---

**🚀 GO DEPLOY NOW!**

Click here: https://vercel.com/new

# DealPress Deployment Guide

## Quick Deploy to Vercel (5 minutes)

### Step 1: Deploy
1. Go to **https://vercel.com/signup**
2. Sign in with your GitHub account
3. Click **"Add New..."** → **"Project"**
4. Import **`rirr-droid/dealpress`**
5. Click **"Deploy"** (Vercel auto-detects Next.js)
6. Wait ~2 minutes

**You'll get:** `https://dealpress-[random].vercel.app`

### Step 2: Share with Customers

**Demo URLs to share:**
- Landing page: `https://your-url.vercel.app`
- Dashboard: `https://your-url.vercel.app/dashboard`
- Templates: `https://your-url.vercel.app/templates`

**What customers will see:**
- Pre-loaded with demo data (5 approval requests, 6 templates)
- Logged in as "Michael Park" (Sales VP)
- 2 pending approvals requiring his review
- Fully interactive approval tracker

### Step 3: Track Usage (Optional)

Vercel Analytics is already installed. To enable:
1. Go to your Vercel project dashboard
2. Click **Analytics** tab
3. View page views, visitors, and performance

## Custom Domain Setup

### Add Your Domain
1. In Vercel project: **Settings** → **Domains**
2. Add domain: `dealpress.com` or `app.dealpress.com`
3. Follow DNS instructions (add CNAME or A record)
4. SSL certificate auto-provisions in ~5 minutes

**Popular Domain Registrars:**
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare

## Environment Variables (Future)

When you add Supabase or other integrations:

1. In Vercel: **Settings** → **Environment Variables**
2. Add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```
3. Redeploy for changes to take effect

## Customer Testing Checklist

- [ ] Deploy to Vercel
- [ ] Test all pages work (landing, dashboard, requests, templates)
- [ ] Share demo URL with beta testers
- [ ] Set up feedback collection (Google Form, Typeform, etc.)
- [ ] Enable Vercel Analytics
- [ ] (Optional) Add custom domain for professional look
- [ ] Monitor analytics and gather feedback

## Feedback Collection Ideas

**Simple Options:**
1. **Tally.so** - Free form builder, embed in app
2. **Google Forms** - Share link after demo
3. **Cal.com** - Book demo calls
4. **Loom** - Ask customers to record their experience

**Add to Settings Page:**
```tsx
<Button>
  <a href="https://forms.gle/your-form">Share Feedback</a>
</Button>
```

## Demo Data Notes

The app currently uses **mock data** in `lib/mock-data.ts`:
- 5 users (Sarah Chen, Michael Park, David Torres, Emily Rodriguez, James Kim)
- 5 approval requests in various states
- 6 workflow templates
- All data resets on page refresh (no database yet)

**For production:** Integrate Supabase or PostgreSQL for persistent data.

## Support

Issues? Check:
- Vercel deployment logs
- Browser console for errors
- Next.js docs: https://nextjs.org/docs

## Next Steps After Testing

1. Collect customer feedback
2. Prioritize feature requests
3. Add authentication (Supabase Auth)
4. Connect to real database
5. Build CRM integrations
6. Set up email notifications

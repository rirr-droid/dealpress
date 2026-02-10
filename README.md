# Dealpress

**Deal approvals, made simple.**

A standalone SaaS approval workflow application for sales teams. Built with Next.js 14, featuring Apple-inspired design and a visual approval tracking system.

## Features

- Visual Approval Tracker - See approval status at a glance with beautiful timelines
- Lightning Fast - One-click approvals
- Team Collaboration - Multi-step approvals with parallel and sequential workflows
- Analytics Dashboard - Track approval times and identify bottlenecks
- CRM Integration Ready - Built to integrate with Salesforce, HubSpot, and more

## Tech Stack

- Framework: Next.js 14 (App Router)
- UI: Tailwind CSS + shadcn/ui
- Animations: Framer Motion
- Icons: Lucide React

## Getting Started

### Phase 1: Development Setup (Current)

```bash
# 1. Install dependencies
npm install

# 2. Set up Supabase
# Follow the complete guide: SUPABASE_SETUP.md
# - Create Supabase project
# - Run database schema
# - Copy API keys to .env.local

# 3. Create .env.local file
cp .env.example .env.local
# Fill in your Supabase credentials

# 4. Run development server
npm run dev

# 5. Create your first account
# Go to http://localhost:3000/signup
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

**⚠️ Important**: You must complete Supabase setup before authentication will work. See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for detailed instructions.

## Demo

The app includes pre-loaded demo data with:
- 5 sample approval requests in different states
- 5 team members with different roles
- 6 approval workflow templates
- Interactive approval tracker showing pending approvals for Michael Park

Navigate to `/dashboard` to see the full experience.

## Deploy to Production

### Option 1: Vercel (Recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Add New Project" and select this repository
4. Click "Deploy" - Vercel auto-detects Next.js settings
5. Your app will be live at `https://your-project.vercel.app`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Option 2: Other Platforms

This is a standard Next.js 14 app and can deploy to:
- Railway
- Netlify
- AWS Amplify
- Cloudflare Pages

### Adding a Custom Domain

In Vercel:
1. Go to Project Settings → Domains
2. Add your domain (e.g., `app.dealpress.com`)
3. Follow DNS configuration instructions
4. SSL certificate is automatic

## Customer Testing Tips

**For Beta Testing:**
1. Deploy to Vercel and get your live URL
2. Share the `/dashboard` link with testers
3. The demo uses Michael Park as the logged-in user
4. Enable Vercel Analytics to track usage
5. Collect feedback via a form or survey tool

**Demo Login Flow:**
Currently using mock data (no auth required). To add authentication:
- Install `@supabase/auth-helpers-nextjs` for user auth
- Add sign-up/login pages
- Protect dashboard routes with middleware

## Roadmap

- [ ] User authentication with Supabase
- [ ] Real database integration
- [ ] Email notifications
- [ ] Salesforce/HubSpot integration
- [ ] One-click email approvals
- [ ] Template builder UI
- [ ] Mobile app

## License

MIT

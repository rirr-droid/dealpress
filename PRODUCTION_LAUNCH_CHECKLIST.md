# DealPress Production Launch Checklist

## 🔐 Security & Authentication

### Critical
- [ ] **Remove test users from database** - Run the cleanup SQL script
- [ ] **Review RLS policies** - Ensure all Supabase tables have proper Row Level Security
- [ ] **Verify admin role assignment** - Fix the handle_new_user() trigger to set role as 'admin' (currently sets 'owner')
- [ ] **Check API rate limiting** - Add rate limiting to prevent abuse
- [ ] **Audit environment variables** - Ensure no sensitive data is exposed in client-side code
- [ ] **Enable CSRF protection** - Verify Next.js middleware is protecting forms
- [ ] **Review file upload security** - Check approval_attachments for size limits, file type validation
- [ ] **SQL injection review** - Audit all raw SQL queries (if any)

### Recommended
- [ ] Add Captcha to signup form (Google reCAPTCHA or Cloudflare Turnstile)
- [ ] Implement 2FA for admin accounts
- [ ] Set up security headers (CSP, X-Frame-Options, etc.) in next.config.mjs
- [ ] Add session timeout/refresh logic
- [ ] Enable Supabase realtime auth events monitoring

---

## 💳 Stripe Production Setup

### Critical - Switch from Test to Live Mode
- [ ] **Create LIVE mode products in Stripe**
  - Professional plan: $49/month
  - Business plan: $99/month
- [ ] **Update environment variables** with LIVE keys:
  ```
  STRIPE_SECRET_KEY=sk_live_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
  STRIPE_PROFESSIONAL_PRICE_ID=price_...
  STRIPE_PROFESSIONAL_PRODUCT_ID=prod_...
  STRIPE_BUSINESS_PRICE_ID=price_...
  STRIPE_BUSINESS_PRODUCT_ID=prod_...
  ```
- [ ] **Set up LIVE mode webhook** at https://dashboard.stripe.com/webhooks
  - Endpoint: `https://dealpress.ai/api/webhooks/stripe`
  - Events: checkout.session.completed, customer.subscription.*, invoice.*
  - Update `STRIPE_WEBHOOK_SECRET=whsec_...` with LIVE secret
- [ ] **Test live mode with real card** (use a card you can refund/cancel immediately)
- [ ] **Verify webhook works in live mode** (check Stripe Dashboard → Webhooks logs)
- [ ] **Set up Stripe tax collection** (if applicable for your regions)
- [ ] **Configure Stripe billing portal** settings (what customers can change)
- [ ] **Add business information** to Stripe account (for invoices/receipts)

### Recommended
- [ ] Set up Stripe Radar rules for fraud prevention
- [ ] Configure invoice/receipt email templates
- [ ] Add promotional code support (already in code, just configure in Stripe)
- [ ] Set up subscription pause/resume logic
- [ ] Configure dunning settings (retry failed payments)

---

## 📧 Email & Notifications

### Critical
- [ ] **Verify custom domain for Resend** - Currently using onboarding@resend.dev (will be flagged as spam)
  - Buy/use your domain: approvals@dealpress.ai or noreply@dealpress.ai
  - Add DNS records for email authentication (SPF, DKIM, DMARC)
  - Verify domain in Resend dashboard
- [ ] **Update RESEND_FROM_EMAIL** environment variable
- [ ] **Test all email flows**:
  - [ ] Magic link login
  - [ ] Team invitation
  - [ ] Approval request notification
  - [ ] Approval granted/rejected
  - [ ] Payment receipts (Stripe handles this)
- [ ] **Check email deliverability** - Send test emails to Gmail, Outlook, Yahoo
- [ ] **Verify email token expiration** - Check JWT_SECRET is set and tokens expire

### Recommended
- [ ] Add unsubscribe links to notification emails
- [ ] Create branded email templates (HTML)
- [ ] Set up email bounce/complaint handling
- [ ] Add email preference center for users
- [ ] Configure Resend webhook for delivery tracking

---

## 🔌 Integrations

### Slack Integration
- [ ] **Verify Slack OAuth credentials** are production-ready
- [ ] **Test Slack notifications** in a real workspace
- [ ] **Check encryption key** for Slack tokens (ENCRYPTION_KEY env var)
- [ ] **Review Slack permissions** requested in OAuth flow
- [ ] **Test Slack disconnection flow**

### Google OAuth (if used)
- [ ] Verify Google OAuth consent screen is approved
- [ ] Test login with multiple Google accounts
- [ ] Check redirect URIs are correct for production domain

---

## 🗄️ Database & Performance

### Critical
- [ ] **Run database cleanup** - Delete all test data, users, organizations
- [ ] **Review database indexes** - Check query performance on large datasets
- [ ] **Set up database backups** in Supabase (automatic, but verify)
- [ ] **Check connection pooling** settings in Supabase
- [ ] **Verify database triggers** are working (handle_new_user, etc.)
- [ ] **Test RLS policies** with different user roles
- [ ] **Review storage policies** for approval_attachments

### Recommended
- [ ] Set up database monitoring/alerts in Supabase
- [ ] Create read replicas if expecting high traffic
- [ ] Optimize slow queries (use EXPLAIN ANALYZE)
- [ ] Set up automatic vacuum/analyze jobs
- [ ] Archive old approval requests (e.g., >1 year old)

---

## 🌐 Domain & DNS

### Critical
- [ ] **Verify custom domain** is pointing to Vercel correctly
- [ ] **Enable HTTPS** (should be automatic with Vercel)
- [ ] **Check SSL certificate** is valid and auto-renewing
- [ ] **Update all hardcoded URLs** in code from localhost to dealpress.ai
- [ ] **Set NEXT_PUBLIC_APP_URL** environment variable to `https://dealpress.ai`
- [ ] **Configure redirects** (e.g., www to non-www)

### Recommended
- [ ] Set up CDN caching rules
- [ ] Configure custom error pages (404, 500)
- [ ] Add robots.txt for SEO
- [ ] Set up analytics domain (if using GA/Plausible)

---

## 📊 Analytics & Monitoring

### Critical
- [ ] **Set up error tracking** - Add Sentry or similar
- [ ] **Configure logging** - Decide what to log in production
- [ ] **Set up uptime monitoring** - Use UptimeRobot, Pingdom, or Vercel's built-in
- [ ] **Add basic analytics** - Google Analytics, Plausible, or Vercel Analytics
- [ ] **Monitor Vercel deployment logs** for errors

### Recommended
- [ ] Set up conversion tracking for signups/upgrades
- [ ] Create dashboard for key metrics (MRR, churn, active users)
- [ ] Configure alerts for critical errors (webhook failures, payment failures)
- [ ] Track feature usage (which templates are popular, etc.)
- [ ] Set up session recording (Hotjar, LogRocket) for UX insights

---

## 📱 UI/UX Polish

### Critical
- [ ] **Fix settings page redirect** - Remove admin-only check or set proper roles
- [ ] **Test all user flows** end-to-end:
  - [ ] Signup → Create template → Submit request → Approve/Reject
  - [ ] Team invitation flow
  - [ ] Upgrade to Pro flow
  - [ ] Cancel subscription flow
- [ ] **Test on mobile devices** (iOS Safari, Android Chrome)
- [ ] **Verify all forms validate** properly (client + server side)
- [ ] **Check loading states** - Add skeletons/spinners where needed
- [ ] **Test error states** - What happens when things fail?

### Recommended
- [ ] Add onboarding tour for new users
- [ ] Create help documentation/FAQ
- [ ] Add in-app tooltips for complex features
- [ ] Optimize images (compress, use next/image)
- [ ] Add meta tags for social sharing (Open Graph, Twitter Cards)
- [ ] Create a status page (status.dealpress.ai)

---

## ⚖️ Legal & Compliance

### Critical
- [ ] **Create Terms of Service** page
- [ ] **Create Privacy Policy** page
- [ ] **Add GDPR compliance** (if targeting EU users):
  - [ ] Cookie consent banner
  - [ ] Data export functionality
  - [ ] Right to deletion
- [ ] **Review data retention policies**
- [ ] **Add refund policy** to Stripe checkout
- [ ] **Register business** (LLC, etc.) if handling payments

### Recommended
- [ ] Add CCPA compliance (if targeting California users)
- [ ] Create Acceptable Use Policy
- [ ] Set up DMCA agent (if user-generated content)
- [ ] Add security disclosure/bug bounty page
- [ ] Consult with lawyer on terms/policies

---

## 🚀 Performance Optimization

### Critical
- [ ] **Run Lighthouse audit** - Fix critical issues (aim for 90+ score)
- [ ] **Check bundle size** - Analyze with `npm run build` and optimize
- [ ] **Test with slow internet** - Throttle to 3G and verify UX
- [ ] **Enable Vercel caching** for static assets
- [ ] **Optimize database queries** - Add indexes where needed

### Recommended
- [ ] Implement lazy loading for heavy components
- [ ] Add Next.js ISR (Incremental Static Regeneration) where possible
- [ ] Compress images with next/image
- [ ] Enable edge functions for global performance
- [ ] Add Redis cache for frequently accessed data

---

## 🧪 Testing

### Critical
- [ ] **Manual testing** of all features (spend a full day using the app)
- [ ] **Cross-browser testing** (Chrome, Firefox, Safari, Edge)
- [ ] **Mobile testing** (iOS, Android)
- [ ] **Test with multiple user roles** (admin, member)
- [ ] **Test payment flows** with real card (then refund)
- [ ] **Test webhook reliability** (what if webhook fails?)

### Recommended
- [ ] Set up automated tests (E2E with Playwright/Cypress)
- [ ] Load testing (what happens at 100 concurrent users?)
- [ ] Penetration testing (hire security firm or use HackerOne)
- [ ] Beta testing with 5-10 real users
- [ ] A/B test pricing page

---

## 📢 Marketing & Launch Prep

### Pre-Launch
- [ ] **Create landing page** optimized for conversions
- [ ] **Set up email collection** for waitlist/early access
- [ ] **Prepare launch announcement** (blog post, social media)
- [ ] **Create demo video** showing key features
- [ ] **Build social media presence** (Twitter, LinkedIn)
- [ ] **Prepare support docs/knowledge base**
- [ ] **Set up customer support** (Intercom, plain email, etc.)
- [ ] **Plan pricing strategy** - Is $49/$99 the right pricing?

### Launch Day
- [ ] Product Hunt launch (optional but powerful)
- [ ] Post on social media
- [ ] Email waitlist subscribers
- [ ] Share in relevant communities (Reddit, Indie Hackers)
- [ ] Reach out to industry influencers
- [ ] Monitor for issues closely

---

## 🔧 DevOps & Infrastructure

### Critical
- [ ] **Set up CI/CD** (already have with Vercel + GitHub)
- [ ] **Configure environment variables** properly (production vs staging)
- [ ] **Enable Vercel password protection** for staging environment
- [ ] **Set up rollback plan** if deployment fails
- [ ] **Document deployment process**

### Recommended
- [ ] Create staging environment (separate Vercel project)
- [ ] Set up automated backups for critical data
- [ ] Configure DDoS protection (Cloudflare)
- [ ] Create runbook for common issues
- [ ] Set up on-call rotation if team grows

---

## 📋 Post-Launch (First 30 Days)

- [ ] Monitor error rates daily
- [ ] Check webhook failure rates
- [ ] Review user feedback and iterate
- [ ] Track conversion rates (signup → paid)
- [ ] Analyze churn reasons
- [ ] Fix top 3 user complaints
- [ ] Send personalized onboarding emails
- [ ] Conduct user interviews (5-10 users)

---

## 🎯 Priority Order (Start Here)

### Week 1 - Critical Blockers
1. Clean database (delete test users)
2. Switch Stripe to live mode
3. Set up custom email domain (Resend)
4. Fix settings page redirect bug
5. Add error tracking (Sentry)
6. Create Terms of Service & Privacy Policy

### Week 2 - Essential Polish
7. Test all user flows manually
8. Mobile testing and fixes
9. Set up uptime monitoring
10. Security audit (RLS policies, rate limiting)
11. Performance optimization (Lighthouse)
12. Create help documentation

### Week 3 - Launch Prep
13. Beta testing with 5-10 users
14. Marketing materials (demo video, landing page)
15. Customer support setup
16. Social media presence
17. Final smoke tests

### Week 4 - Launch! 🚀
18. Soft launch to small audience
19. Monitor closely for issues
20. Iterate based on feedback
21. Scale marketing efforts

---

## 🆘 Support Resources

- **Stripe Docs**: https://stripe.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Resend Docs**: https://resend.com/docs

---

## 📝 Notes

- This is a COMPREHENSIVE checklist - not all items are required for MVP launch
- Focus on "Critical" items first, "Recommended" can come later
- Iterate quickly - ship fast, fix issues, improve based on user feedback
- Don't let perfection be the enemy of good

**Estimated time to production-ready**: 2-3 weeks if working full-time

Good luck with the launch! 🎉

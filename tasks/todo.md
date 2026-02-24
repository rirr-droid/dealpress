# DealPress Task List

**Current Sprint:** Billing & Payments Launch
**Last Updated:** 2026-02-24

---

## Active Tasks

### Billing System Launch
- [x] Create new pricing tiers ($49 Professional, $99 Business)
- [x] Update database schema for subscriptions
- [x] Build checkout flow with plan selection
- [x] Update billing UI with pricing cards
- [x] Create Stripe products in dashboard
- [x] Add Stripe environment variables to Vercel
- [x] Run database migration
- [x] Fix build errors and deploy
- [ ] **IN PROGRESS:** Set up Stripe webhook endpoint
- [ ] Add webhook secret to Vercel
- [ ] Test Professional plan checkout with test card
- [ ] Test Business plan checkout with test card
- [ ] Verify webhook events are processed
- [ ] Test subscription cancellation flow
- [ ] Document billing setup for future reference

---

## Blocked

**Waiting on user:**
- Vercel domain for webhook URL configuration

---

## Backlog

### High Priority
- [ ] Clean up duplicate rob+hr organization in database
- [ ] Verify team members display correctly after guardrail fixes
- [ ] Test Visual Builder with 2+ team members

### Medium Priority
- [ ] Add usage limit warnings (e.g., "2/3 requests used")
- [ ] Implement request limit blocking for free tier
- [ ] Add analytics tracking for conversion funnels
- [ ] Create email campaigns for upgrade prompts

### Low Priority
- [ ] Annual billing discount (20% off)
- [ ] Proration handling for upgrades/downgrades
- [ ] Custom billing portal branding

---

## Completed This Session

### 2026-02-24
✅ Redesigned pricing for $1K MRR optimization
✅ Created Professional ($49) and Business ($99) tiers
✅ Updated database schema with new plan types
✅ Built multi-tier checkout system
✅ Created beautiful 3-tier pricing UI
✅ Documented pricing strategy
✅ Created Stripe products
✅ Ran database migrations
✅ Fixed build errors with backup files
✅ Implemented workflow documentation

**Impact:** Path to $1K MRR reduced from 100 customers to ~15 customers

---

## Notes

### Stripe Setup Status
- [x] Products created (Professional, Business)
- [x] Environment variables added to Vercel
- [ ] Webhook configured (waiting on domain)
- [ ] Webhook secret added
- [ ] End-to-end tested

### Known Issues
- None currently

### Technical Debt
- Old `page_old.tsx` file removed (lesson learned: don't keep backups in git)
- Need to implement request usage tracking
- Need to add billing period reset logic

---

## Review Section

### What Went Well
- Pricing redesign completed quickly and comprehensively
- Database migrations broken into safe incremental steps
- Caught build error before it went to production

### What Could Be Better
- Should have deleted backup file immediately instead of committing it
- Could have tested migration locally before running in production

### Lessons Captured
- Lesson 1: Don't keep backup files in source (archived to lessons.md)
- Lesson 2: Update data before adding constraints (archived to lessons.md)

---

**Next Session Focus:** Complete webhook setup and test full checkout flow

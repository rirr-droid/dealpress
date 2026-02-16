# Quick Start: Deploy Feature #2 in 15 Minutes

**Feature:** Public Shareable Request Links
**Status:** Ready to Deploy
**Time Required:** ~15 minutes

---

## 1. Database Migration (5 minutes)

### Step 1: Copy SQL
Open `supabase/migrations/002_add_public_share_links.sql` and copy the entire contents.

### Step 2: Run in Supabase
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor"
4. Paste the migration
5. Click "Run"

### Step 3: Verify
Run this query:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'approval_requests'
  AND column_name IN ('share_token', 'shared_at', 'share_view_count');
```

Expected: 3 rows returned

✅ **Migration Complete**

---

## 2. Deploy Code (5 minutes)

### Option A: Git Push (Recommended)
```bash
cd /path/to/dealpress
git add .
git commit -m "feat: Add public shareable request links (Feature #2)"
git push origin main
```

Vercel auto-deploys in ~2 minutes.

### Option B: Manual Deploy
```bash
vercel --prod
```

✅ **Code Deployed**

---

## 3. Test in Production (5 minutes)

### Test 1: Generate Link
1. Log into production app
2. Open any approval request
3. Click "Create Share Link" button
4. Verify link appears in modal
5. Click "Copy Link"

✅ **Link Generated**

### Test 2: Public View
1. Open incognito/private browser window
2. Paste the copied link
3. Verify page loads WITHOUT requiring login
4. Check that:
   - Deal name shows
   - Status badge appears
   - Timeline displays
   - Approver names are HIDDEN
   - DealPress footer shows

✅ **Public View Working**

### Test 3: Revoke
1. In authenticated browser, click "Revoke Link"
2. Try to access link in incognito window
3. Verify "Link Not Found" error shows

✅ **Revocation Working**

---

## 4. Quick Smoke Tests

- [ ] Mobile: Open share link on phone → Responsive design ✓
- [ ] Slack: Paste link in Slack → Preview card appears ✓
- [ ] Analytics: Check view count increments ✓

---

## 5. Monitor (Ongoing)

### Day 1
- Check production logs for errors
- Monitor first share link generation
- Watch for any auth issues

### Week 1
```sql
-- How many share links generated?
SELECT COUNT(*) FROM approval_requests WHERE share_token IS NOT NULL;

-- How many total views?
SELECT SUM(share_view_count) FROM approval_requests WHERE share_token IS NOT NULL;

-- Most viewed links?
SELECT deal_name, share_view_count FROM approval_requests
WHERE share_token IS NOT NULL
ORDER BY share_view_count DESC LIMIT 5;
```

---

## Files You Need

All files are in `/path/to/dealpress/`:

1. `supabase/migrations/002_add_public_share_links.sql` - Run in Supabase
2. `DEPLOYMENT_INSTRUCTIONS_FEATURE_002.md` - Full deploy guide
3. `FEATURE_002_IMPLEMENTATION.md` - Technical details
4. `supabase/test_share_links.sql` - Testing queries

---

## Environment Variables

Verify these are set in Vercel:

```
NEXT_PUBLIC_APP_URL=https://yourdomain.com  ← Critical for share links!
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Rollback (If Needed)

```bash
# Code rollback
git revert HEAD
git push origin main

# Disable feature (don't delete data)
UPDATE approval_requests SET share_token = NULL WHERE share_token IS NOT NULL;
```

---

## Success Criteria

Feature is live when:
- ✅ Migration ran successfully
- ✅ "Share" button appears on request pages
- ✅ Share link can be generated
- ✅ Public link works in incognito mode
- ✅ Approver names are hidden publicly
- ✅ No errors in production logs

---

## Common Issues

**Issue:** 404 on public share link
**Fix:** Verify migration ran, check share_token in database

**Issue:** "Share" button doesn't appear
**Fix:** Clear browser cache, hard refresh (Cmd+Shift+R)

**Issue:** Public page requires login
**Fix:** Check route is in `app/share/[token]/` not `app/(dashboard)/share/`

**Issue:** Approver names visible
**Fix:** Verify using `getRequestByShareToken()` not `getRequest()`

---

## Get Help

- Technical docs: `FEATURE_002_IMPLEMENTATION.md`
- Deploy guide: `DEPLOYMENT_INSTRUCTIONS_FEATURE_002.md`
- Test queries: `supabase/test_share_links.sql`

---

**That's it!** Feature should be live in ~15 minutes. 🚀

**Questions?** Check the full deployment guide or contact the team.

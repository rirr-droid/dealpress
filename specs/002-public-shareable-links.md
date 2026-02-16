# Feature: Public Shareable Request Links

**ICE Score:** 8 (Impact) + 9 (Confidence) + 9 (Ease) = **26/30**
**PLG Lever:** Virality + Expansion
**Priority:** P0 (Ship this week)
**Estimated Effort:** 3 hours

---

## Problem Statement

Approval requests are currently **locked inside DealPress**. Only authenticated org members can view them.

**This kills viral growth.** When a rep closes a deal, they can't share the approval status with:
- The customer (to show deal is approved)
- Their manager (to show progress)
- Finance team members (who don't use DealPress yet)
- Executives (who want visibility without logging in)

**Every view is a missed opportunity for DealPress branding and signup conversion.**

---

## ICP Affected

**Primary:** Sales reps at ICP companies who want to share deal status externally
**Secondary:** Finance, Legal, Executives who need to see approval status but aren't DealPress users yet

**User Pain:**
- "I need to screenshot the approval status to send to my customer"
- "My CFO asked for deal status but doesn't have a DealPress login"
- "I want to share this in Slack but the link is behind auth"

---

## User Story

**As a** sales rep who just got a deal approved
**I want** to generate a public link that anyone can view
**So that** I can share approval status with customers, managers, and stakeholders without forcing them to sign up

---

## Success Metric

- **Primary:** 30% of approved requests generate a public link within 24 hours
- **Secondary:** 15% of public link viewers sign up for DealPress within 7 days
- **Tertiary:** Average 3 external views per shared link (virality coefficient)

---

## Acceptance Criteria

### Must Have (MVP)
- [ ] Every request has a "Share" button that generates a public link
- [ ] Public link shows:
  - Deal name, amount, priority
  - Current status (pending/approved/rejected)
  - Approval timeline with step names and statuses
  - Requester name
  - Submitted date and approval date (if complete)
- [ ] Public link does NOT show:
  - Approver names (privacy)
  - Internal comments
  - Sensitive org data
  - Other requests from the org
- [ ] Public view includes DealPress branding footer with "Powered by DealPress" + signup CTA
- [ ] Link format: `dealpress.com/share/[secure-token]`
- [ ] Public links never expire (once generated, always accessible)
- [ ] Request owner can revoke public link at any time
- [ ] Public view is mobile-responsive

### Nice to Have (V2)
- [ ] Password-protect option for sensitive deals
- [ ] Custom branding (hide DealPress branding for Enterprise tier)
- [ ] Expiring links (7-day, 30-day options)
- [ ] Track view analytics (who viewed, when, from where)
- [ ] Embeddable iframe version for external tools
- [ ] Social media preview cards (OpenGraph tags)
- [ ] "Request access" button for viewers who want to become users

---

## Technical Implementation

### Architecture
```
Request Detail Page → Generate Share Link → Store Token in DB → Public Route → Render Read-Only View
```

### Key Files to Create/Modify

**1. Add Share Link Generation**
```typescript
// lib/db/requests.ts (MODIFY)
export async function generateShareLink(requestId: string) {
  const token = crypto.randomUUID() // or use shorter token generator

  await supabase
    .from('approval_requests')
    .update({ share_token: token })
    .eq('id', requestId)

  return `${APP_URL}/share/${token}`
}

export async function revokeShareLink(requestId: string) {
  await supabase
    .from('approval_requests')
    .update({ share_token: null })
    .eq('id', requestId)
}
```

**2. Database Migration**
```sql
-- Add to approval_requests table
ALTER TABLE approval_requests ADD COLUMN share_token TEXT UNIQUE;
ALTER TABLE approval_requests ADD COLUMN shared_at TIMESTAMP;
ALTER TABLE approval_requests ADD COLUMN share_view_count INTEGER DEFAULT 0;
```

**3. Create Public View Route**
```typescript
// app/share/[token]/page.tsx (NEW)
export default async function PublicRequestPage({ params }: { params: { token: string } }) {
  // Fetch request by share_token (NOT by ID, for security)
  const request = await getRequestByShareToken(params.token)

  if (!request) {
    return <NotFound message="This link is invalid or has been revoked" />
  }

  // Increment view count
  await incrementShareViewCount(params.token)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Request View */}
      <RequestTimelinePublic request={request} />

      {/* DealPress Branding Footer */}
      <Footer>
        <p>Powered by <a href="https://dealpress.com">DealPress</a></p>
        <Button href="/signup">Get DealPress for your team</Button>
      </Footer>
    </div>
  )
}
```

**4. Add Share Button to Request Detail Page**
```typescript
// app/(dashboard)/requests/[id]/page.tsx (MODIFY)
// Add "Share" button in header
<Button onClick={handleShare}>
  <Share2 className="w-4 h-4 mr-2" />
  Share Link
</Button>

// Show generated link in modal
{shareLink && (
  <Dialog>
    <Input value={shareLink} readOnly />
    <Button onClick={() => copyToClipboard(shareLink)}>Copy Link</Button>
    <Button onClick={handleRevoke} variant="destructive">Revoke Link</Button>
  </Dialog>
)}
```

**5. Create Public Request Component**
```typescript
// components/RequestTimelinePublic.tsx (NEW)
export function RequestTimelinePublic({ request }) {
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Status Badge */}
      <StatusBadge status={request.status} />

      {/* Deal Info */}
      <h1>{request.deal_name}</h1>
      {request.deal_amount && <p>${request.deal_amount.toLocaleString()}</p>}

      {/* Approval Timeline (read-only) */}
      <Timeline steps={request.steps} hideApproverNames />

      {/* Submitted by */}
      <p>Submitted by {request.requester.name} on {formatDate(request.submitted_at)}</p>

      {/* Approved/Rejected Info */}
      {request.status !== 'pending' && (
        <p>Final decision: {request.status} on {formatDate(request.completed_at)}</p>
      )}
    </div>
  )
}
```

---

## Security Considerations

- ✅ Tokens are UUIDs (unguessable)
- ✅ Tokens are unique per request (indexed in DB)
- ✅ Public view shows sanitized data only (no internal comments, approver names)
- ✅ Revocation is instant (token set to null)
- ⚠️ Rate limit public route to prevent scraping (100 requests/IP/hour)
- ⚠️ Add CSP headers to prevent embedding in malicious sites

### What NOT to Show Publicly
- Approver names (privacy risk)
- Internal comments (may contain sensitive info)
- Other requests from the organization
- Organization settings or team info
- Email addresses
- Detailed audit logs

---

## Edge Cases

1. **Link is revoked after sharing**
   - Show: "This link has been revoked by the request owner"
   - Don't show request data

2. **Request is deleted**
   - Same as revoked: "Link no longer valid"

3. **Public link is shared in Slack/Teams**
   - OpenGraph tags show nice preview card
   - Preview shows deal name + status

4. **User views their own public link while logged in**
   - Show banner: "You're viewing the public version. Click here for full details"
   - Link to authenticated request page

5. **Link is shared with customer before deal is approved**
   - They see "Pending approval" status
   - Link updates in real-time as status changes (optional: add refresh button)

---

## Dependencies

None! Pure Next.js + existing DB schema + Supabase.

---

## Rollback Plan

If this creates privacy issues:
1. Remove "Share" button from UI
2. Set all `share_token` values to NULL
3. Delete `/share/[token]` route

No data loss - tokens are just metadata.

---

## Revenue Impact (90 days)

**Virality Impact:**
- Each shared link = 3 external views (hypothesis)
- 15% of viewers sign up within 7 days
- If 100 requests generate share links → 300 views → 45 signups
- At 50% conversion to paid (free trial → pro) → 22 new paid users
- At $10/user/month → **+$220 MRR/month** → **+$660 MRR in 90 days**

**Expansion Impact:**
- Executives who see public links but don't have accounts → organic demand for org-wide rollout
- "I showed this to my VP and now they want DealPress for the whole team"

**Brand Awareness:**
- Every public link = DealPress branding exposure
- "Powered by DealPress" → inbound signups

---

## Implementation Tasks

### Phase 1: Core Flow (3 hours)
1. [ ] Add database migration for `share_token`, `shared_at`, `share_view_count`
2. [ ] Create `generateShareLink()` and `revokeShareLink()` functions
3. [ ] Create `getRequestByShareToken()` query
4. [ ] Create `/app/share/[token]/page.tsx` public route
5. [ ] Create `RequestTimelinePublic` component (sanitized view)
6. [ ] Add "Share" button to request detail page
7. [ ] Create share link modal with copy/revoke actions
8. [ ] Add DealPress branding footer with signup CTA
9. [ ] Test public view (unauthenticated browser)
10. [ ] Add OpenGraph meta tags for link previews

### Phase 2: Polish (1 hour)
1. [ ] Add view count tracking
2. [ ] Add rate limiting to public route
3. [ ] Mobile optimization
4. [ ] Add CSP headers

---

## Testing Checklist

- [ ] Generate share link from authenticated request page
- [ ] Copy link works
- [ ] Public link loads in incognito browser (no auth required)
- [ ] Public view shows correct data
- [ ] Public view hides approver names and comments
- [ ] Revoke link works (public page shows "revoked" message)
- [ ] Deleted request shows error
- [ ] OpenGraph preview works in Slack
- [ ] Mobile view is responsive
- [ ] View count increments
- [ ] Rate limiting blocks scrapers

---

**Ship This Second.** Creates viral loop + DealPress brand exposure. Easy to build, high PLG impact.

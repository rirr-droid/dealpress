# Custom Approver Emails Feature

## Overview
This feature allows users to specify custom approver emails when creating approval requests, enabling approvals from external stakeholders who are not registered users in the system.

## Implementation Date
February 18, 2026

## Problem Statement
Previously, approvers had to be registered users in the organization. This created friction when:
- Approvals needed from external stakeholders (partners, consultants, legal counsel)
- Approvers changed on a per-deal basis
- Users wanted to route approvals to specific individuals rather than role-based assignments

## Solution
Users can now specify custom email addresses for each approval step when creating a request. The system:
1. Displays template approval steps with email input fields
2. Provides autocomplete from saved contacts
3. Sends approval emails to custom addresses
4. Optionally saves new contacts to an address book
5. Tracks usage frequency for better autocomplete

## Technical Implementation

### Database Changes
**Migration:** `supabase/migrations/005_create_contacts_table.sql`

1. **New Table: `contacts`**
   - Stores frequently used approver contacts
   - Tracks usage count and last used date
   - Scoped to organization (multi-tenant)
   - Unique constraint on (organization_id, email)

2. **New Column: `approval_steps.approver_email`**
   - Stores custom approver email when specified
   - Alternative to `approver_id` for external approvers
   - Nullable (falls back to approver_id if not set)

### Code Changes

#### 1. Validation Schema (`lib/validations.ts`)
```typescript
custom_approvers: z.array(z.object({
  step_order: z.number().int().min(1),
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  save_to_contacts: z.boolean().optional(),
})).optional(),
```

#### 2. TypeScript Types (`types/index.ts`)
```typescript
export interface ApprovalStep {
  // ... existing fields
  approver_email?: string; // Custom approver email
}
```

#### 3. UI Component (`components/CreateRequestDialog.tsx`)
- Added state management for custom approvers
- Shows approval steps when template selected
- Email input with autocomplete for each step
- "Save to contacts" checkbox for new emails
- Auto-initializes approvers when template changes

Key Features:
- `ContactAutocomplete` component for email input
- Checkbox to save new contacts
- Pre-fills with previously used contacts
- Shows step name and order

#### 4. Server Action (`app/actions/requests.ts`)
Enhanced `createRequest` to:
- Accept `custom_approvers` array in input
- Store `approver_email` in approval steps
- Send emails to custom addresses
- Save new contacts when requested
- Increment usage count for existing contacts

Email Logic:
```typescript
// Priority: custom approver email > user profile email
if (firstStep.approver_email) {
  approverEmail = firstStep.approver_email;
  // Increment usage tracking
  await incrementContactUsage(firstStep.approver_email);
} else {
  // Fetch from user profile
}
```

#### 5. Contact Management (`app/actions/contacts.ts`)
Already implemented:
- `searchContacts(query)` - Search by name or email
- `createContact(input)` - Add new contact
- `incrementContactUsage(email)` - Track usage frequency
- `getContacts()` - List all contacts

#### 6. Autocomplete Component (`components/ContactAutocomplete.tsx`)
Already implemented:
- Real-time search with 300ms debounce
- Shows name, email, job title
- Displays usage count
- Click outside to close
- Accessible keyboard navigation

## User Flow

### Creating Request with Custom Approver

1. **User clicks "New Request"**
   - Opens CreateRequestDialog

2. **User fills deal details**
   - Deal name (required)
   - Template selection (required)
   - Deal amount, priority, reason (optional)

3. **Template shows approval steps**
   - Template: "Enterprise Deal" has 1 step
   - Step 1: Sales Approval
   - Email input field appears

4. **User types approver email**
   - Types "Bill" in email field
   - Autocomplete shows "Bill Johnson - bill.johnson@dealpress.ai"
   - User selects from dropdown

5. **OR user types new email**
   - Types "jane@partner.com"
   - Checkbox appears: "Save to contacts"
   - User checks box (optional)

6. **User submits request**
   - Request created with custom approver
   - Email sent to specified address
   - Contact saved if checkbox selected
   - Usage count incremented

### Autocomplete Behavior

**First Time User:**
- No contacts saved
- Types full email address
- Can save to contacts for future use

**Returning User:**
- Types partial name or email
- Sees previously used contacts
- Contacts sorted by usage frequency
- Selects from list

## Email Sending

### With Custom Approver
```
To: bill.johnson@dealpress.ai (custom email)
Subject: Approval Needed: Q1 Enterprise Agreement
Body: Bill Johnson, you have an approval request...
Action Link: Click to approve/reject
```

### Without Custom Approver (Fallback)
```
To: user@dealpress.ai (from user profile)
Subject: Approval Needed: Q1 Enterprise Agreement
Body: [User Name], you have an approval request...
```

## Database Schema

### contacts Table
```sql
id               UUID PRIMARY KEY
organization_id  UUID NOT NULL (multi-tenant isolation)
name             TEXT NOT NULL
email            TEXT NOT NULL
job_title        TEXT (optional)
notes            TEXT (optional)
usage_count      INT DEFAULT 0 (autocomplete ranking)
last_used_at     TIMESTAMPTZ (activity tracking)
created_by       UUID (audit trail)
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ

UNIQUE(organization_id, email)
```

### approval_steps Changes
```sql
approver_email   TEXT (nullable, new field)
```

## Security & Privacy

### Row-Level Security (RLS)
- Contacts scoped to organization_id
- Users can only access their org's contacts
- Standard RLS policies applied

### Data Validation
- Email format validation (zod schema)
- Organization membership checked
- No cross-tenant data access

### Privacy
- Contact data isolated per organization
- No global contact sharing
- Users control what gets saved

## Performance

### Indexing
```sql
idx_contacts_org_name     (organization_id, name)
idx_contacts_org_email    (organization_id, email)
idx_contacts_usage        (organization_id, usage_count DESC)
idx_approval_steps_email  (approver_email)
```

### Autocomplete Optimization
- 300ms debounce on search input
- Limit 10 results
- Sort by usage_count DESC
- ilike search on name and email

## Testing Checklist

### Manual Testing

- [ ] Create request without custom approver (existing flow)
- [ ] Create request with custom approver email
- [ ] Verify email sent to custom address
- [ ] Verify contact saved when checkbox selected
- [ ] Create second request, verify autocomplete works
- [ ] Select existing contact from autocomplete
- [ ] Verify usage count increments
- [ ] Test with multiple approval steps
- [ ] Test with invalid email format
- [ ] Test with duplicate contact email
- [ ] Verify RLS prevents cross-org access
- [ ] Test on mobile (responsive design)

### Edge Cases

- [ ] Empty email field (should use default approver)
- [ ] Malformed email address (validation error)
- [ ] Duplicate contact email (unique constraint)
- [ ] Very long email address (input limits)
- [ ] Special characters in email
- [ ] Contact autocomplete with 0 results
- [ ] Template with no steps
- [ ] Template with 10+ steps
- [ ] Concurrent contact creation (race condition)
- [ ] Email sending failure (should not block request creation)

### Security Testing

- [ ] Attempt to access another org's contacts
- [ ] SQL injection in email field
- [ ] XSS in contact name field
- [ ] CSRF on contact creation
- [ ] Rate limiting on autocomplete
- [ ] Email spoofing prevention

## Migration Instructions

### For Supabase Users

1. **Run Migration**
   ```sql
   -- Apply migration file
   psql -d dealpress < supabase/migrations/005_create_contacts_table.sql
   ```

2. **Verify Tables Created**
   ```sql
   -- Check contacts table
   SELECT * FROM contacts LIMIT 1;

   -- Check new column
   SELECT approver_email FROM approval_steps LIMIT 1;
   ```

3. **Test RLS Policies**
   ```sql
   -- As authenticated user
   SELECT * FROM contacts;  -- Should only see own org
   ```

### For New Deployments
- Migration runs automatically on first deploy
- No manual steps required

## Backwards Compatibility

### Existing Requests
- Old requests without approver_email continue to work
- Email logic falls back to approver_id
- No data migration needed

### API Compatibility
- `custom_approvers` field is optional
- Existing API calls work unchanged
- No breaking changes

## Future Enhancements

### Phase 2 (Planned)
- [ ] Bulk contact import (CSV upload)
- [ ] Contact groups/teams
- [ ] Contact roles/tags
- [ ] Email validation (send test email)
- [ ] Contact merge/deduplication
- [ ] Contact sharing between orgs (opt-in)

### Phase 3 (Ideas)
- [ ] Contact history (all requests sent to)
- [ ] Contact approval stats (avg time, approval rate)
- [ ] Smart contact suggestions (ML-based)
- [ ] Contact sync with CRM (Salesforce, HubSpot)
- [ ] Contact verification status

## Metrics & Analytics

### Key Metrics to Track
- Percentage of requests using custom approvers
- Contact reuse rate (usage_count > 1)
- Average contacts per organization
- Autocomplete selection rate vs manual entry
- Email delivery success rate for custom approvers

### Success Criteria
- 30% of requests use custom approvers (6 months)
- 70% autocomplete selection rate
- 50% contact reuse rate
- < 5% email delivery failures

## Known Limitations

1. **No Email Verification**
   - System sends emails without verifying address exists
   - Bounced emails not tracked (future enhancement)

2. **No Contact Deduplication**
   - Users can create near-duplicate contacts
   - Manual cleanup required

3. **No Contact Permissions**
   - All org members see all contacts
   - No private contacts (future enhancement)

4. **Single Email per Contact**
   - Cannot store multiple emails for one person
   - No CC/BCC on approval emails

## Support & Troubleshooting

### Common Issues

**Issue:** Autocomplete not showing results
- Check database connection
- Verify RLS policies allow access
- Check search query (min 2 characters)

**Issue:** Email not sent to custom approver
- Check RESEND_API_KEY configured
- Verify email format valid
- Check email service logs

**Issue:** "Contact already exists" error
- Email must be unique per organization
- Update existing contact instead

**Issue:** Checkbox not appearing
- Checkbox only shows for new emails
- If email exists in contacts, no checkbox

## Documentation Links

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Radix UI Checkbox](https://www.radix-ui.com/docs/primitives/components/checkbox)
- [Resend Email API](https://resend.com/docs)
- [Zod Validation](https://zod.dev/)

## Contributors
- Implementation: Claude Code (AI Agent)
- Product Spec: Based on user requirements
- Testing: Manual verification required

## Change Log

### v1.0 (2026-02-18)
- Initial implementation
- contacts table created
- approver_email column added
- UI components implemented
- Email sending logic updated
- Contact autocomplete integrated

---

**Status:** Ready for Testing
**Next Steps:** Manual QA, user acceptance testing, production deployment

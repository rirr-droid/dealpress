# RBAC + Attachments Feature Deployment Guide

## Features Added

### 1. Role-Based Access Control (RBAC)
- **Admin users** can:
  - Create/edit/delete templates
  - Invite/remove team members
  - Access settings & billing
  - Cancel any request
  - Delete any attachment
  - Export analytics

- **Member users** (Sales reps) can:
  - Create approval requests
  - View templates (read-only)
  - Approve requests (if assigned)
  - Cancel their own requests
  - Delete their own attachments

### 2. Attachment Uploads (Pro Feature)
- Upload files to approval requests
- Supported types: PDF, DOCX, XLSX, PNG, JPG
- Max size: 10MB per file
- Secure storage in Supabase
- Download with signed URLs

---

## Deployment Steps

### Step 1: Run Database Migration

```sql
-- In Supabase SQL Editor, run:
supabase/migrations/007_add_attachments_and_rbac.sql
```

This creates:
- `approval_attachments` table
- RLS policies for attachments
- `is_org_admin()` helper function
- Updated template RLS policies (admin-only for write)

### Step 2: Create Storage Bucket

```sql
-- In Supabase SQL Editor, run:
supabase/storage/setup-attachments-bucket.sql
```

This creates:
- `approval-attachments` bucket (private)
- Storage RLS policies
- File type + size restrictions

### Step 3: Deploy Code

```bash
git add -A
git commit -m "feat: Add RBAC and attachment uploads

- Role-based permissions (admin vs member)
- Attachment upload/download (Pro feature)
- Protected admin routes
- Template management restricted to admins"
git push
```

Vercel will auto-deploy.

---

## Testing Checklist

### Test RBAC

**As Admin:**
- [ ] Can create templates
- [ ] Can edit templates
- [ ] Can delete templates
- [ ] Can access /settings
- [ ] Can access /settings/team
- [ ] Can invite team members
- [ ] Can remove team members

**As Member:**
- [ ] Can view templates (read-only)
- [ ] Cannot create/edit/delete templates
- [ ] Cannot access /settings (redirected to /dashboard)
- [ ] Cannot invite team members
- [ ] Can create approval requests
- [ ] Can approve if assigned

### Test Attachments

**With Pro Subscription:**
- [ ] Upload button visible
- [ ] Can upload PDF
- [ ] Can upload DOCX
- [ ] Can upload image
- [ ] Can download attachment
- [ ] Can delete own attachment
- [ ] Admin can delete any attachment

**With Free Subscription:**
- [ ] Upload button shows "Pro Feature" badge
- [ ] Click shows upgrade prompt
- [ ] Cannot upload files

---

## UI Changes

### For Members:
- Templates page shows "Read Only" banner
- No "Create Template" button
- Settings link removed from nav
- Team page not accessible

### For Admins:
- Everything works as before
- Badge shows "Admin" role
- All features unlocked

---

## Migration Path for Existing Users

All existing users will remain as `admin` role by default. To convert sales reps to `member` role:

```sql
-- Update specific user to member role
UPDATE organization_members
SET role = 'member'
WHERE user_id = '<user-id>'
  AND organization_id = '<org-id>';
```

Or via the Team Management UI:
1. Go to Settings → Team
2. Click "..." next to member
3. Select "Change to Member"

---

## Rollback Plan

If issues occur:

```sql
-- Restore admin write access to templates
DROP POLICY "Admins can create templates in their org" ON approval_templates;
CREATE POLICY "Users can create templates in their org"
  ON approval_templates
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Repeat for UPDATE and DELETE policies
```

---

## Next Steps

After deployment:

1. Update CLAUDE.md to reflect new permissions
2. Create help docs explaining member vs admin roles
3. Add role badges to user avatars in UI
4. Consider adding "Request Admin Access" feature

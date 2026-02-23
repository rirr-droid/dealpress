# Template Builder Setup Guide

## Overview

A visual template builder has been implemented to allow admins to create approval workflows by assigning specific team members (not just roles) to approval steps.

## New Features

### 1. Visual Template Builder (`/templates/new`)
- **Drag-and-drop step reordering** - Move steps up/down with arrow buttons
- **Multi-approver support** - Assign multiple team members to each step
- **Live preview** - See workflow visualization as you build
- **Team member selector** - Search and select from your organization's members
- **Validation** - Ensures all steps have names and approvers

### 2. New Components

#### `TemplateBuilder.tsx`
Main builder component with:
- Template details (name, description, threshold, active status)
- Step management (add, remove, reorder)
- Live workflow preview
- Form validation

#### `StepEditor.tsx`
Individual step editor with:
- Step name and role description
- Approver assignment interface
- Move up/down buttons
- Remove step button

#### `ApproverSelector.tsx`
Team member picker with:
- Search functionality
- Role badges (Admin/Member)
- Avatar display
- Selected state management

### 3. Database Changes

A new junction table `template_step_approvers` has been created to support multiple approvers per step.

## Database Migration Required

You need to run the following SQL in your Supabase SQL Editor:

```sql
-- Migration: Add support for multiple approvers per template step

-- Create a junction table for template step approvers
CREATE TABLE IF NOT EXISTS template_step_approvers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_step_id UUID NOT NULL REFERENCES template_steps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_step_id, user_id)
);

-- Add RLS policies
ALTER TABLE template_step_approvers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view approvers for templates in their organization
CREATE POLICY "Users can view template step approvers in their org"
  ON template_step_approvers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM template_steps ts
      JOIN approval_templates at ON ts.template_id = at.id
      JOIN organization_members om ON om.organization_id = at.organization_id
      WHERE ts.id = template_step_approvers.template_step_id
        AND om.user_id = auth.uid()
    )
  );

-- Policy: Admins can manage approvers for templates in their organization
CREATE POLICY "Admins can manage template step approvers"
  ON template_step_approvers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM template_steps ts
      JOIN approval_templates at ON ts.template_id = at.id
      JOIN organization_members om ON om.organization_id = at.organization_id
      WHERE ts.id = template_step_approvers.template_step_id
        AND om.user_id = auth.uid()
        AND om.role = 'admin'
    )
  );

-- Add index for performance
CREATE INDEX idx_template_step_approvers_step_id ON template_step_approvers(template_step_id);
CREATE INDEX idx_template_step_approvers_user_id ON template_step_approvers(user_id);

-- Add comment
COMMENT ON TABLE template_step_approvers IS 'Junction table for assigning multiple specific users as approvers for template steps';
```

## How to Deploy

### Step 1: Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the migration SQL above
4. Click "Run" to execute the migration

### Step 2: Deploy Frontend

```bash
# Build and deploy
npm run build

# Or if using Vercel
git add .
git commit -m "feat: Add visual template builder with multi-approver support"
git push
```

### Step 3: Test the Feature

1. Log in as an **admin** user
2. Navigate to `/templates`
3. Click the **"Visual Builder"** button
4. Create a template:
   - Enter template name (required)
   - Add description (optional)
   - Set deal amount threshold (optional)
   - Add approval steps
   - Assign team members to each step
   - Click "Save Template"

## User Guide

### For Admins

#### Creating a Template with the Visual Builder

1. **Navigate to Templates**
   - Go to `/templates`
   - Click "Visual Builder" button

2. **Fill in Template Details**
   - **Name**: e.g., "Enterprise Sales Approval"
   - **Description**: When to use this template
   - **Deal Amount Threshold**: Minimum deal size (e.g., $10,000)
   - **Active**: Toggle on/off

3. **Build Approval Workflow**
   - Each template starts with one step
   - Click "Add Approval Step" to add more
   - For each step:
     - Enter **step name** (e.g., "Manager Review")
     - Enter **role description** (optional, e.g., "Sales Manager")
     - Click "Add Approver" to assign team members
     - You can assign multiple approvers per step

4. **Reorder Steps**
   - Use ↑ and ↓ buttons on each step to reorder
   - Steps execute in sequential order (top to bottom)

5. **Preview Workflow**
   - Click "Show Preview" to see the approval flow
   - Visualizes the sequence of approvers

6. **Save Template**
   - Click "Save Template" when done
   - You'll be redirected to the templates page

#### Quick Create vs Visual Builder

- **Quick Create** (dialog): Fast basic template creation with role-based approvers
- **Visual Builder** (full page): Advanced builder with specific team member assignment

### For Members

- Members can **view** templates but cannot create or edit them
- Only admins have access to the template builder

## Technical Details

### Data Flow

1. **Frontend**: `TemplateBuilder` component collects data
2. **Action**: `createTemplateWithApprovers` server action
3. **Database**:
   - Creates record in `approval_templates`
   - Creates records in `template_steps`
   - Creates records in `template_step_approvers` (new!)

### API Changes

#### New Server Action: `createTemplateWithApprovers`

```typescript
interface CreateTemplateInput {
  name: string;
  description?: string;
  deal_amount_threshold?: number;
  is_active: boolean;
  steps: Array<{
    step_name: string;
    step_order: number;
    approver_role?: string;
    approver_ids: string[]; // NEW: Array of user IDs
  }>;
}
```

### Security

- **RLS Policies**: Only organization members can view approvers
- **Admin-only**: Only admins can create/edit templates
- **Validation**: All steps must have at least one approver
- **Multi-tenant**: All data isolated by organization_id

## Troubleshooting

### Issue: "Table doesn't exist" error

**Solution**: Run the database migration SQL in Supabase SQL Editor

### Issue: Can't see the Visual Builder button

**Check**:
1. Are you logged in as an admin?
2. Is the role correctly set in organization_members table?
3. Check browser console for errors

### Issue: Approvers not saving

**Check**:
1. Migration was run successfully
2. RLS policies are in place
3. Check Supabase logs for permission errors

## Future Enhancements

Potential improvements:
- [ ] Edit existing templates with the visual builder
- [ ] Drag-and-drop step reordering (instead of buttons)
- [ ] Conditional steps based on deal amount
- [ ] Parallel approval paths
- [ ] Template preview before saving
- [ ] Duplicate template functionality

## Files Modified

### New Files
- `/components/TemplateBuilder.tsx` - Main builder component
- `/components/StepEditor.tsx` - Step configuration component
- `/components/ApproverSelector.tsx` - Team member picker
- `/components/NewTemplateClient.tsx` - Client wrapper
- `/app/(dashboard)/templates/new/page.tsx` - Builder page
- `/supabase/migrations/008_add_template_step_approvers.sql` - Database migration

### Modified Files
- `/app/actions/templates.ts` - Added `createTemplateWithApprovers` function
- `/components/TemplatesClient.tsx` - Added "Visual Builder" button

## Support

For issues or questions, check:
1. Browser console for errors
2. Supabase logs for database errors
3. Network tab for failed API calls

---

**Last Updated**: 2026-02-23
**Version**: 1.0.0

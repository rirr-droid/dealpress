# Supabase Setup Guide for DealPress

This guide will walk you through setting up Supabase for DealPress Phase 1 (Authentication + Database).

## Prerequisites

- A Supabase account (free tier is fine)
- Access to the Supabase dashboard

## Step 1: Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: DealPress
   - **Database Password**: Save this securely (you won't need it in the app, but keep it for database access)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

## Step 2: Get API Keys

1. In your project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`) - ⚠️ Keep this secret!

3. Create `.env.local` file in project root:

```bash
# Copy from .env.example and fill in your values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the entire schema below
4. Click **"Run"** (or press Cmd/Ctrl + Enter)

### Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ORGANIZATIONS (Multi-Tenancy Root)
-- =====================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,

  -- Subscription (Phase 3)
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,

  -- Limits
  max_users INT DEFAULT 1,
  max_requests_per_month INT DEFAULT 5,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER PROFILES (Extended from Supabase Auth)
-- =====================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ORGANIZATION MEMBERS (Many-to-Many)
-- =====================================================
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  role TEXT NOT NULL DEFAULT 'member',
  job_title TEXT,

  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, user_id)
);

-- =====================================================
-- APPROVAL TEMPLATES
-- =====================================================
CREATE TABLE approval_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  object_type TEXT DEFAULT 'opportunity',
  is_active BOOLEAN DEFAULT true,

  deal_amount_threshold NUMERIC(12,2),
  discount_threshold NUMERIC(5,2),

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TEMPLATE STEPS
-- =====================================================
CREATE TABLE template_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES approval_templates(id) ON DELETE CASCADE,

  step_name TEXT NOT NULL,
  step_order INT NOT NULL,
  approver_role TEXT,
  approver_user_id UUID REFERENCES auth.users(id),

  execution_type TEXT DEFAULT 'sequential',
  parallel_group INT,
  is_required BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(template_id, step_order)
);

-- =====================================================
-- APPROVAL REQUESTS
-- =====================================================
CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES approval_templates(id) ON DELETE SET NULL,

  deal_name TEXT NOT NULL,
  deal_amount NUMERIC(12,2),
  deal_url TEXT,
  external_record_id TEXT,
  external_source TEXT,

  status TEXT NOT NULL DEFAULT 'draft',
  priority TEXT DEFAULT 'normal',
  reason TEXT,

  requester_id UUID NOT NULL REFERENCES auth.users(id),
  current_step_id UUID,

  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- APPROVAL STEPS
-- =====================================================
CREATE TABLE approval_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,

  step_name TEXT NOT NULL,
  step_order INT NOT NULL,
  approver_id UUID NOT NULL REFERENCES auth.users(id),

  status TEXT NOT NULL DEFAULT 'not-started',
  comments TEXT,

  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  acted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS (Email Queue)
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  request_id UUID REFERENCES approval_requests(id) ON DELETE CASCADE,

  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,

  sent_at TIMESTAMPTZ,
  email_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIT LOGS
-- =====================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  user_id UUID REFERENCES auth.users(id),
  request_id UUID REFERENCES approval_requests(id),

  action TEXT NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USAGE TRACKING (For Billing Limits)
-- =====================================================
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  month DATE NOT NULL,
  requests_created INT DEFAULT 0,
  active_users INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, month)
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user's org IDs
CREATE OR REPLACE FUNCTION auth.user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id FROM organization_members
  WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- RLS Policies for all tables
CREATE POLICY "Users can view own org data"
  ON organizations FOR SELECT
  USING (id IN (SELECT auth.user_org_ids()));

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can view own org members"
  ON organization_members FOR SELECT
  USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "Users can view own org templates"
  ON approval_templates FOR SELECT
  USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "Users can insert templates in own org"
  ON approval_templates FOR INSERT
  WITH CHECK (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "Users can update templates in own org"
  ON approval_templates FOR UPDATE
  USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "Users can view template steps"
  ON template_steps FOR SELECT
  USING (template_id IN (SELECT id FROM approval_templates WHERE organization_id IN (SELECT auth.user_org_ids())));

CREATE POLICY "Users can view own org requests"
  ON approval_requests FOR SELECT
  USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "Users can insert requests in own org"
  ON approval_requests FOR INSERT
  WITH CHECK (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "Users can update requests in own org"
  ON approval_requests FOR UPDATE
  USING (organization_id IN (SELECT auth.user_org_ids()));

CREATE POLICY "Users can view approval steps"
  ON approval_steps FOR SELECT
  USING (request_id IN (SELECT id FROM approval_requests WHERE organization_id IN (SELECT auth.user_org_ids())));

CREATE POLICY "Users can update approval steps"
  ON approval_steps FOR UPDATE
  USING (request_id IN (SELECT id FROM approval_requests WHERE organization_id IN (SELECT auth.user_org_ids())));

-- =====================================================
-- INDEXES (Performance)
-- =====================================================
CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_requests_org_id ON approval_requests(organization_id);
CREATE INDEX idx_requests_status ON approval_requests(status);
CREATE INDEX idx_requests_requester_id ON approval_requests(requester_id);
CREATE INDEX idx_steps_request_id ON approval_steps(request_id);
CREATE INDEX idx_steps_approver_id ON approval_steps(approver_id);
CREATE INDEX idx_steps_status ON approval_steps(status);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, sent_at);
CREATE INDEX idx_templates_org_active ON approval_templates(organization_id, is_active);

-- =====================================================
-- TRIGGERS (Auto-update timestamps)
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON approval_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON approval_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- FUNCTION: Auto-create org and profile on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_slug TEXT;
BEGIN
  -- Generate slug from company name or email
  org_slug := LOWER(REGEXP_REPLACE(
    COALESCE(NEW.raw_user_meta_data->>'company_name', SPLIT_PART(NEW.email, '@', 1)),
    '[^a-z0-9]+', '-', 'g'
  )) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);

  -- Create organization
  INSERT INTO public.organizations (name, slug)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', SPLIT_PART(NEW.email, '@', 1)),
    org_slug
  )
  RETURNING id INTO new_org_id;

  -- Create user profile
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1))
  );

  -- Add user as org owner
  INSERT INTO public.organization_members (organization_id, user_id, role, joined_at)
  VALUES (new_org_id, NEW.id, 'owner', NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 4: Verify Setup

1. In Supabase dashboard, go to **Database** → **Tables**
2. You should see all 10 tables:
   - ✅ organizations
   - ✅ user_profiles
   - ✅ organization_members
   - ✅ approval_templates
   - ✅ template_steps
   - ✅ approval_requests
   - ✅ approval_steps
   - ✅ notifications
   - ✅ audit_logs
   - ✅ usage_tracking

3. Go to **Authentication** → **Policies** - You should see RLS enabled on all tables

## Step 5: Test Authentication

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/signup`
3. Create a test account
4. Check Supabase dashboard:
   - **Authentication** → **Users** - Your user should appear
   - **Table Editor** → **organizations** - An org should be auto-created
   - **Table Editor** → **user_profiles** - Your profile should exist
   - **Table Editor** → **organization_members** - You should be listed as owner

## Step 6: Seed Demo Data (Optional)

Coming in Phase 1 completion - we'll migrate the mock data to seed scripts.

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server after changing `.env.local`

### "No organization found" error
- Check the `handle_new_user()` trigger ran successfully
- Go to **Database** → **Functions** and verify `handle_new_user` exists
- Try creating a new user to test

### RLS policy errors
- Verify all RLS policies were created
- Go to **Authentication** → **Policies** to review
- Check that `auth.user_org_ids()` function exists

### Tables not visible
- Ensure all SQL ran without errors
- Check **SQL Editor** history for error messages
- Try running schema in smaller chunks if needed

## Next Steps

After Supabase is set up:
1. ✅ Authentication should work (signup/login)
2. ⏭️ Next: Update dashboard pages to fetch from Supabase
3. ⏭️ Next: Create database query helpers in `lib/db/`
4. ⏭️ Next: Build CRUD Server Actions

---

**Need help?** Check Supabase docs: https://supabase.com/docs

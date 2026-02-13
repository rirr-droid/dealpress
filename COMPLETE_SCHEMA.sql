-- DealPress Complete Database Schema
-- Copy and paste ALL of this into Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ORGANIZATIONS
-- =====================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  subscription_plan TEXT DEFAULT 'free',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  max_users INT DEFAULT 1,
  max_requests_per_month INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER PROFILES
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
-- ORGANIZATION MEMBERS
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
  resolved_at TIMESTAMPTZ,
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
-- NOTIFICATIONS
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
-- USAGE TRACKING
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
-- STEP COMMENTS
-- =====================================================
CREATE TABLE step_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES approval_steps(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
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
ALTER TABLE step_comments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION (in public schema)
-- =====================================================
CREATE OR REPLACE FUNCTION public.user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES
-- =====================================================
CREATE POLICY "view_own_org" ON organizations FOR SELECT USING (id IN (SELECT public.user_org_ids()));
CREATE POLICY "view_own_profile" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "update_own_profile" ON user_profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "insert_own_profile" ON user_profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "view_org_members" ON organization_members FOR SELECT USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "view_org_templates" ON approval_templates FOR SELECT USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "insert_templates" ON approval_templates FOR INSERT WITH CHECK (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "update_templates" ON approval_templates FOR UPDATE USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "view_template_steps" ON template_steps FOR SELECT USING (template_id IN (SELECT id FROM approval_templates WHERE organization_id IN (SELECT public.user_org_ids())));
CREATE POLICY "view_org_requests" ON approval_requests FOR SELECT USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "insert_requests" ON approval_requests FOR INSERT WITH CHECK (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "update_requests" ON approval_requests FOR UPDATE USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "view_approval_steps" ON approval_steps FOR SELECT USING (request_id IN (SELECT id FROM approval_requests WHERE organization_id IN (SELECT public.user_org_ids())));
CREATE POLICY "update_approval_steps" ON approval_steps FOR UPDATE USING (request_id IN (SELECT id FROM approval_requests WHERE organization_id IN (SELECT public.user_org_ids())));
CREATE POLICY "view_org_comments" ON step_comments FOR SELECT USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "insert_comments" ON step_comments FOR INSERT WITH CHECK (organization_id IN (SELECT public.user_org_ids()) AND user_id = auth.uid());
CREATE POLICY "update_own_comments" ON step_comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete_own_comments" ON step_comments FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_requests_org ON approval_requests(organization_id);
CREATE INDEX idx_requests_status ON approval_requests(status);
CREATE INDEX idx_steps_request ON approval_steps(request_id);
CREATE INDEX idx_steps_approver ON approval_steps(approver_id);
CREATE INDEX idx_comments_step ON step_comments(step_id);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON approval_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON approval_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON step_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- AUTO-CREATE ORG ON SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_slug TEXT;
BEGIN
  org_slug := LOWER(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data->>'company_name', SPLIT_PART(NEW.email, '@', 1)), '[^a-z0-9]+', '-', 'g')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  INSERT INTO public.organizations (name, slug) VALUES (COALESCE(NEW.raw_user_meta_data->>'company_name', SPLIT_PART(NEW.email, '@', 1)), org_slug) RETURNING id INTO new_org_id;
  INSERT INTO public.user_profiles (id, email, name) VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)));
  INSERT INTO public.organization_members (organization_id, user_id, role, joined_at) VALUES (new_org_id, NEW.id, 'owner', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

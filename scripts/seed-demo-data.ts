/**
 * Seed demo data for DealPress
 *
 * This script creates demo data for testing and demonstration purposes.
 * Run with: npx tsx scripts/seed-demo-data.ts
 *
 * Prerequisites:
 * - Supabase project must be set up
 * - Environment variables must be configured
 * - At least one user must be signed up through the UI first
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seed() {
  console.log('🌱 Starting seed process...\n');

  try {
    // Get the first user and their organization
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, name, email')
      .limit(1);

    if (!profiles || profiles.length === 0) {
      console.error('❌ No users found. Please sign up at least one user first.');
      process.exit(1);
    }

    const currentUser = profiles[0];
    console.log(`✓ Found user: ${currentUser.name} (${currentUser.email})`);

    // Get user's organization
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id, organizations(*)')
      .eq('user_id', currentUser.id)
      .single();

    if (!orgMember) {
      console.error('❌ User has no organization. Please complete signup flow.');
      process.exit(1);
    }

    const organization = Array.isArray(orgMember.organizations)
      ? orgMember.organizations[0]
      : orgMember.organizations;
    const orgId = organization.id;

    console.log(`✓ Found organization: ${organization.name}\n`);

    // Create additional demo users
    console.log('📝 Creating demo user profiles...');
    const demoUsers = [
      { name: 'Sarah Chen', email: 'sarah@demo.com', role: 'admin', job_title: 'VP Sales' },
      { name: 'Michael Park', email: 'michael@demo.com', role: 'member', job_title: 'Sales Manager' },
      { name: 'Jennifer Smith', email: 'jennifer@demo.com', role: 'member', job_title: 'Sales Rep' },
    ];

    const createdUserIds: string[] = [currentUser.id];

    for (const user of demoUsers) {
      // Check if profile already exists
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', user.email)
        .single();

      if (existing) {
        console.log(`  ↳ User ${user.name} already exists`);
        createdUserIds.push(existing.id);
        continue;
      }

      // Create a fake user ID (in production, these would be real Supabase auth users)
      const userId = `demo-${user.email.split('@')[0]}-${Date.now()}`;

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          name: user.name,
          email: user.email,
          avatar_url: null,
        });

      if (profileError) {
        console.error(`  ✗ Failed to create profile for ${user.name}:`, profileError.message);
        continue;
      }

      // Add to organization
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgId,
          user_id: userId,
          role: user.role,
          job_title: user.job_title,
        });

      if (memberError) {
        console.error(`  ✗ Failed to add ${user.name} to org:`, memberError.message);
        continue;
      }

      createdUserIds.push(userId);
      console.log(`  ✓ Created ${user.name} (${user.job_title})`);
    }

    console.log(`\n✓ Created ${createdUserIds.length} total users\n`);

    // Create approval templates
    console.log('📋 Creating approval templates...');
    const templates = [
      {
        name: 'Standard Deal Approval',
        description: 'For deals under $50k',
        object_type: 'deal',
        is_active: true,
        deal_amount_threshold: 50000,
        steps: [
          { step_name: 'Manager Review', approver_role: 'Sales Manager', step_order: 1 },
          { step_name: 'VP Approval', approver_role: 'VP Sales', step_order: 2 },
        ],
      },
      {
        name: 'Enterprise Deal Approval',
        description: 'For deals over $50k',
        object_type: 'deal',
        is_active: true,
        deal_amount_threshold: null,
        steps: [
          { step_name: 'Manager Review', approver_role: 'Sales Manager', step_order: 1 },
          { step_name: 'VP Approval', approver_role: 'VP Sales', step_order: 2 },
          { step_name: 'CFO Sign-off', approver_role: 'CFO', step_order: 3 },
        ],
      },
    ];

    const createdTemplates: { id: string; name: string; steps: any[] }[] = [];

    for (const template of templates) {
      const { data: existingTemplate } = await supabase
        .from('approval_templates')
        .select('id')
        .eq('name', template.name)
        .eq('organization_id', orgId)
        .single();

      if (existingTemplate) {
        console.log(`  ↳ Template "${template.name}" already exists`);
        const { data: steps } = await supabase
          .from('template_steps')
          .select('*')
          .eq('template_id', existingTemplate.id);
        createdTemplates.push({
          id: existingTemplate.id,
          name: template.name,
          steps: template.steps
        });
        continue;
      }

      const { data: newTemplate, error: templateError } = await supabase
        .from('approval_templates')
        .insert({
          organization_id: orgId,
          name: template.name,
          description: template.description,
          object_type: template.object_type,
          is_active: template.is_active,
          deal_amount_threshold: template.deal_amount_threshold,
        })
        .select()
        .single();

      if (templateError || !newTemplate) {
        console.error(`  ✗ Failed to create template "${template.name}":`, templateError?.message);
        continue;
      }

      // Create template steps
      for (const step of template.steps) {
        await supabase
          .from('template_steps')
          .insert({
            template_id: newTemplate.id,
            step_name: step.step_name,
            step_order: step.step_order,
            approver_role: step.approver_role,
            execution_type: 'sequential',
            is_required: true,
          });
      }

      createdTemplates.push({
        id: newTemplate.id,
        name: template.name,
        steps: template.steps
      });
      console.log(`  ✓ Created template: ${template.name}`);
    }

    console.log(`\n✓ Created ${createdTemplates.length} templates\n`);

    // Create approval requests with various statuses
    console.log('🎫 Creating approval requests...');

    const sampleRequests = [
      {
        deal_name: 'Acme Corp - Enterprise License',
        deal_amount: 85000,
        priority: 'high' as const,
        reason: 'Major account, expedited approval needed for Q1 close',
        status: 'pending' as const,
        template: createdTemplates[1],
        currentStep: 1, // VP Approval pending
      },
      {
        deal_name: 'TechStart Inc - Annual Subscription',
        deal_amount: 35000,
        priority: 'normal' as const,
        reason: 'Standard annual renewal with 10% discount',
        status: 'approved' as const,
        template: createdTemplates[0],
        currentStep: -1, // All approved
      },
      {
        deal_name: 'Global Dynamics - Pilot Program',
        deal_amount: 15000,
        priority: 'urgent' as const,
        reason: 'Pilot needs to start this week, competitor in the mix',
        status: 'pending' as const,
        template: createdTemplates[0],
        currentStep: 0, // Manager Review pending
      },
      {
        deal_name: 'MegaCorp - Multi-Year Deal',
        deal_amount: 250000,
        priority: 'high' as const,
        reason: '3-year commitment, requires CFO approval',
        status: 'rejected' as const,
        template: createdTemplates[1],
        currentStep: 1, // Rejected at VP level
      },
    ];

    for (const req of sampleRequests) {
      const { data: newRequest, error: requestError } = await supabase
        .from('approval_requests')
        .insert({
          organization_id: orgId,
          template_id: req.template.id,
          deal_name: req.deal_name,
          deal_amount: req.deal_amount,
          priority: req.priority,
          reason: req.reason,
          status: req.status,
          requester_id: createdUserIds[0],
          submitted_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: req.status !== 'pending' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (requestError || !newRequest) {
        console.error(`  ✗ Failed to create request "${req.deal_name}":`, requestError?.message);
        continue;
      }

      // Create approval steps
      const steps = req.template.steps;
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        // Assign approver based on role
        let approverId = createdUserIds[0]; // Default to first user
        if (step.approver_role === 'Sales Manager' && createdUserIds[2]) {
          approverId = createdUserIds[2];
        } else if (step.approver_role === 'VP Sales' && createdUserIds[1]) {
          approverId = createdUserIds[1];
        }

        let stepStatus: 'pending' | 'approved' | 'rejected' | 'not-started' = 'not-started';
        let actedAt: string | null = null;

        if (req.status === 'approved') {
          stepStatus = 'approved';
          actedAt = new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString();
        } else if (req.status === 'rejected' && i === req.currentStep) {
          stepStatus = 'rejected';
          actedAt = new Date().toISOString();
        } else if (req.status === 'pending' && i === req.currentStep) {
          stepStatus = 'pending';
        } else if (req.status === 'pending' && i < req.currentStep) {
          stepStatus = 'approved';
          actedAt = new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString();
        }

        await supabase
          .from('approval_steps')
          .insert({
            request_id: newRequest.id,
            step_name: step.step_name,
            step_order: step.step_order,
            approver_id: approverId,
            status: stepStatus,
            comments: stepStatus === 'rejected' ? 'Budget concerns, need more justification' : null,
            assigned_at: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
            acted_at: actedAt,
          });
      }

      console.log(`  ✓ Created request: ${req.deal_name} (${req.status})`);
    }

    console.log(`\n✓ Created ${sampleRequests.length} approval requests\n`);

    console.log('✅ Seed complete! You can now:\n');
    console.log('  1. Run: npm run dev');
    console.log('  2. Login with your account');
    console.log('  3. View the demo data in the dashboard\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

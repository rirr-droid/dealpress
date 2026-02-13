import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedTemplates() {
  console.log('🌱 Seeding approval templates...');

  // Get your organization
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id')
    .limit(1);

  if (!orgs || orgs.length === 0) {
    console.error('❌ No organizations found');
    return;
  }

  const orgId = orgs[0].id;
  console.log('✅ Found organization:', orgId);

  // Get your user
  const { data: users } = await supabase
    .from('user_profiles')
    .select('id')
    .limit(1);

  if (!users || users.length === 0) {
    console.error('❌ No users found');
    return;
  }

  const userId = users[0].id;

  // Template 1: Standard Deal Approval
  const { data: template1, error: t1Error } = await supabase
    .from('approval_templates')
    .insert({
      organization_id: orgId,
      name: 'Standard Deal Approval',
      description: 'Standard approval workflow for deals under $100k',
      object_type: 'opportunity',
      is_active: true,
      deal_amount_threshold: 100000,
      created_by: userId,
    })
    .select()
    .single();

  if (t1Error) {
    console.error('❌ Error creating template 1:', t1Error);
  } else {
    console.log('✅ Created template: Standard Deal Approval');

    // Add steps for template 1
    await supabase.from('template_steps').insert([
      {
        template_id: template1.id,
        step_name: 'Sales Manager Review',
        step_order: 1,
        approver_user_id: userId,
        execution_type: 'sequential',
        is_required: true,
      },
      {
        template_id: template1.id,
        step_name: 'Finance Review',
        step_order: 2,
        approver_user_id: userId,
        execution_type: 'sequential',
        is_required: true,
      },
    ]);
    console.log('  ✅ Added 2 approval steps');
  }

  // Template 2: Enterprise Deal Approval
  const { data: template2, error: t2Error } = await supabase
    .from('approval_templates')
    .insert({
      organization_id: orgId,
      name: 'Enterprise Deal Approval',
      description: 'Multi-level approval for enterprise deals over $100k',
      object_type: 'opportunity',
      is_active: true,
      deal_amount_threshold: 100000,
      discount_threshold: 20,
      created_by: userId,
    })
    .select()
    .single();

  if (t2Error) {
    console.error('❌ Error creating template 2:', t2Error);
  } else {
    console.log('✅ Created template: Enterprise Deal Approval');

    // Add steps for template 2
    await supabase.from('template_steps').insert([
      {
        template_id: template2.id,
        step_name: 'Sales Director Review',
        step_order: 1,
        approver_user_id: userId,
        execution_type: 'sequential',
        is_required: true,
      },
      {
        template_id: template2.id,
        step_name: 'Finance Director Review',
        step_order: 2,
        approver_user_id: userId,
        execution_type: 'sequential',
        is_required: true,
      },
      {
        template_id: template2.id,
        step_name: 'VP Approval',
        step_order: 3,
        approver_user_id: userId,
        execution_type: 'sequential',
        is_required: true,
      },
    ]);
    console.log('  ✅ Added 3 approval steps');
  }

  console.log('');
  console.log('🎉 Templates seeded successfully!');
  console.log('You can now create approval requests at https://dealpress.vercel.app/requests');
}

seedTemplates().catch(console.error);

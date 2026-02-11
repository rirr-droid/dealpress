'use server'

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserOrgId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface CreateRequestInput {
  deal_name: string;
  deal_amount?: number;
  deal_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  reason?: string;
  template_id?: string;
}

/**
 * Create a new approval request
 */
export async function createRequest(input: CreateRequestInput) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Check usage limits for free tier (Phase 3)

    // Get template if specified
    interface TemplateStep {
      step_name: string;
      step_order: number;
      approver_role?: string;
    }

    let templateSteps: TemplateStep[] = [];
    if (input.template_id) {
      const { data: template } = await supabase
        .from('approval_templates')
        .select('*, steps:template_steps(*)')
        .eq('id', input.template_id)
        .single();

      if (template?.steps) {
        templateSteps = (template.steps as TemplateStep[]).sort((a, b) => a.step_order - b.step_order);
      }
    }

    // Create the approval request
    const { data: request, error: requestError } = await supabase
      .from('approval_requests')
      .insert({
        organization_id: orgId,
        template_id: input.template_id || null,
        deal_name: input.deal_name,
        deal_amount: input.deal_amount || null,
        deal_url: input.deal_url || null,
        priority: input.priority,
        reason: input.reason || null,
        status: 'pending',
        requester_id: user.id,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating request:', requestError);
      return { success: false, error: 'Failed to create request' };
    }

    // Create approval steps from template
    if (templateSteps.length > 0) {
      // Get org members to assign approvers
      const { data: members } = await supabase
        .from('organization_members')
        .select('user_id, role, job_title')
        .eq('organization_id', orgId);

      interface OrgMember {
        user_id: string;
        role: string;
        job_title?: string;
      }

      const steps = templateSteps.map((templateStep, index: number) => {
        // Find an approver based on role
        // For now, just assign to first member with matching role or first admin
        const approver = (members as OrgMember[] | null)?.find(m =>
          m.job_title?.toLowerCase().includes(templateStep.approver_role?.toLowerCase() || '')
        ) || (members as OrgMember[] | null)?.find(m => m.role === 'admin') || (members as OrgMember[] | null)?.[0];

        return {
          request_id: request.id,
          step_name: templateStep.step_name,
          step_order: templateStep.step_order,
          approver_id: approver?.user_id || user.id, // Fallback to requester
          status: index === 0 ? 'pending' : 'not-started', // First step is pending
          assigned_at: index === 0 ? new Date().toISOString() : null,
        };
      });

      const { error: stepsError } = await supabase
        .from('approval_steps')
        .insert(steps);

      if (stepsError) {
        console.error('Error creating steps:', stepsError);
        // Don't fail the request, just log error
      }
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      request_id: request.id,
      action: 'request.created',
      metadata: { deal_name: input.deal_name, template_id: input.template_id },
    });

    // TODO: Send email notification (Phase 4)

    // Revalidate pages
    revalidatePath('/dashboard');
    revalidatePath('/requests');

    return { success: true, data: request };
  } catch (error) {
    console.error('Error in createRequest:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update an approval request
 */
export async function updateRequest(id: string, updates: Partial<CreateRequestInput>) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('approval_requests')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Error updating request:', error);
      return { success: false, error: 'Failed to update request' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/requests');
    revalidatePath(`/requests/${id}`);

    return { success: true, data };
  } catch (error) {
    console.error('Error in updateRequest:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

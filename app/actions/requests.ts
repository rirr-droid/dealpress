'use server'

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserOrgId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { canPerformAction } from "@/lib/billing/usage";
import { sendApprovalNeededEmail } from "@/lib/email/notifications";
import { createRequestSchema, CreateRequestInput } from "@/lib/validations";

/**
 * Create a new approval request
 */
export async function createRequest(input: CreateRequestInput) {
  try {
    // Validate input
    const validation = createRequestSchema.safeParse(input);
    if (!validation.success) {
      const errors = validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return { success: false, error: errors };
    }

    const validatedInput = validation.data;

    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check usage limits
    const { allowed, reason } = await canPerformAction(orgId, 'create_request');
    if (!allowed) {
      return { success: false, error: reason, errorCode: 'USAGE_LIMIT_REACHED' };
    }

    // Get template if specified
    interface TemplateStep {
      step_name: string;
      step_order: number;
      approver_role?: string;
    }

    let templateSteps: TemplateStep[] = [];
    if (validatedInput.template_id) {
      const { data: template } = await supabase
        .from('approval_templates')
        .select('*, steps:template_steps(*)')
        .eq('id', validatedInput.template_id)
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
        template_id: validatedInput.template_id || null,
        deal_name: validatedInput.deal_name,
        deal_amount: validatedInput.deal_amount || null,
        deal_url: validatedInput.deal_url || null,
        priority: validatedInput.priority,
        reason: validatedInput.reason || null,
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

      const { data: createdSteps, error: stepsError } = await supabase
        .from('approval_steps')
        .insert(steps)
        .select('*, approver:approver_id(name, email)');

      if (stepsError) {
        console.error('Error creating steps:', stepsError);
        // Don't fail the request, just log error
      }

      // Send email to first approver
      if (createdSteps && createdSteps.length > 0) {
        const firstStep = createdSteps[0];
        const firstApprover = Array.isArray(firstStep.approver)
          ? firstStep.approver[0]
          : firstStep.approver;

        if (firstApprover?.email) {
          // Get requester profile for name
          const { data: requesterProfile } = await supabase
            .from('user_profiles')
            .select('name')
            .eq('id', user.id)
            .single();

          const requesterName = requesterProfile?.name || user.email!;

          try {
            await sendApprovalNeededEmail({
              approverEmail: firstApprover.email,
              approverName: firstApprover.name,
              requesterName,
              dealName: validatedInput.deal_name,
              dealAmount: validatedInput.deal_amount,
              reason: validatedInput.reason,
              stepName: firstStep.step_name,
              requestId: request.id,
            });
          } catch (emailError) {
            console.error('Failed to send approval needed email:', emailError);
            // Don't fail the request creation if email fails
          }
        }
      }
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      request_id: request.id,
      action: 'request.created',
      metadata: { deal_name: validatedInput.deal_name, template_id: validatedInput.template_id },
    });

    // Revalidate pages
    revalidatePath('/dashboard');
    revalidatePath('/requests');
    revalidatePath(`/requests/${request.id}`);

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

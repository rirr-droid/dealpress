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
      console.log('Fetching template steps for template_id:', validatedInput.template_id);

      // Fetch template steps separately to avoid RLS join issues
      const { data: steps, error: stepsError } = await supabase
        .from('template_steps')
        .select('step_name, step_order, approver_role')
        .eq('template_id', validatedInput.template_id)
        .order('step_order', { ascending: true });

      console.log('Template steps fetched:', steps);
      console.log('Template steps error:', stepsError);

      if (steps && steps.length > 0) {
        templateSteps = steps as TemplateStep[];
      } else {
        console.warn('No template steps found for template:', validatedInput.template_id);
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
        .select('*');

      if (stepsError) {
        console.error('Error creating steps:', stepsError);
        // Don't fail the request, just log error
      }

      // Send email to first approver
      if (createdSteps && createdSteps.length > 0) {
        const firstStep = createdSteps[0];

        // Fetch approver details separately to avoid RLS join issues
        const { data: approverProfile, error: approverError } = await supabase
          .from('user_profiles')
          .select('name, email')
          .eq('id', firstStep.approver_id)
          .single();

        if (approverError) {
          console.error('Error fetching approver profile:', approverError);
        }

        if (approverProfile?.email) {
          // Get requester profile for name
          const { data: requesterProfile } = await supabase
            .from('user_profiles')
            .select('name')
            .eq('id', user.id)
            .single();

          const requesterName = requesterProfile?.name || user.email!;

          try {
            console.log('Attempting to send email to:', approverProfile.email);
            const emailResult = await sendApprovalNeededEmail({
              approverEmail: approverProfile.email,
              approverName: approverProfile.name || approverProfile.email,
              requesterName,
              dealName: validatedInput.deal_name,
              dealAmount: validatedInput.deal_amount,
              reason: validatedInput.reason,
              stepName: firstStep.step_name,
              requestId: request.id,
              stepId: firstStep.id,
              approverId: firstStep.approver_id,
            });

            if (!emailResult.success) {
              console.error('Email sending failed:', emailResult.error);
              console.error('RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY);
              console.error('JWT_SECRET configured:', !!process.env.JWT_SECRET);
            } else {
              console.log('Email sent successfully to:', approverProfile.email);
            }
          } catch (emailError) {
            console.error('Failed to send approval needed email:', emailError);
            console.error('Error details:', emailError instanceof Error ? emailError.message : 'Unknown error');
            // Don't fail the request creation if email fails
          }
        } else {
          console.error('No approver email found for step:', firstStep.id, 'approver_id:', firstStep.approver_id);
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

/**
 * Cancel an approval request
 * Only the requester or admins can cancel a request
 */
export async function cancelRequest(requestId: string, reason?: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the request to check permissions
    const { data: request, error: fetchError } = await supabase
      .from('approval_requests')
      .select('id, requester_id, status, deal_name, organization_id')
      .eq('id', requestId)
      .eq('organization_id', orgId)
      .single();

    if (fetchError || !request) {
      return { success: false, error: 'Request not found' };
    }

    // Check if request can be cancelled
    if (request.status === 'approved' || request.status === 'rejected') {
      return { success: false, error: 'Cannot cancel a request that has already been approved or rejected' };
    }

    if (request.status === 'cancelled') {
      return { success: false, error: 'Request is already cancelled' };
    }

    // Check permissions: only requester or admins can cancel
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    const isRequester = request.requester_id === user.id;
    const isAdmin = membership?.role === 'admin';

    if (!isRequester && !isAdmin) {
      return { success: false, error: 'Only the requester or admins can cancel this request' };
    }

    // Update request status to cancelled
    const { error: updateError } = await supabase
      .from('approval_requests')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .eq('organization_id', orgId);

    if (updateError) {
      console.error('Error cancelling request:', updateError);
      return { success: false, error: 'Failed to cancel request' };
    }

    // Update all pending approval steps to cancelled
    await supabase
      .from('approval_steps')
      .update({ status: 'cancelled' })
      .eq('request_id', requestId)
      .in('status', ['pending', 'not-started']);

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      request_id: requestId,
      action: 'request.cancelled',
      metadata: {
        deal_name: request.deal_name,
        cancelled_by: user.id,
        cancel_reason: reason || 'No reason provided'
      },
    });

    // Revalidate pages
    revalidatePath('/dashboard');
    revalidatePath('/requests');
    revalidatePath(`/requests/${requestId}`);

    return { success: true, message: 'Request cancelled successfully' };
  } catch (error) {
    console.error('Error in cancelRequest:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

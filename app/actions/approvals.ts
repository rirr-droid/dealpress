'use server'

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserOrgId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  sendRequestApprovedEmail,
  sendRequestRejectedEmail,
  sendStepApprovedEmail,
  sendApprovalNeededEmail,
} from "@/lib/email/notifications";

/**
 * Approve an approval step
 */
export async function approveStep(stepId: string, comments?: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get approver profile for name
    const { data: approverProfile } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const approverName = approverProfile?.name || user.email!;

    // Update the step to approved
    const { data: step, error: stepError } = await supabase
      .from('approval_steps')
      .update({
        status: 'approved',
        comments: comments || null,
        acted_at: new Date().toISOString(),
      })
      .eq('id', stepId)
      .eq('approver_id', user.id) // Ensure user is the approver
      .select(`
        *,
        request:approval_requests(*)
      `)
      .single();

    if (stepError) {
      console.error('Error approving step:', stepError);
      return { success: false, error: 'Failed to approve step' };
    }

    // Check if all steps are now approved
    const { data: allSteps } = await supabase
      .from('approval_steps')
      .select('id, status, step_order, step_name, approver:approver_id(name, email)')
      .eq('request_id', step.request.id)
      .order('step_order');

    const allApproved = allSteps?.every(s => s.status === 'approved');

    // If all approved, mark request as approved
    if (allApproved) {
      const { error: updateError } = await supabase
        .from('approval_requests')
        .update({
          status: 'approved',
          completed_at: new Date().toISOString(),
        })
        .eq('id', step.request.id);

      if (updateError) {
        console.error('Error updating request status:', updateError);
        return { success: false, error: 'Failed to update request status' };
      }

      // Send final approval email to requester
      if (step.request.requester?.email) {
        try {
          await sendRequestApprovedEmail({
            requesterEmail: step.request.requester.email,
            requesterName: step.request.requester.name,
            approverName,
            dealName: step.request.deal_name,
            dealAmount: step.request.deal_amount || undefined,
            comments: comments || undefined,
            requestId: step.request.id,
          });
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
          // Don't fail the approval if email fails
        }
      }
    } else {
      // Move to next step
      const nextPendingStep = allSteps?.find(s => s.status === 'not-started');
      if (nextPendingStep) {
        const { error: nextStepError } = await supabase
          .from('approval_steps')
          .update({ status: 'pending', assigned_at: new Date().toISOString() })
          .eq('id', nextPendingStep.id);

        if (nextStepError) {
          console.error('Error updating next step:', nextStepError);
          // Don't fail the approval, but log the issue
        }

        // Send progress update to requester
        if (step.request.requester?.email) {
          try {
            await sendStepApprovedEmail({
              requesterEmail: step.request.requester.email,
              requesterName: step.request.requester.name,
              approverName,
              dealName: step.request.deal_name,
              stepName: step.step_name,
              nextStepName: nextPendingStep.step_name,
              requestId: step.request.id,
            });
          } catch (emailError) {
            console.error('Failed to send step approved email:', emailError);
            // Don't fail the approval if email fails
          }
        }

        // Send approval needed email to next approver
        const nextApprover = Array.isArray(nextPendingStep.approver)
          ? nextPendingStep.approver[0]
          : nextPendingStep.approver;

        if (nextApprover?.email) {
          try {
            await sendApprovalNeededEmail({
              approverEmail: nextApprover.email,
              approverName: nextApprover.name,
              requesterName: step.request.requester?.name || 'Someone',
              dealName: step.request.deal_name,
              dealAmount: step.request.deal_amount || undefined,
              reason: step.request.reason || undefined,
              stepName: nextPendingStep.step_name,
              requestId: step.request.id,
            });
          } catch (emailError) {
            console.error('Failed to send approval needed email:', emailError);
            // Don't fail the approval if email fails
          }
        }
      }
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      request_id: step.request.id,
      action: 'step.approved',
      metadata: { step_id: stepId, comments },
    });

    // Revalidate pages
    revalidatePath('/dashboard');
    revalidatePath('/requests');
    revalidatePath(`/requests/${step.request.id}`);

    return { success: true, data: step };
  } catch (error) {
    console.error('Error in approveStep:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Reject an approval step
 */
export async function rejectStep(stepId: string, comments: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!comments || comments.trim().length === 0) {
      return { success: false, error: 'Comments are required for rejection' };
    }

    // Update the step to rejected
    const { data: step, error: stepError } = await supabase
      .from('approval_steps')
      .update({
        status: 'rejected',
        comments,
        acted_at: new Date().toISOString(),
      })
      .eq('id', stepId)
      .eq('approver_id', user.id) // Ensure user is the approver
      .select(`
        *,
        request:approval_requests(*)
      `)
      .single();

    if (stepError) {
      console.error('Error rejecting step:', stepError);
      return { success: false, error: 'Failed to reject step' };
    }

    // Mark entire request as rejected
    const { error: updateError } = await supabase
      .from('approval_requests')
      .update({
        status: 'rejected',
        completed_at: new Date().toISOString(),
      })
      .eq('id', step.request.id);

    if (updateError) {
      console.error('Error updating request status:', updateError);
      return { success: false, error: 'Failed to update request status' };
    }

    // Get approver profile for name
    const { data: approverProfile } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const approverName = approverProfile?.name || user.email!;

    // Send rejection email to requester
    if (step.request.requester?.email) {
      try {
        await sendRequestRejectedEmail({
          requesterEmail: step.request.requester.email,
          requesterName: step.request.requester.name,
          approverName,
          dealName: step.request.deal_name,
          dealAmount: step.request.deal_amount || undefined,
          comments,
          requestId: step.request.id,
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
        // Don't fail the rejection if email fails
      }
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      request_id: step.request.id,
      action: 'step.rejected',
      metadata: { step_id: stepId, comments },
    });

    // Revalidate pages
    revalidatePath('/dashboard');
    revalidatePath('/requests');
    revalidatePath(`/requests/${step.request.id}`);

    return { success: true, data: step };
  } catch (error) {
    console.error('Error in rejectStep:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

'use server'

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserOrgId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
      .select('id, status, step_order')
      .eq('request_id', step.request.id)
      .order('step_order');

    const allApproved = allSteps?.every(s => s.status === 'approved');

    // If all approved, mark request as approved
    if (allApproved) {
      await supabase
        .from('approval_requests')
        .update({
          status: 'approved',
          completed_at: new Date().toISOString(),
        })
        .eq('id', step.request.id);
    } else {
      // Move to next step
      const nextPendingStep = allSteps?.find(s => s.status === 'not-started');
      if (nextPendingStep) {
        await supabase
          .from('approval_steps')
          .update({ status: 'pending' })
          .eq('id', nextPendingStep.id);
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
    await supabase
      .from('approval_requests')
      .update({
        status: 'rejected',
        completed_at: new Date().toISOString(),
      })
      .eq('id', step.request.id);

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

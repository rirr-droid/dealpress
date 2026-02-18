'use server'

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserOrgId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Add a comment to an approval step
 */
export async function addStepComment(stepId: string, comment: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!comment.trim()) {
      return { success: false, error: 'Comment cannot be empty' };
    }

    // Verify the step exists - fetch step first
    const { data: step, error: stepError } = await supabase
      .from('approval_steps')
      .select('id, request_id')
      .eq('id', stepId)
      .single();

    if (stepError || !step) {
      return { success: false, error: 'Approval step not found' };
    }

    // Verify the request belongs to user's organization
    const { data: request, error: requestError } = await supabase
      .from('approval_requests')
      .select('organization_id')
      .eq('id', step.request_id)
      .single();

    if (requestError || !request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.organization_id !== orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Use step.request_id directly since we have it
    const stepWithRequest = step;

    // Insert the comment
    const { error: insertError } = await supabase
      .from('step_comments')
      .insert({
        step_id: stepId,
        organization_id: orgId,
        user_id: user.id,
        comment: comment.trim(),
      });

    if (insertError) {
      console.error('Error adding comment:', insertError);
      return { success: false, error: 'Failed to add comment' };
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'comment.created',
      metadata: { step_id: stepId, request_id: stepWithRequest.request_id },
    });

    // Revalidate the request detail page
    revalidatePath(`/requests/${stepWithRequest.request_id}`);

    return { success: true };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: 'Failed to add comment' };
  }
}

/**
 * Delete a comment (only author or admin)
 */
export async function deleteStepComment(commentId: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the comment to verify ownership
    const { data: comment, error: commentError } = await supabase
      .from('step_comments')
      .select('id, user_id, step_id')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return { success: false, error: 'Comment not found' };
    }

    // Get the step to find request_id for revalidation
    const { data: step } = await supabase
      .from('approval_steps')
      .select('request_id')
      .eq('id', comment.step_id)
      .single();

    if (!step) {
      return { success: false, error: 'Step not found' };
    }

    const commentWithStep = {
      ...comment,
      approval_steps: { request_id: step.request_id }
    };

    // Delete the comment (RLS will ensure user has permission)
    const { error: deleteError } = await supabase
      .from('step_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return { success: false, error: 'Failed to delete comment' };
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'comment.deleted',
      metadata: { comment_id: commentId, step_id: commentWithStep.step_id },
    });

    // Revalidate the request detail page
    revalidatePath(`/requests/${commentWithStep.approval_steps.request_id}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: 'Failed to delete comment' };
  }
}

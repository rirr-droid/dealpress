import { NextRequest, NextResponse } from 'next/server';
import { verifyApprovalToken } from '@/lib/auth/email-tokens';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sendRequestApprovedEmail, sendStepApprovedEmail, sendApprovalNeededEmail } from '@/lib/email/notifications';

/**
 * Handle one-click approval from email
 * GET /api/approve/[token]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    // Verify the token
    const payload = verifyApprovalToken(token);
    if (!payload) {
      // Token is invalid or expired
      return NextResponse.redirect(
        new URL(`/approve/error?reason=invalid_token`, request.url)
      );
    }

    const { stepId, approverId, action } = payload;

    // Ensure this is an approve action
    if (action !== 'approve') {
      return NextResponse.redirect(
        new URL(`/approve/error?reason=invalid_action`, request.url)
      );
    }

    // Use service role client since this is an unauthenticated email link
    const supabase = createServiceRoleClient();

    // Get the step with request details
    const { data: step, error: stepError } = await supabase
      .from('approval_steps')
      .select(`
        *,
        request:approval_requests(*)
      `)
      .eq('id', stepId)
      .single();

    if (stepError || !step) {
      console.error('Error fetching step:', stepError);
      return NextResponse.redirect(
        new URL(`/approve/error?reason=step_not_found`, request.url)
      );
    }

    // Verify the approver ID matches
    if (step.approver_id !== approverId) {
      console.error('Approver ID mismatch:', { stepApproverId: step.approver_id, tokenApproverId: approverId });
      return NextResponse.redirect(
        new URL(`/approve/error?reason=unauthorized`, request.url)
      );
    }

    // Prevent self-approval: Check if approver is the requester (TEMPORARILY DISABLED FOR TESTING)
    // if (step.approver_id === step.request.requester_id) {
    //   console.error('Self-approval attempt:', { approverId: step.approver_id, requesterId: step.request.requester_id });
    //   return NextResponse.redirect(
    //     new URL(`/approve/error?reason=self_approval_not_allowed`, request.url)
    //   );
    // }

    // Check if step is already acted upon
    if (step.status !== 'pending') {
      // Already approved or rejected
      return NextResponse.redirect(
        new URL(`/approve/error?reason=already_acted&stepId=${stepId}&status=${step.status}`, request.url)
      );
    }

    // Check if token has already been used (replay attack prevention)
    if (step.email_token_used) {
      return NextResponse.redirect(
        new URL(`/approve/error?reason=token_used`, request.url)
      );
    }

    // Get approver profile for name
    const { data: approverProfile } = await supabase
      .from('user_profiles')
      .select('name, email')
      .eq('id', approverId)
      .single();

    const approverName = approverProfile?.name || approverProfile?.email || 'Unknown';

    // Approve the step
    const { error: updateError } = await supabase
      .from('approval_steps')
      .update({
        status: 'approved',
        comments: null,
        acted_at: new Date().toISOString(),
        approved_via: 'email',
        email_token_used: true,
      })
      .eq('id', stepId);

    if (updateError) {
      console.error('Error updating step:', updateError);
      return NextResponse.redirect(
        new URL(`/approve/error?reason=update_failed`, request.url)
      );
    }

    // Get all steps to check if request is fully approved
    const { data: allSteps } = await supabase
      .from('approval_steps')
      .select('id, status, step_order, step_name, approver_id')
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

      // Get requester details
      const { data: requester } = await supabase
        .from('user_profiles')
        .select('email, name')
        .eq('id', step.request.requester_id)
        .single();

      // Send final approval email to requester
      if (requester?.email) {
        try {
          await sendRequestApprovedEmail({
            requesterEmail: requester.email,
            requesterName: requester.name,
            approverName,
            dealName: step.request.deal_name,
            dealAmount: step.request.deal_amount || undefined,
            requestId: step.request.id,
          });
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
        }
      }
    } else {
      // Move to next step
      const nextPendingStep = allSteps?.find(s => s.status === 'not-started');
      if (nextPendingStep) {
        await supabase
          .from('approval_steps')
          .update({ status: 'pending', assigned_at: new Date().toISOString() })
          .eq('id', nextPendingStep.id);

        // Get requester details
        const { data: requester } = await supabase
          .from('user_profiles')
          .select('email, name')
          .eq('id', step.request.requester_id)
          .single();

        // Send progress update to requester
        if (requester?.email) {
          try {
            await sendStepApprovedEmail({
              requesterEmail: requester.email,
              requesterName: requester.name,
              approverName,
              dealName: step.request.deal_name,
              stepName: step.step_name,
              nextStepName: nextPendingStep.step_name,
              requestId: step.request.id,
            });
          } catch (emailError) {
            console.error('Failed to send step approved email:', emailError);
          }
        }

        // Send approval needed email to next approver
        // Fetch next approver details separately to avoid RLS join issues
        const { data: nextApproverProfile } = await supabase
          .from('user_profiles')
          .select('name, email')
          .eq('id', nextPendingStep.approver_id)
          .single();

        if (nextApproverProfile?.email) {
          try {
            await sendApprovalNeededEmail({
              approverEmail: nextApproverProfile.email,
              approverName: nextApproverProfile.name || nextApproverProfile.email,
              requesterName: requester?.name || 'Someone',
              dealName: step.request.deal_name,
              dealAmount: step.request.deal_amount || undefined,
              reason: step.request.reason || undefined,
              stepName: nextPendingStep.step_name,
              requestId: step.request.id,
              stepId: nextPendingStep.id,
              approverId: nextPendingStep.approver_id,
            });
          } catch (emailError) {
            console.error('Failed to send approval needed email:', emailError);
          }
        }
      }
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: step.request.organization_id,
      user_id: approverId,
      request_id: step.request.id,
      action: 'step.approved',
      metadata: { step_id: stepId, via: 'email' },
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/approve/success?dealName=${encodeURIComponent(step.request.deal_name)}&requestId=${step.request.id}&allApproved=${allApproved}`, request.url)
    );
  } catch (error) {
    console.error('Error in approve route:', error);
    return NextResponse.redirect(
      new URL(`/approve/error?reason=server_error`, request.url)
    );
  }
}

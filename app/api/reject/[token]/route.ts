import { NextRequest, NextResponse } from 'next/server';
import { verifyApprovalToken } from '@/lib/auth/email-tokens';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sendRequestRejectedEmail } from '@/lib/email/notifications';

/**
 * Handle GET request - Show rejection form
 * GET /api/reject/[token]
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
      return NextResponse.redirect(
        new URL(`/approve/error?reason=invalid_token`, request.url)
      );
    }

    const { stepId, approverId, action } = payload;

    // Ensure this is a reject action
    if (action !== 'reject') {
      return NextResponse.redirect(
        new URL(`/approve/error?reason=invalid_action`, request.url)
      );
    }

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
      return NextResponse.redirect(
        new URL(`/approve/error?reason=step_not_found`, request.url)
      );
    }

    // Verify the approver ID matches
    if (step.approver_id !== approverId) {
      return NextResponse.redirect(
        new URL(`/approve/error?reason=unauthorized`, request.url)
      );
    }

    // Check if step is already acted upon
    if (step.status !== 'pending') {
      return NextResponse.redirect(
        new URL(`/approve/error?reason=already_acted&stepId=${stepId}&status=${step.status}`, request.url)
      );
    }

    // Check if token has already been used
    if (step.email_token_used) {
      return NextResponse.redirect(
        new URL(`/approve/error?reason=token_used`, request.url)
      );
    }

    // Redirect to reject form page with token
    return NextResponse.redirect(
      new URL(`/reject?token=${token}&dealName=${encodeURIComponent(step.request.deal_name)}&stepName=${encodeURIComponent(step.step_name)}`, request.url)
    );
  } catch (error) {
    console.error('Error in reject GET route:', error);
    return NextResponse.redirect(
      new URL(`/approve/error?reason=server_error`, request.url)
    );
  }
}

/**
 * Handle POST request - Process rejection with comment
 * POST /api/reject/[token]
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    const body = await request.json();
    const { comments } = body;

    // Validate comments
    if (!comments || comments.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comments are required for rejection' },
        { status: 400 }
      );
    }

    // Verify the token
    const payload = verifyApprovalToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { stepId, approverId, action } = payload;

    // Ensure this is a reject action
    if (action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action for this token' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      );
    }

    // Verify the approver ID matches
    if (step.approver_id !== approverId) {
      return NextResponse.json(
        { error: 'Unauthorized to reject this step' },
        { status: 403 }
      );
    }

    // Check if step is already acted upon
    if (step.status !== 'pending') {
      return NextResponse.json(
        { error: 'Step has already been acted upon' },
        { status: 409 }
      );
    }

    // Check if token has already been used
    if (step.email_token_used) {
      return NextResponse.json(
        { error: 'Token has already been used' },
        { status: 409 }
      );
    }

    // Get approver profile for name
    const { data: approverProfile } = await supabase
      .from('user_profiles')
      .select('name, email')
      .eq('id', approverId)
      .single();

    const approverName = approverProfile?.name || approverProfile?.email || 'Unknown';

    // Reject the step
    const { error: updateError } = await supabase
      .from('approval_steps')
      .update({
        status: 'rejected',
        comments: comments.trim(),
        acted_at: new Date().toISOString(),
        approved_via: 'email',
        email_token_used: true,
      })
      .eq('id', stepId);

    if (updateError) {
      console.error('Error updating step:', updateError);
      return NextResponse.json(
        { error: 'Failed to reject step' },
        { status: 500 }
      );
    }

    // Mark entire request as rejected
    await supabase
      .from('approval_requests')
      .update({
        status: 'rejected',
        completed_at: new Date().toISOString(),
      })
      .eq('id', step.request.id);

    // Get requester details
    const { data: requester } = await supabase
      .from('user_profiles')
      .select('email, name')
      .eq('id', step.request.requester_id)
      .single();

    // Send rejection email to requester
    if (requester?.email) {
      try {
        await sendRequestRejectedEmail({
          requesterEmail: requester.email,
          requesterName: requester.name,
          approverName,
          dealName: step.request.deal_name,
          dealAmount: step.request.deal_amount || undefined,
          comments: comments.trim(),
          requestId: step.request.id,
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: step.request.organization_id,
      user_id: approverId,
      request_id: step.request.id,
      action: 'step.rejected',
      metadata: { step_id: stepId, comments: comments.trim(), via: 'email' },
    });

    // Return success with redirect URL
    return NextResponse.json({
      success: true,
      redirectUrl: `/approve/success?dealName=${encodeURIComponent(step.request.deal_name)}&requestId=${step.request.id}&rejected=true`,
    });
  } catch (error) {
    console.error('Error in reject POST route:', error);
    return NextResponse.json(
      { error: 'Server error occurred' },
      { status: 500 }
    );
  }
}

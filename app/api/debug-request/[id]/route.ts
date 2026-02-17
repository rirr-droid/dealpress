import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to check request details and email sending
 * Visit: /api/debug-request/[request-id]
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Get the request
    const { data: approvalRequest, error: requestError } = await supabase
      .from('approval_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (requestError || !approvalRequest) {
      return NextResponse.json({
        success: false,
        error: 'Request not found',
      }, { status: 404 });
    }

    // Get approval steps
    const { data: steps, error: stepsError } = await supabase
      .from('approval_steps')
      .select('*')
      .eq('request_id', id)
      .order('step_order');

    // Get requester
    const { data: requester, error: requesterError } = await supabase
      .from('user_profiles')
      .select('id, email, name')
      .eq('id', approvalRequest.requester_id)
      .single();

    // Fetch approver details separately to avoid RLS join issues
    const firstStep = steps?.[0];
    let firstApprover = null;

    if (firstStep?.approver_id) {
      const { data: approverProfile } = await supabase
        .from('user_profiles')
        .select('id, email, name')
        .eq('id', firstStep.approver_id)
        .single();

      firstApprover = approverProfile;
    }

    return NextResponse.json({
      success: true,
      request: {
        id: approvalRequest.id,
        deal_name: approvalRequest.deal_name,
        status: approvalRequest.status,
        created_at: approvalRequest.created_at,
      },
      requester: requester || null,
      steps: await Promise.all((steps || []).map(async (step) => {
        // Fetch each approver separately
        const { data: approverProfile } = await supabase
          .from('user_profiles')
          .select('id, email, name')
          .eq('id', step.approver_id)
          .single();

        return {
          id: step.id,
          step_name: step.step_name,
          step_order: step.step_order,
          status: step.status,
          approver: approverProfile || null,
        };
      })),
      firstApprover: firstApprover || null,
      emailWouldSendTo: firstApprover?.email || 'NO EMAIL FOUND',
      resendOnlyAllows: 'rob@dealpress.ai',
      willEmailWork: firstApprover?.email === 'rob@dealpress.ai',
      diagnostics: {
        hasSteps: !!steps && steps.length > 0,
        hasFirstStep: !!firstStep,
        hasFirstApprover: !!firstApprover,
        firstApproverEmail: firstApprover?.email || null,
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

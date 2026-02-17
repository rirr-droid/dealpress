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
      .select('*, approver:approver_id(id, email, name)')
      .eq('request_id', id)
      .order('step_order');

    // Get requester
    const { data: requester, error: requesterError } = await supabase
      .from('user_profiles')
      .select('id, email, name')
      .eq('id', approvalRequest.requester_id)
      .single();

    const firstStep = steps?.[0];
    const firstApprover = Array.isArray(firstStep?.approver)
      ? firstStep.approver[0]
      : firstStep?.approver;

    return NextResponse.json({
      success: true,
      request: {
        id: approvalRequest.id,
        deal_name: approvalRequest.deal_name,
        status: approvalRequest.status,
        created_at: approvalRequest.created_at,
      },
      requester: requester || null,
      steps: steps?.map(step => ({
        id: step.id,
        step_name: step.step_name,
        step_order: step.step_order,
        status: step.status,
        approver: Array.isArray(step.approver) ? step.approver[0] : step.approver,
      })) || [],
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

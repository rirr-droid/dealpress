import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Slack interactive message handler
 * Handles button clicks from Slack messages (Approve/Reject)
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const payloadStr = params.get('payload');

    if (!payloadStr) {
      return NextResponse.json({ error: 'No payload' }, { status: 400 });
    }

    const payload = JSON.parse(payloadStr);

    // Verify the request is from Slack
    const isValid = verifySlackRequest(request, body);
    if (!isValid) {
      console.error('Invalid Slack signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Handle different interaction types
    if (payload.type === 'block_actions' && payload.actions?.[0]) {
      return handleBlockAction(payload);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Slack interactive error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle block action (button click)
 */
async function handleBlockAction(payload: any) {
  const action = payload.actions[0];
  const slackUserId = payload.user.id;
  const slackTeamId = payload.team.id;

  // Parse action value: "approve:requestId:stepId" or "reject:requestId:stepId"
  const [actionType, requestId, stepId] = action.value.split(':');

  const supabase = await createClient();

  // Find the organization by Slack workspace ID
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slack_workspace_id', slackTeamId)
    .single();

  if (!org) {
    return NextResponse.json({
      text: '❌ Organization not found. Please reconnect Slack integration.',
    });
  }

  // Find the DealPress user by Slack user ID
  const { data: slackUser } = await supabase
    .from('slack_users')
    .select('user_id')
    .eq('organization_id', org.id)
    .eq('slack_user_id', slackUserId)
    .single();

  if (!slackUser?.user_id) {
    return NextResponse.json({
      text: '❌ Your Slack account is not linked to a DealPress account. Please contact your admin.',
    });
  }

  // Verify the user is an approver for this step
  const { data: step } = await supabase
    .from('approval_steps')
    .select('approver_id, status')
    .eq('id', stepId)
    .eq('request_id', requestId)
    .single();

  if (!step) {
    return NextResponse.json({
      text: '❌ Approval step not found.',
    });
  }

  if (step.approver_id !== slackUser.user_id) {
    return NextResponse.json({
      text: '❌ You are not authorized to approve this request.',
    });
  }

  if (step.status !== 'pending') {
    return NextResponse.json({
      text: `ℹ️ This request has already been ${step.status}.`,
    });
  }

  // Get request details for the response message and check for self-approval
  const { data: approvalRequest } = await supabase
    .from('approval_requests')
    .select('deal_name, deal_amount, requester_id')
    .eq('id', requestId)
    .single();

  // Prevent self-approval
  if (approvalRequest?.requester_id === slackUser.user_id) {
    return NextResponse.json({
      text: '❌ You cannot approve your own request.',
    });
  }

  if (actionType === 'approve') {
    // Approve the step
    const { error } = await supabase
      .from('approval_steps')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        comments: 'Approved via Slack',
      })
      .eq('id', stepId);

    if (error) {
      console.error('Failed to approve step:', error);
      return NextResponse.json({
        text: '❌ Failed to approve. Please try again.',
      });
    }

    // Check if all steps are approved
    const { data: allSteps } = await supabase
      .from('approval_steps')
      .select('status')
      .eq('request_id', requestId);

    const allApproved = allSteps?.every((s) => s.status === 'approved');

    if (allApproved) {
      // Update request status to approved
      await supabase
        .from('approval_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
    }

    // Return updated message
    return NextResponse.json({
      replace_original: true,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `✅ Approved: ${approvalRequest?.deal_name}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Approved by* <@${slackUserId}> at ${new Date().toLocaleTimeString()}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Deal:*\n${approvalRequest?.deal_name}`,
            },
            {
              type: 'mrkdwn',
              text: `*Amount:*\n${approvalRequest?.deal_amount ? `$${approvalRequest.deal_amount.toLocaleString()}` : 'N/A'}`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '👀 View in DealPress',
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL}/requests/${requestId}`,
            },
          ],
        },
      ],
    });
  } else if (actionType === 'reject') {
    // For rejection, we should ideally show a modal to collect rejection reason
    // For now, we'll reject with a default message
    const { error } = await supabase
      .from('approval_steps')
      .update({
        status: 'rejected',
        approved_at: new Date().toISOString(),
        comments: 'Rejected via Slack',
      })
      .eq('id', stepId);

    if (error) {
      console.error('Failed to reject step:', error);
      return NextResponse.json({
        text: '❌ Failed to reject. Please try again.',
      });
    }

    // Update request status to rejected
    await supabase
      .from('approval_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    // Return updated message
    return NextResponse.json({
      replace_original: true,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `❌ Rejected: ${approvalRequest?.deal_name}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Rejected by* <@${slackUserId}> at ${new Date().toLocaleTimeString()}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Deal:*\n${approvalRequest?.deal_name}`,
            },
            {
              type: 'mrkdwn',
              text: `*Amount:*\n${approvalRequest?.deal_amount ? `$${approvalRequest.deal_amount.toLocaleString()}` : 'N/A'}`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '👀 View in DealPress',
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL}/requests/${requestId}`,
            },
          ],
        },
      ],
    });
  }

  return NextResponse.json({ ok: true });
}

/**
 * Verify request is from Slack using signing secret
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */
function verifySlackRequest(request: Request, body: string): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  if (!signingSecret) {
    console.error('SLACK_SIGNING_SECRET not configured');
    return false;
  }

  const slackSignature = request.headers.get('x-slack-signature');
  const slackTimestamp = request.headers.get('x-slack-request-timestamp');

  if (!slackSignature || !slackTimestamp) {
    return false;
  }

  // Prevent replay attacks - request must be within 5 minutes
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(slackTimestamp)) > 60 * 5) {
    console.error('Slack request timestamp is too old');
    return false;
  }

  // Compute the signature
  const signatureBaseString = `v0:${slackTimestamp}:${body}`;
  const mySignature =
    'v0=' +
    crypto
      .createHmac('sha256', signingSecret)
      .update(signatureBaseString)
      .digest('hex');

  // Compare signatures
  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(slackSignature)
  );
}

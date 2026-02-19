import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/crypto/encryption';

interface SlackNotificationParams {
  organizationId: string;
  approverEmail: string;
  dealName: string;
  dealAmount?: number;
  requesterName: string;
  reason?: string;
  requestId: string;
  stepId: string;
}

interface SlackUser {
  id: string;
  profile: {
    email: string;
    display_name?: string;
    real_name?: string;
  };
}

/**
 * Send Slack approval notification with interactive buttons
 */
export async function sendSlackApprovalNotification(params: SlackNotificationParams) {
  const {
    organizationId,
    approverEmail,
    dealName,
    dealAmount,
    requesterName,
    reason,
    requestId,
    stepId,
  } = params;

  try {
    const supabase = await createClient();

    // Get Slack configuration for organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('slack_enabled, slack_bot_token, slack_workspace_id, subscription_tier')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      console.log('Organization not found:', organizationId);
      return { success: false, error: 'Organization not found' };
    }

    // Check if Slack is enabled and org has Pro tier
    if (!org.slack_enabled || !org.slack_bot_token) {
      console.log('Slack not enabled for organization:', organizationId);
      return { success: false, error: 'Slack not configured' };
    }

    // Slack is a Pro feature
    if (org.subscription_tier !== 'pro' && org.subscription_tier !== 'enterprise') {
      console.log('Slack requires Pro tier for organization:', organizationId);
      return { success: false, error: 'Slack requires Pro subscription' };
    }

    // Decrypt the bot token
    const botToken = decrypt(org.slack_bot_token);

    // Find Slack user by email
    const slackUser = await findSlackUserByEmail(botToken, approverEmail);

    if (!slackUser) {
      console.log('Slack user not found for email:', approverEmail);
      return { success: false, error: 'Slack user not found' };
    }

    // Build Slack message blocks
    const blocks = buildApprovalMessageBlocks({
      dealName,
      dealAmount,
      requesterName,
      reason,
      requestId,
      stepId,
    });

    // Send DM to approver
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        channel: slackUser.id, // DM to user
        blocks,
        text: `🔔 Approval Required: ${dealName}`, // Fallback text for notifications
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('Slack API error:', result);
      return { success: false, error: result.error || 'Failed to send Slack message' };
    }

    console.log('Slack notification sent successfully:', result.ts);
    return { success: true, messageTs: result.ts };
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Find Slack user by email using Slack API
 */
async function findSlackUserByEmail(botToken: string, email: string): Promise<SlackUser | null> {
  try {
    const response = await fetch(
      `https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${botToken}`,
        },
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error('Slack user lookup error:', data.error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Error finding Slack user:', error);
    return null;
  }
}

/**
 * Build Slack Block Kit message for approval notification
 */
function buildApprovalMessageBlocks(params: {
  dealName: string;
  dealAmount?: number;
  requesterName: string;
  reason?: string;
  requestId: string;
  stepId: string;
}) {
  const { dealName, dealAmount, requesterName, reason, requestId, stepId } = params;

  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🔔 Approval Required: ${dealName}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Deal:*\n${dealName}`,
        },
        {
          type: 'mrkdwn',
          text: `*Amount:*\n${dealAmount ? `$${dealAmount.toLocaleString()}` : 'N/A'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Requester:*\n${requesterName}`,
        },
        {
          type: 'mrkdwn',
          text: `*Status:*\n⏳ Pending your approval`,
        },
      ],
    },
  ];

  // Add justification if provided
  if (reason) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Justification:*\n${reason}`,
      },
    });
  }

  // Add divider
  blocks.push({
    type: 'divider',
  });

  // Add action buttons
  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '✅ Approve',
          emoji: true,
        },
        style: 'primary',
        value: `approve:${requestId}:${stepId}`,
        action_id: 'approve_request',
      },
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '❌ Decline',
          emoji: true,
        },
        style: 'danger',
        value: `reject:${requestId}:${stepId}`,
        action_id: 'decline_request',
      },
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '👀 View Details',
          emoji: true,
        },
        url: `${process.env.NEXT_PUBLIC_APP_URL}/requests/${requestId}`,
      },
    ],
  });

  return blocks;
}

/**
 * Update Slack message after approval/rejection
 */
export async function updateSlackMessage(
  organizationId: string,
  channel: string,
  messageTs: string,
  status: 'approved' | 'rejected',
  userName: string
) {
  try {
    const supabase = await createClient();

    const { data: org } = await supabase
      .from('organizations')
      .select('slack_bot_token')
      .eq('id', organizationId)
      .single();

    if (!org?.slack_bot_token) {
      return { success: false, error: 'Slack not configured' };
    }

    const botToken = decrypt(org.slack_bot_token);

    const emoji = status === 'approved' ? '✅' : '❌';
    const statusText = status === 'approved' ? 'Approved' : 'Rejected';

    await fetch('https://slack.com/api/chat.update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        channel,
        ts: messageTs,
        text: `${emoji} ${statusText} by ${userName}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${emoji} *${statusText}* by ${userName}`,
            },
          },
        ],
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating Slack message:', error);
    return { success: false, error: 'Failed to update message' };
  }
}

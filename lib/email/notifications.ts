import { sendEmail } from './resend';
import ApprovalNeededEmail from './templates/ApprovalNeeded';
import RequestApprovedEmail from './templates/RequestApproved';
import RequestRejectedEmail from './templates/RequestRejected';
import TeamInvitationEmail from './templates/TeamInvitation';
import { generateApprovalToken, generateRejectionToken } from '@/lib/auth/email-tokens';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Send approval needed notification to approver
 */
export async function sendApprovalNeededEmail({
  approverEmail,
  approverName,
  requesterName,
  dealName,
  dealAmount,
  reason,
  stepName,
  requestId,
  stepId,
  approverId,
}: {
  approverEmail: string;
  approverName: string;
  requesterName: string;
  dealName: string;
  dealAmount?: number;
  reason?: string;
  stepName: string;
  requestId: string;
  stepId?: string;
  approverId?: string;
}) {
  const requestUrl = `${APP_URL}/requests/${requestId}`;

  // Generate one-click approval tokens if stepId and approverId are provided
  let approveUrl: string | undefined;
  let rejectUrl: string | undefined;

  if (stepId && approverId) {
    try {
      const approveToken = generateApprovalToken(stepId, approverId, 'approve');
      const rejectToken = generateRejectionToken(stepId, approverId);
      approveUrl = `${APP_URL}/api/approve/${approveToken}`;
      rejectUrl = `${APP_URL}/api/reject/${rejectToken}`;
    } catch (error) {
      console.error('Failed to generate approval tokens:', error);
      // Continue without tokens - email will fall back to "Review Request" button
    }
  }

  const amountText = dealAmount ? `$${dealAmount.toLocaleString()}` : '';
  const reasonText = reason ? `<p style="color: #666666; font-size: 14px; margin: 10px 0 0; line-height: 1.5;"><strong>Reason:</strong> ${reason}</p>` : '';

  return await sendEmail({
    to: approverEmail,
    subject: `Approval Required for ${dealName}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Approval Request</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f6f6; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #0071e3; padding: 30px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">New Approval Request</h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Hello ${approverName},
                    </p>
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      ${requesterName} has submitted a deal that requires your approval.
                    </p>

                    <!-- Deal Details Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; border-radius: 6px; margin-bottom: 30px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h2 style="margin: 0 0 15px; color: #1a1a1a; font-size: 20px; font-weight: 600;">${dealName}</h2>
                          ${amountText ? `<p style="margin: 0 0 10px; color: #333333; font-size: 16px;"><strong>Deal Amount:</strong> ${amountText}</p>` : ''}
                          <p style="margin: 0 0 10px; color: #666666; font-size: 14px;"><strong>Approval Step:</strong> ${stepName}</p>
                          ${reasonText}
                        </td>
                      </tr>
                    </table>

                    ${approveUrl && rejectUrl ? `
                    <!-- Action Buttons -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td align="center" style="padding: 10px 0;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-right: 10px;">
                                <a href="${approveUrl}" style="display: inline-block; background-color: #34c759; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">Approve Request</a>
                              </td>
                              <td style="padding-left: 10px;">
                                <a href="${rejectUrl}" style="display: inline-block; background-color: #ff3b30; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">Reject Request</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding: 10px 0;">
                          <a href="${requestUrl}" style="display: inline-block; background-color: #0071e3; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">View Complete Details</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f6f6f6; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
                    <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.5;">
                      This is an automated notification from DealPress
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}

/**
 * Send request approved notification to requester
 */
export async function sendRequestApprovedEmail({
  requesterEmail,
  requesterName,
  approverName,
  dealName,
  dealAmount,
  comments,
  requestId,
}: {
  requesterEmail: string;
  requesterName: string;
  approverName: string;
  dealName: string;
  dealAmount?: number;
  comments?: string;
  requestId: string;
}) {
  const requestUrl = `${APP_URL}/requests/${requestId}`;

  return await sendEmail({
    to: requesterEmail,
    subject: `✅ Approved: ${dealName}`,
    react: RequestApprovedEmail({
      requesterName,
      approverName,
      dealName,
      dealAmount,
      comments,
      requestUrl,
    }),
  });
}

/**
 * Send request rejected notification to requester
 */
export async function sendRequestRejectedEmail({
  requesterEmail,
  requesterName,
  approverName,
  dealName,
  dealAmount,
  comments,
  requestId,
}: {
  requesterEmail: string;
  requesterName: string;
  approverName: string;
  dealName: string;
  dealAmount?: number;
  comments: string;
  requestId: string;
}) {
  const requestUrl = `${APP_URL}/requests/${requestId}`;

  return await sendEmail({
    to: requesterEmail,
    subject: `❌ Rejected: ${dealName}`,
    react: RequestRejectedEmail({
      requesterName,
      approverName,
      dealName,
      dealAmount,
      comments,
      requestUrl,
    }),
  });
}

/**
 * Send step approved notification (for multi-step workflows)
 */
export async function sendStepApprovedEmail({
  requesterEmail,
  requesterName,
  approverName,
  dealName,
  stepName,
  nextStepName,
  requestId,
}: {
  requesterEmail: string;
  requesterName: string;
  approverName: string;
  dealName: string;
  stepName: string;
  nextStepName?: string;
  requestId: string;
}) {
  const requestUrl = `${APP_URL}/requests/${requestId}`;
  const message = nextStepName
    ? `${stepName} has been approved by ${approverName}. The request is now waiting for ${nextStepName}.`
    : `All approvals are complete! ${approverName} has approved the final step.`;

  return await sendEmail({
    to: requesterEmail,
    subject: `Progress Update: ${dealName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1d1d1f; font-size: 28px; margin-bottom: 20px;">Approval Progress Update</h1>
        <p style="color: #1d1d1f; font-size: 16px; line-height: 24px;">Hi ${requesterName},</p>
        <p style="color: #1d1d1f; font-size: 16px; line-height: 24px;">${message}</p>
        <div style="background: #f5f5f7; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h2 style="color: #1d1d1f; font-size: 20px; margin: 0 0 10px;">${dealName}</h2>
          <p style="color: #86868b; font-size: 14px; margin: 0;">Step completed: ${stepName}</p>
        </div>
        <a href="${requestUrl}" style="display: inline-block; background: #0071e3; color: white; padding: 12px 24px; border-radius: 20px; text-decoration: none; font-weight: 600; margin: 16px 0;">View Details</a>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
        <p style="color: #86868b; font-size: 14px; line-height: 20px;">DealPress - Deal approvals, made simple.</p>
      </div>
    `,
  });
}

/**
 * Send team invitation email
 */
export async function sendTeamInvitationEmail({
  invitedEmail,
  inviterName,
  organizationName,
  jobTitle,
}: {
  invitedEmail: string;
  inviterName: string;
  organizationName: string;
  jobTitle?: string;
}) {
  const inviteUrl = `${APP_URL}/signup?email=${encodeURIComponent(invitedEmail)}`;

  return await sendEmail({
    to: invitedEmail,
    subject: `You're invited to join ${organizationName} on DealPress`,
    react: TeamInvitationEmail({
      invitedEmail,
      inviterName,
      organizationName,
      jobTitle,
      inviteUrl,
    }),
  });
}

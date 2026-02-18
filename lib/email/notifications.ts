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
    subject: `Deal Approval Required: ${dealName}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Approval Request - DealPress</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #dddddd;">

                <!-- Header with Logo/Brand -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #ffffff; border-bottom: 3px solid #0066cc;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <h1 style="margin: 0; color: #0066cc; font-size: 24px; font-weight: 700; font-family: Arial, sans-serif;">DealPress</h1>
                          <p style="margin: 5px 0 0 0; color: #666666; font-size: 13px;">Deal Approval System</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #222222; font-size: 20px; font-weight: 700;">Approval Request</h2>

                    <p style="margin: 0 0 15px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                      Dear ${approverName},
                    </p>

                    <p style="margin: 0 0 25px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                      A new deal approval has been submitted by ${requesterName} and requires your review. Please review the details below and take appropriate action.
                    </p>

                    <!-- Deal Information -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; border: 1px solid #e5e5e5; margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 25px;">
                          <h3 style="margin: 0 0 15px 0; color: #222222; font-size: 18px; font-weight: 700;">${dealName}</h3>

                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            ${amountText ? `
                            <tr>
                              <td style="padding: 5px 0; color: #555555; font-size: 14px; line-height: 1.5;">
                                <strong style="color: #222222;">Deal Amount:</strong> ${amountText}
                              </td>
                            </tr>
                            ` : ''}
                            <tr>
                              <td style="padding: 5px 0; color: #555555; font-size: 14px; line-height: 1.5;">
                                <strong style="color: #222222;">Approval Step:</strong> ${stepName}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; color: #555555; font-size: 14px; line-height: 1.5;">
                                <strong style="color: #222222;">Submitted By:</strong> ${requesterName}
                              </td>
                            </tr>
                            ${reason ? `
                            <tr>
                              <td style="padding: 10px 0 5px 0; color: #555555; font-size: 14px; line-height: 1.5;">
                                <strong style="color: #222222;">Justification:</strong><br/>
                                ${reason}
                              </td>
                            </tr>
                            ` : ''}
                          </table>
                        </td>
                      </tr>
                    </table>

                    ${approveUrl && rejectUrl ? `
                    <!-- Action Buttons -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px;">
                      <tr>
                        <td align="center" style="padding: 15px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding: 0 8px;">
                                <a href="${approveUrl}" style="display: inline-block; background-color: #28a745; color: #ffffff; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 15px; font-family: Arial, sans-serif;">Approve</a>
                              </td>
                              <td style="padding: 0 8px;">
                                <a href="${rejectUrl}" style="display: inline-block; background-color: #dc3545; color: #ffffff; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 15px; font-family: Arial, sans-serif;">Decline</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 20px 0; color: #555555; font-size: 13px; line-height: 1.6; text-align: center;">
                      Or view full details and provide comments:
                    </p>
                    ` : ''}

                    <!-- View Details Button -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding: 10px 0;">
                          <a href="${requestUrl}" style="display: inline-block; background-color: #0066cc; color: #ffffff; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 15px; font-family: Arial, sans-serif;">View Full Details</a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 25px 0 0 0; color: #666666; font-size: 13px; line-height: 1.6;">
                      If you have questions about this request, please contact ${requesterName} or review the complete details in DealPress.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f4f4f4; padding: 25px 40px; border-top: 1px solid #dddddd;">
                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 12px; line-height: 1.5; text-align: center;">
                      This is an automated notification from DealPress deal approval system.
                    </p>
                    <p style="margin: 0; color: #999999; font-size: 11px; line-height: 1.5; text-align: center;">
                      DealPress &copy; ${new Date().getFullYear()} | <a href="${APP_URL}" style="color: #0066cc; text-decoration: none;">Visit DealPress</a>
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

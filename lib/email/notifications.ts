import { sendEmail } from './resend';
import ApprovalNeededEmail from './templates/ApprovalNeeded';
import RequestApprovedEmail from './templates/RequestApproved';
import RequestRejectedEmail from './templates/RequestRejected';
import TeamInvitationEmail from './templates/TeamInvitation';

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
}: {
  approverEmail: string;
  approverName: string;
  requesterName: string;
  dealName: string;
  dealAmount?: number;
  reason?: string;
  stepName: string;
  requestId: string;
}) {
  const requestUrl = `${APP_URL}/requests/${requestId}`;

  return await sendEmail({
    to: approverEmail,
    subject: `Approval Needed: ${dealName}`,
    react: ApprovalNeededEmail({
      approverName,
      requesterName,
      dealName,
      dealAmount,
      reason,
      stepName,
      requestUrl,
    }),
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

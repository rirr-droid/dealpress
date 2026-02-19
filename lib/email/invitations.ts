import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface TeamInvitationEmailParams {
  to: string;
  organizationName: string;
  inviterName: string;
  invitationToken: string;
  role: string;
}

/**
 * Send team invitation email
 */
export async function sendTeamInvitationEmail(params: TeamInvitationEmailParams) {
  const { to, organizationName, inviterName, invitationToken, role } = params;

  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${invitationToken}`;

  const roleLabel = role === 'admin' ? 'Administrator' : 'Member';

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'DealPress <onboarding@resend.dev>',
      to,
      subject: `You've been invited to join ${organizationName} on DealPress`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0071e3 0%, #0077ed 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                You're Invited! 🎉
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #1d1d1f; font-size: 16px; line-height: 1.6;">
                Hi there,
              </p>

              <p style="margin: 0 0 20px; color: #1d1d1f; font-size: 16px; line-height: 1.6;">
                <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on DealPress as a <strong>${roleLabel}</strong>.
              </p>

              <p style="margin: 0 0 30px; color: #86868b; font-size: 14px; line-height: 1.6;">
                DealPress streamlines deal approvals, reduces approval time by 50%, and gives you complete visibility into your approval workflows.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${acceptUrl}" style="display: inline-block; background-color: #0071e3; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 100px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(0, 113, 227, 0.25);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #86868b; font-size: 13px; line-height: 1.6; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <a href="${acceptUrl}" style="color: #0071e3; text-decoration: none; word-break: break-all;">
                  ${acceptUrl}
                </a>
              </p>
            </td>
          </tr>

          <!-- Role Info -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; border-radius: 12px; padding: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px; color: #1d1d1f; font-size: 14px; font-weight: 600;">
                      Your Role: ${roleLabel}
                    </p>
                    ${role === 'admin' ? `
                      <p style="margin: 0; color: #86868b; font-size: 13px; line-height: 1.5;">
                        ✓ Manage team members and settings<br>
                        ✓ Create and edit approval templates<br>
                        ✓ View all approval requests<br>
                        ✓ Approve or reject requests
                      </p>
                    ` : `
                      <p style="margin: 0; color: #86868b; font-size: 13px; line-height: 1.5;">
                        ✓ Submit approval requests<br>
                        ✓ Approve or reject requests<br>
                        ✓ View requests you're involved in
                      </p>
                    `}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0 40px 40px; border-top: 1px solid #e5e5e7;">
              <p style="margin: 20px 0 0; color: #86868b; font-size: 12px; line-height: 1.5; text-align: center;">
                This invitation was sent to ${to} and will expire in 7 days.<br>
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer Links -->
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
          <tr>
            <td align="center">
              <p style="margin: 0; color: #86868b; font-size: 12px;">
                © ${new Date().getFullYear()} DealPress. All rights reserved.
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
      text: `
You've been invited to join ${organizationName} on DealPress!

${inviterName} has invited you to join ${organizationName} as a ${roleLabel}.

Accept your invitation by clicking this link:
${acceptUrl}

Your Role: ${roleLabel}

${role === 'admin' ? `
As an admin, you can:
- Manage team members and settings
- Create and edit approval templates
- View all approval requests
- Approve or reject requests
` : `
As a member, you can:
- Submit approval requests
- Approve or reject requests
- View requests you're involved in
`}

This invitation was sent to ${to} and will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} DealPress
      `.trim(),
    });

    if (error) {
      console.error('Failed to send invitation email:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

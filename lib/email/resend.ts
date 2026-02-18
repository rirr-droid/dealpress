import { Resend } from 'resend';

// Create Resend instance lazily to avoid serverless issues
let resendInstance: Resend | null = null;

const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set - Email features will not work');
    return null;
  }

  // Create instance only when needed
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }

  return resendInstance;
};

// Export for compatibility
export const resend = getResend();

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  react,
}: {
  to: string | string[];
  subject: string;
  html?: string;
  react?: React.ReactElement;
}) {
  const resendClient = getResend();

  if (!resendClient) {
    console.warn('Resend not configured - email not sent');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'DealPress <onboarding@resend.dev>',
      to,
      subject,
      html,
      react,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

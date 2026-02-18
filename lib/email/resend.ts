// Export for compatibility (legacy code might reference this)
export const resend = null;

/**
 * Send an email using Resend API directly via fetch
 * Avoids SDK bundling issues in serverless environments
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
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set - Email features will not work');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Use Resend API directly with fetch to avoid SDK issues
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'DealPress <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error sending email:', result);
      return { success: false, error: result.message || 'Failed to send email' };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
}

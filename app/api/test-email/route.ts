import { NextResponse } from 'next/server';
import { sendEmail, resend } from '@/lib/email/resend';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to diagnose email configuration issues
 * Visit: /api/test-email?to=your-email@example.com
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const toEmail = searchParams.get('to');

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    resendConfigured: !!process.env.RESEND_API_KEY,
    resendApiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 6) + '...',
    jwtSecretConfigured: !!process.env.JWT_SECRET,
    resendClientInitialized: resend !== null,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'DealPress <onboarding@resend.dev>',
  };

  // If no email provided, just return diagnostics
  if (!toEmail) {
    return NextResponse.json({
      success: false,
      message: 'Add ?to=your-email@example.com to send a test email',
      diagnostics,
    });
  }

  // Try to send a test email
  try {
    const result = await sendEmail({
      to: toEmail,
      subject: 'DealPress Email Test',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #0071e3; font-size: 28px; margin-bottom: 20px;">Email Configuration Test</h1>
          <p style="color: #1d1d1f; font-size: 16px; line-height: 24px;">
            This is a test email from DealPress to verify that your email configuration is working correctly.
          </p>
          <div style="background: #f5f5f7; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <h2 style="color: #1d1d1f; font-size: 18px; margin: 0 0 12px;">Diagnostics:</h2>
            <ul style="color: #86868b; font-size: 14px; line-height: 22px; margin: 0; padding-left: 20px;">
              <li>Resend Configured: ${diagnostics.resendConfigured ? '✅' : '❌'}</li>
              <li>JWT Secret Configured: ${diagnostics.jwtSecretConfigured ? '✅' : '❌'}</li>
              <li>Resend Client: ${diagnostics.resendClientInitialized ? '✅ Initialized' : '❌ Not initialized'}</li>
              <li>From Email: ${diagnostics.fromEmail}</li>
              <li>Sent At: ${diagnostics.timestamp}</li>
            </ul>
          </div>
          <p style="color: #86868b; font-size: 14px; line-height: 20px;">
            If you received this email, your DealPress email configuration is working! 🎉
          </p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
          <p style="color: #86868b; font-size: 12px; line-height: 18px;">
            DealPress Email Configuration Test
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Test email sent successfully to ${toEmail}`
        : `Failed to send email: ${result.error}`,
      emailResult: result,
      diagnostics,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Exception occurred while sending email',
      error: error instanceof Error ? error.message : 'Unknown error',
      diagnostics,
    }, { status: 500 });
  }
}

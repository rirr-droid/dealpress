import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/crypto/encryption';

export const dynamic = 'force-dynamic';

/**
 * Slack OAuth callback handler
 * Exchanges the OAuth code for an access token and stores it
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state'); // organization_id
  const error = requestUrl.searchParams.get('error');

  // Handle user denial
  if (error) {
    return NextResponse.redirect(
      new URL('/settings?slack=cancelled', request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/settings?slack=error&message=missing_parameters', request.url)
    );
  }

  try {
    const supabase = await createClient();

    // Exchange code for access token
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/oauth`,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Slack OAuth error:', data);
      return NextResponse.redirect(
        new URL(`/settings?slack=error&message=${data.error}`, request.url)
      );
    }

    // Verify the organization exists and user has admin access
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', state)
      .single();

    if (orgError || !org) {
      return NextResponse.redirect(
        new URL('/settings?slack=error&message=invalid_organization', request.url)
      );
    }

    // Verify user is admin of this organization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      );
    }

    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', state)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.redirect(
        new URL('/settings?slack=error&message=admin_required', request.url)
      );
    }

    // Encrypt the bot token before storing
    let encryptedToken: string;
    try {
      encryptedToken = encrypt(data.access_token);
      console.log('Token encrypted successfully');
    } catch (encryptError) {
      console.error('Failed to encrypt token:', encryptError);
      return NextResponse.redirect(
        new URL('/settings?slack=error&message=encryption_failed', request.url)
      );
    }

    // Store Slack configuration
    console.log('Updating organization with Slack config:', {
      orgId: state,
      workspaceId: data.team.id,
      hasToken: !!encryptedToken,
    });

    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        slack_workspace_id: data.team.id,
        slack_bot_token: encryptedToken,
        slack_enabled: true,
      })
      .eq('id', state);

    if (updateError) {
      console.error('Failed to update organization:', updateError);
      return NextResponse.redirect(
        new URL('/settings?slack=error&message=database_error', request.url)
      );
    }

    console.log('Organization updated successfully with Slack config');

    // Sync Slack users (optional - can be done in background)
    // This helps pre-populate the slack_users table
    try {
      await syncSlackUsers(data.access_token, state);
    } catch (error) {
      console.error('Failed to sync Slack users:', error);
      // Don't fail the whole flow if sync fails
    }

    // Success! Redirect to settings
    return NextResponse.redirect(
      new URL('/settings?slack=success', request.url)
    );
  } catch (error) {
    console.error('Slack OAuth error:', error);
    return NextResponse.redirect(
      new URL('/settings?slack=error&message=unexpected_error', request.url)
    );
  }
}

/**
 * Sync Slack workspace users to database
 * This helps match Slack users to DealPress users by email
 */
async function syncSlackUsers(accessToken: string, organizationId: string) {
  const supabase = await createClient();

  // Fetch all users from Slack
  const response = await fetch('https://slack.com/api/users.list', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  // Filter out bots and deleted users
  const users = data.members.filter(
    (user: any) => !user.is_bot && !user.deleted && user.profile?.email
  );

  // Sync each user using the database function
  for (const user of users) {
    try {
      await supabase.rpc('sync_slack_user', {
        p_org_id: organizationId,
        p_slack_user_id: user.id,
        p_slack_email: user.profile.email,
        p_slack_display_name: user.profile.display_name || user.profile.real_name,
      });
    } catch (error) {
      console.error(`Failed to sync Slack user ${user.id}:`, error);
      // Continue syncing other users
    }
  }
}

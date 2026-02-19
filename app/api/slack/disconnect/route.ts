import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

/**
 * Disconnect Slack integration for an organization
 */
export async function POST(request: Request) {
  try {
    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is admin of this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Disconnect Slack by clearing the configuration
    const { error } = await supabase
      .from('organizations')
      .update({
        slack_workspace_id: null,
        slack_bot_token: null,
        slack_enabled: false,
        slack_channel_id: null,
      })
      .eq('id', organizationId);

    if (error) {
      console.error('Failed to disconnect Slack:', error);
      return NextResponse.json(
        { error: 'Failed to disconnect Slack' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Slack disconnect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

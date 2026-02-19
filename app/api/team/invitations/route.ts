import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

/**
 * Get all pending invitations for an organization
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const user = await getCurrentUser();

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

    // Get pending invitations
    const { data: invitations, error } = await supabase
      .from('team_invitations')
      .select(`
        id,
        email,
        role,
        expires_at,
        created_at,
        invited_by,
        user_profiles!team_invitations_invited_by_fkey (
          name,
          email
        )
      `)
      .eq('organization_id', organizationId)
      .is('accepted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch invitations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Get invitations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Remove a team member from an organization
 */
export async function POST(request: Request) {
  try {
    const { memberId, organizationId } = await request.json();

    if (!memberId || !organizationId) {
      return NextResponse.json(
        { error: 'Member ID and organization ID required' },
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
    const { data: adminMembership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (!adminMembership || adminMembership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get member details
    const { data: memberToRemove } = await supabase
      .from('organization_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('organization_id', organizationId)
      .single();

    if (!memberToRemove) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Prevent removing yourself
    if (memberToRemove.user_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself from the organization' },
        { status: 400 }
      );
    }

    // Check if this is the last admin
    if (memberToRemove.role === 'admin') {
      const { count: adminCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('role', 'admin');

      if (adminCount && adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last admin. Promote another member to admin first.' },
          { status: 400 }
        );
      }
    }

    // Remove member
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Failed to remove member:', error);
      return NextResponse.json(
        { error: 'Failed to remove member' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

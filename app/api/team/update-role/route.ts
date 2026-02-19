import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Update a team member's role
 */
export async function POST(request: Request) {
  try {
    const { memberId, organizationId, newRole } = await request.json();

    if (!memberId || !organizationId || !newRole) {
      return NextResponse.json(
        { error: 'Member ID, organization ID, and new role required' },
        { status: 400 }
      );
    }

    if (!['admin', 'member'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Role must be admin or member' },
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
    const { data: memberToUpdate } = await supabase
      .from('organization_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('organization_id', organizationId)
      .single();

    if (!memberToUpdate) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Prevent changing your own role
    if (memberToUpdate.user_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // If demoting from admin, check if this is the last admin
    if (memberToUpdate.role === 'admin' && newRole !== 'admin') {
      const { count: adminCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('role', 'admin');

      if (adminCount && adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last admin. Promote another member first.' },
          { status: 400 }
        );
      }
    }

    // Update role
    const { error } = await supabase
      .from('organization_members')
      .update({ role: newRole })
      .eq('id', memberId);

    if (error) {
      console.error('Failed to update role:', error);
      return NextResponse.json(
        { error: 'Failed to update role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

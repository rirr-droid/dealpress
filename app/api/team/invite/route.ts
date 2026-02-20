import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { generateToken } from '@/lib/crypto/encryption';
import { sendTeamInvitationEmail } from '@/lib/email/invitations';

export const dynamic = 'force-dynamic';

/**
 * Send team invitation
 */
export async function POST(request: Request) {
  try {
    const { email, role, organizationId } = await request.json();

    // Validate input
    if (!email || !role || !organizationId) {
      return NextResponse.json(
        { error: 'Email, role, and organizationId are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'member'].includes(role)) {
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

    // Get organization details
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check if email already belongs to a member of this org
    const { data: existingUserWithEmail } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUserWithEmail) {
      // Check if they're already a member
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('user_id', existingUserWithEmail.id)
        .single();

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member of this organization' },
          { status: 400 }
        );
      }
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from('team_invitations')
      .select('id, expires_at')
      .eq('organization_id', organizationId)
      .eq('email', email)
      .is('accepted_at', null)
      .single();

    if (existingInvitation) {
      // Check if expired
      const isExpired = new Date(existingInvitation.expires_at) < new Date();

      if (!isExpired) {
        return NextResponse.json(
          { error: 'An invitation has already been sent to this email' },
          { status: 400 }
        );
      }

      // Delete expired invitation
      await supabase
        .from('team_invitations')
        .delete()
        .eq('id', existingInvitation.id);
    }

    // Generate invitation token
    const invitationToken = generateToken(32);

    // Create invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .insert({
        organization_id: organizationId,
        email,
        role,
        invited_by: user.id,
        invitation_token: invitationToken,
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Failed to create invitation:', invitationError);
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // Get inviter name
    const { data: inviter } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    // Send invitation email
    try {
      await sendTeamInvitationEmail({
        to: email,
        organizationName: org.name,
        inviterName: inviter?.name || user.email || 'A team member',
        invitationToken,
        role,
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the whole operation if email fails
      // The invitation is created, they can still be manually notified
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expires_at: invitation.expires_at,
      },
    });
  } catch (error) {
    console.error('Team invitation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

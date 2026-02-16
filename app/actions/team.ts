'use server'

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserOrgId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/db/team";
import { canPerformAction } from "@/lib/billing/usage";
import { sendTeamInvitationEmail } from "@/lib/email/notifications";

/**
 * Invite a user to the organization
 */
export async function inviteUser(email: string, jobTitle?: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(orgId, user.id);
    if (!userIsAdmin) {
      return { success: false, error: 'Only admins can invite users' };
    }

    // Check usage limits
    const { allowed, reason } = await canPerformAction(orgId, 'invite_user');
    if (!allowed) {
      return { success: false, error: reason, errorCode: 'USAGE_LIMIT_REACHED' };
    }

    // Get organization details for the email
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single();

    // Get inviter profile for name
    const { data: inviterProfile } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const inviterName = inviterProfile?.name || user.email!;
    const organizationName = org?.name || 'Your Organization';

    // Send invitation email
    try {
      await sendTeamInvitationEmail({
        invitedEmail: email,
        inviterName,
        organizationName,
        jobTitle,
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the invitation if email fails - log it for audit
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'user.invited',
      metadata: { email, job_title: jobTitle },
    });

    revalidatePath('/settings/team');

    return {
      success: true,
      message: `Invitation sent to ${email}`,
    };
  } catch (error) {
    console.error('Error inviting user:', error);
    return { success: false, error: 'Failed to invite user' };
  }
}

/**
 * Update a team member's role
 */
export async function updateMemberRole(memberId: string, newRole: 'admin' | 'member') {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(orgId, user.id);
    if (!userIsAdmin) {
      return { success: false, error: 'Only admins can change roles' };
    }

    // Prevent changing own role
    if (memberId === user.id) {
      return { success: false, error: 'You cannot change your own role' };
    }

    // Update role
    const { error } = await supabase
      .from('organization_members')
      .update({ role: newRole })
      .eq('organization_id', orgId)
      .eq('user_id', memberId);

    if (error) {
      console.error('Error updating role:', error);
      return { success: false, error: 'Failed to update role' };
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'user.role_changed',
      metadata: { member_id: memberId, new_role: newRole },
    });

    revalidatePath('/settings/team');

    return { success: true };
  } catch (error) {
    console.error('Error updating member role:', error);
    return { success: false, error: 'Failed to update role' };
  }
}

/**
 * Remove a team member from the organization
 */
export async function removeMember(memberId: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(orgId, user.id);
    if (!userIsAdmin) {
      return { success: false, error: 'Only admins can remove members' };
    }

    // Prevent removing self
    if (memberId === user.id) {
      return { success: false, error: 'You cannot remove yourself' };
    }

    // Check if member exists and get count of admins
    const { data: members } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId);

    const adminCount = members?.filter(m => m.role === 'admin').length || 0;
    const memberToRemove = members?.find(m => m.role === 'admin');

    // Prevent removing last admin
    if (adminCount === 1 && memberToRemove) {
      return { success: false, error: 'Cannot remove the last admin' };
    }

    // Remove member
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', orgId)
      .eq('user_id', memberId);

    if (error) {
      console.error('Error removing member:', error);
      return { success: false, error: 'Failed to remove member' };
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'user.removed',
      metadata: { member_id: memberId },
    });

    revalidatePath('/settings/team');

    return { success: true };
  } catch (error) {
    console.error('Error removing member:', error);
    return { success: false, error: 'Failed to remove member' };
  }
}

/**
 * Update team member's job title
 */
export async function updateJobTitle(memberId: string, jobTitle: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Only allow updating own job title or if admin
    const userIsAdmin = await isAdmin(orgId, user.id);
    if (memberId !== user.id && !userIsAdmin) {
      return { success: false, error: 'Only admins can update other members' };
    }

    const { error } = await supabase
      .from('organization_members')
      .update({ job_title: jobTitle })
      .eq('organization_id', orgId)
      .eq('user_id', memberId);

    if (error) {
      console.error('Error updating job title:', error);
      return { success: false, error: 'Failed to update job title' };
    }

    revalidatePath('/settings/team');

    return { success: true };
  } catch (error) {
    console.error('Error updating job title:', error);
    return { success: false, error: 'Failed to update job title' };
  }
}

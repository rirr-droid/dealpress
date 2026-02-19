import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeamManagement } from "@/components/settings/TeamManagement";

export default async function TeamSettingsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  // Get user's organization and role
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    redirect('/dashboard');
  }

  // Get organization details
  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name, subscription_tier')
    .eq('id', membership.organization_id)
    .single();

  // Get all team members
  const { data: members } = await supabase
    .from('organization_members')
    .select(`
      id,
      role,
      created_at,
      user_id,
      user_profiles (
        name,
        email,
        avatar_url
      )
    `)
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: true });

  // Get pending invitations (admin only)
  let pendingInvitations = [];
  if (membership.role === 'admin') {
    const { data: invitations } = await supabase
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
      .eq('organization_id', membership.organization_id)
      .is('accepted_at', null)
      .order('created_at', { ascending: false });

    pendingInvitations = invitations || [];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Team Management</h1>
        <p className="text-[#86868b]">
          Manage team members, roles, and invitations for {organization?.name}
        </p>
      </div>

      {/* Team Management Component */}
      <TeamManagement
        organization={organization}
        members={members || []}
        pendingInvitations={pendingInvitations}
        currentUserRole={membership.role}
        currentUserId={user.id}
      />
    </div>
  );
}

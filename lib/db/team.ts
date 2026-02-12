import { createClient } from "@/lib/supabase/server";

export interface TeamMember {
  user_id: string;
  role: string;
  job_title: string | null;
  joined_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

/**
 * Get all team members for an organization
 */
export async function getTeamMembers(organizationId: string): Promise<TeamMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      user_id,
      role,
      job_title,
      joined_at,
      user:user_id(id, name, email, avatar_url)
    `)
    .eq('organization_id', organizationId)
    .order('joined_at', { ascending: false });

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }

  // Type assertion to handle Supabase join array/object ambiguity
  const members = (data || []).map(member => ({
    ...member,
    user: Array.isArray(member.user) ? member.user[0] : member.user
  })) as TeamMember[];

  return members;
}

/**
 * Get a specific team member
 */
export async function getTeamMember(organizationId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      user_id,
      role,
      job_title,
      joined_at,
      user:user_id(id, name, email, avatar_url)
    `)
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching team member:', error);
    return null;
  }

  return data;
}

/**
 * Check if user has admin role
 */
export async function isAdmin(organizationId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single();

  return data?.role === 'admin';
}

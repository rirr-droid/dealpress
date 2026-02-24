import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserOrgId } from "@/lib/auth";

/**
 * Check if current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) return false;

    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    // Allow both 'admin' and 'owner' roles (owner is legacy)
    return membership?.role === 'admin' || membership?.role === 'owner';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get current user's role
 */
export async function getUserRole(): Promise<'admin' | 'owner' | 'member' | null> {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) return null;

    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    return membership?.role as 'admin' | 'owner' | 'member' | null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Permission checks for specific actions
 */
export const can = {
  /**
   * Can create/edit/delete templates
   */
  manageTemplates: async (): Promise<boolean> => {
    return await isAdmin();
  },

  /**
   * Can invite/remove team members
   */
  manageTeam: async (): Promise<boolean> => {
    return await isAdmin();
  },

  /**
   * Can access settings
   */
  accessSettings: async (): Promise<boolean> => {
    return await isAdmin();
  },

  /**
   * Can access billing
   */
  accessBilling: async (): Promise<boolean> => {
    return await isAdmin();
  },

  /**
   * Can cancel any request (not just own)
   */
  cancelAnyRequest: async (): Promise<boolean> => {
    return await isAdmin();
  },

  /**
   * Can delete any attachment (not just own)
   */
  deleteAnyAttachment: async (): Promise<boolean> => {
    return await isAdmin();
  },

  /**
   * Can export analytics
   */
  exportAnalytics: async (): Promise<boolean> => {
    return await isAdmin();
  },
};

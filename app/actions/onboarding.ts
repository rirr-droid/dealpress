'use server'

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserOrgId } from "@/lib/auth";

export interface OnboardingProgress {
  hasTemplate: boolean;
  hasRequest: boolean;
  hasApproval: boolean;
  hasInvitedTeam: boolean;
}

/**
 * Get user's onboarding progress
 */
export async function getOnboardingProgress(): Promise<OnboardingProgress> {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return {
        hasTemplate: false,
        hasRequest: false,
        hasApproval: false,
        hasInvitedTeam: false,
      };
    }

    // Check if user has any templates
    const { data: templates } = await supabase
      .from('approval_templates')
      .select('id')
      .eq('organization_id', orgId)
      .limit(1);

    // Check if user has created any requests
    const { data: requests } = await supabase
      .from('approval_requests')
      .select('id')
      .eq('organization_id', orgId)
      .limit(1);

    // Check if user has approved anything
    const { data: approvals } = await supabase
      .from('approval_steps')
      .select('id')
      .eq('status', 'approved')
      .limit(1);

    // Check if organization has multiple members
    const { count: memberCount } = await supabase
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    return {
      hasTemplate: (templates?.length || 0) > 0,
      hasRequest: (requests?.length || 0) > 0,
      hasApproval: (approvals?.length || 0) > 0,
      hasInvitedTeam: (memberCount || 0) > 1,
    };
  } catch (error) {
    console.error('Error getting onboarding progress:', error);
    return {
      hasTemplate: false,
      hasRequest: false,
      hasApproval: false,
      hasInvitedTeam: false,
    };
  }
}

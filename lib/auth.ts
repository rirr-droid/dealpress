import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

/**
 * Get the current authenticated user
 * Cached per request to avoid multiple database calls
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});

/**
 * Get the current user's profile
 */
export const getUserProfile = cache(async () => {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
});

/**
 * Get the current user's organization
 */
export const getUserOrganization = cache(async () => {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id, role, organizations(*)')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user organization:', error);
    return null;
  }

  // Return the organization object, handling the Supabase array format
  return Array.isArray(data.organizations) ? data.organizations[0] : data.organizations;
});

/**
 * Get the current user's organization ID
 */
export const getUserOrgId = cache(async (): Promise<string | null> => {
  const org = await getUserOrganization();
  return org?.id || null;
});

/**
 * Check if user is authenticated and redirect if not
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

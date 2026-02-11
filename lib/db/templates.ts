import { createClient } from "@/lib/supabase/server";
import { getUserOrgId } from "@/lib/auth";

/**
 * Get all approval templates for the current organization
 */
export async function getTemplates() {
  const supabase = await createClient();
  const orgId = await getUserOrgId();

  if (!orgId) {
    return [];
  }

  const { data, error } = await supabase
    .from('approval_templates')
    .select(`
      *,
      steps:template_steps(*)
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single template by ID
 */
export async function getTemplate(id: string) {
  const supabase = await createClient();
  const orgId = await getUserOrgId();

  if (!orgId) {
    return null;
  }

  const { data, error } = await supabase
    .from('approval_templates')
    .select(`
      *,
      steps:template_steps(*)
    `)
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (error) {
    console.error('Error fetching template:', error);
    return null;
  }

  return data;
}

/**
 * Get active templates only
 */
export async function getActiveTemplates() {
  const supabase = await createClient();
  const orgId = await getUserOrgId();

  if (!orgId) {
    return [];
  }

  const { data, error } = await supabase
    .from('approval_templates')
    .select(`
      *,
      steps:template_steps(*)
    `)
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching active templates:', error);
    return [];
  }

  return data || [];
}

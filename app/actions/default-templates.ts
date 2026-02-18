'use server'

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserOrgId } from "@/lib/auth";
import { DEFAULT_TEMPLATES } from "@/lib/default-templates";
import { revalidatePath } from "next/cache";

/**
 * Install a default template for the user's organization
 */
export async function installDefaultTemplate(templateName: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Find the template
    const template = DEFAULT_TEMPLATES.find(t => t.name === templateName);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    // Check if template already exists for this org
    const { data: existing } = await supabase
      .from('approval_templates')
      .select('id')
      .eq('organization_id', orgId)
      .eq('name', template.name)
      .single();

    if (existing) {
      return { success: false, error: 'Template already installed' };
    }

    // Create the template
    const { data: newTemplate, error: templateError } = await supabase
      .from('approval_templates')
      .insert({
        organization_id: orgId,
        name: template.name,
        description: template.description,
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (templateError || !newTemplate) {
      console.error('Error creating template:', templateError);
      return { success: false, error: 'Failed to create template' };
    }

    // Create the template steps
    const steps = template.steps.map(step => ({
      template_id: newTemplate.id,
      step_name: step.step_name,
      step_order: step.step_order,
      approver_role: step.approver_role,
    }));

    const { error: stepsError } = await supabase
      .from('template_steps')
      .insert(steps);

    if (stepsError) {
      console.error('Error creating steps:', stepsError);
      // Rollback - delete the template
      await supabase
        .from('approval_templates')
        .delete()
        .eq('id', newTemplate.id);
      return { success: false, error: 'Failed to create template steps' };
    }

    revalidatePath('/templates');
    return { success: true, data: newTemplate };
  } catch (error) {
    console.error('Error installing template:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Install all default templates for a new organization
 */
export async function installAllDefaultTemplates() {
  try {
    const results = await Promise.all(
      DEFAULT_TEMPLATES.map(template => installDefaultTemplate(template.name))
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      success: true,
      installed: successful,
      failed,
      total: DEFAULT_TEMPLATES.length,
    };
  } catch (error) {
    console.error('Error installing all templates:', error);
    return { success: false, error: 'Failed to install templates' };
  }
}

/**
 * Get list of available default templates not yet installed
 */
export async function getAvailableDefaultTemplates() {
  try {
    const supabase = await createClient();
    const orgId = await getUserOrgId();

    if (!orgId) {
      return DEFAULT_TEMPLATES;
    }

    // Get existing templates for this org
    const { data: existingTemplates } = await supabase
      .from('approval_templates')
      .select('name')
      .eq('organization_id', orgId);

    const existingNames = new Set(existingTemplates?.map(t => t.name) || []);

    // Filter out already installed templates
    return DEFAULT_TEMPLATES.filter(t => !existingNames.has(t.name));
  } catch (error) {
    console.error('Error getting available templates:', error);
    return DEFAULT_TEMPLATES;
  }
}

'use server'

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserOrgId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface TemplateStep {
  step_name: string;
  step_order: number;
  approver_role?: string;
}

interface CreateTemplateInput {
  name: string;
  description?: string;
  deal_amount_threshold?: number;
  is_active?: boolean;
  steps: TemplateStep[];
}

/**
 * Create a new approval template
 */
export async function createTemplate(input: CreateTemplateInput) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: 'Template name is required' };
    }

    if (!input.steps || input.steps.length === 0) {
      return { success: false, error: 'At least one approval step is required' };
    }

    // Create the template
    const { data: template, error: templateError } = await supabase
      .from('approval_templates')
      .insert({
        organization_id: orgId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        deal_amount_threshold: input.deal_amount_threshold || null,
        is_active: input.is_active !== false,
        created_by: user.id,
      })
      .select()
      .single();

    if (templateError || !template) {
      console.error('Error creating template:', templateError);
      return { success: false, error: 'Failed to create template' };
    }

    // Create the steps
    const steps = input.steps.map((step, index) => ({
      template_id: template.id,
      step_name: step.step_name.trim(),
      step_order: index + 1,
      approver_role: step.approver_role?.trim() || null,
    }));

    const { error: stepsError } = await supabase
      .from('template_steps')
      .insert(steps);

    if (stepsError) {
      console.error('Error creating template steps:', stepsError);
      // Rollback - delete the template
      await supabase.from('approval_templates').delete().eq('id', template.id);
      return { success: false, error: 'Failed to create template steps' };
    }

    revalidatePath('/templates');
    return { success: true, data: template };
  } catch (error) {
    console.error('Error in createTemplate:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update an existing template
 */
export async function updateTemplate(id: string, input: Partial<CreateTemplateInput>) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update template metadata
    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.description !== undefined) updates.description = input.description?.trim() || null;
    if (input.deal_amount_threshold !== undefined) updates.deal_amount_threshold = input.deal_amount_threshold || null;
    if (input.is_active !== undefined) updates.is_active = input.is_active;

    const { error: updateError } = await supabase
      .from('approval_templates')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', orgId);

    if (updateError) {
      console.error('Error updating template:', updateError);
      return { success: false, error: 'Failed to update template' };
    }

    // Update steps if provided
    if (input.steps) {
      console.log('Updating template steps for template:', id);
      console.log('Input steps:', JSON.stringify(input.steps, null, 2));

      // Delete existing steps
      const { error: deleteError } = await supabase
        .from('template_steps')
        .delete()
        .eq('template_id', id);

      if (deleteError) {
        console.error('Failed to delete existing steps:', deleteError);
        return { success: false, error: `Failed to delete existing steps: ${deleteError.message}` };
      }

      // Insert new steps
      const steps = input.steps.map((step, index) => ({
        template_id: id,
        step_name: step.step_name.trim(),
        step_order: index + 1,
        approver_role: step.approver_role?.trim() || null,
      }));

      console.log('Prepared steps for insertion:', JSON.stringify(steps, null, 2));

      const { error: stepsError } = await supabase
        .from('template_steps')
        .insert(steps);

      if (stepsError) {
        console.error('Failed to insert steps:', stepsError);
        console.error('Supabase error details:', JSON.stringify(stepsError, null, 2));
        return { success: false, error: `Failed to update template steps: ${stepsError.message || stepsError.code}` };
      }

      console.log('Successfully updated template steps');
    }

    revalidatePath('/templates');
    revalidatePath(`/templates/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error in updateTemplate:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Create a new approval template with specific approvers
 */
export async function createTemplateWithApprovers(input: CreateTemplateInput & {
  steps: Array<TemplateStep & { approver_ids?: string[] }>;
}) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: 'Template name is required' };
    }

    if (!input.steps || input.steps.length === 0) {
      return { success: false, error: 'At least one approval step is required' };
    }

    // Validate that all steps have at least one approver
    for (const step of input.steps) {
      if (!step.approver_ids || step.approver_ids.length === 0) {
        return { success: false, error: `Step "${step.step_name}" must have at least one approver` };
      }
    }

    // Create the template
    const { data: template, error: templateError } = await supabase
      .from('approval_templates')
      .insert({
        organization_id: orgId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        deal_amount_threshold: input.deal_amount_threshold || null,
        is_active: input.is_active !== false,
        created_by: user.id,
      })
      .select()
      .single();

    if (templateError || !template) {
      console.error('Error creating template:', templateError);
      return { success: false, error: 'Failed to create template' };
    }

    // Create the steps
    for (const step of input.steps) {
      const { data: templateStep, error: stepError } = await supabase
        .from('template_steps')
        .insert({
          template_id: template.id,
          step_name: step.step_name.trim(),
          step_order: step.step_order,
          approver_role: step.approver_role?.trim() || null,
        })
        .select()
        .single();

      if (stepError || !templateStep) {
        console.error('Error creating template step:', stepError);
        await supabase.from('approval_templates').delete().eq('id', template.id);
        return { success: false, error: 'Failed to create template steps' };
      }

      // Create approver assignments
      if (step.approver_ids && step.approver_ids.length > 0) {
        const approvers = step.approver_ids.map((userId) => ({
          template_step_id: templateStep.id,
          user_id: userId,
        }));

        const { error: approversError } = await supabase
          .from('template_step_approvers')
          .insert(approvers);

        if (approversError) {
          console.error('Error creating approvers:', approversError);
          await supabase.from('approval_templates').delete().eq('id', template.id);
          return { success: false, error: 'Failed to assign approvers' };
        }
      }
    }

    revalidatePath('/templates');
    return { success: true, data: template };
  } catch (error) {
    console.error('Error in createTemplateWithApprovers:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if template is being used
    const { data: requests } = await supabase
      .from('approval_requests')
      .select('id')
      .eq('template_id', id)
      .limit(1);

    if (requests && requests.length > 0) {
      return {
        success: false,
        error: 'Cannot delete template that is being used by approval requests. Mark it as inactive instead.'
      };
    }

    // Delete the template (steps will cascade delete)
    const { error } = await supabase
      .from('approval_templates')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Error deleting template:', error);
      return { success: false, error: 'Failed to delete template' };
    }

    revalidatePath('/templates');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteTemplate:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Toggle template active status
 */
export async function toggleTemplateStatus(id: string, isActive: boolean) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('approval_templates')
      .update({ is_active: isActive })
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Error toggling template status:', error);
      return { success: false, error: 'Failed to update template status' };
    }

    revalidatePath('/templates');
    revalidatePath(`/templates/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error in toggleTemplateStatus:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

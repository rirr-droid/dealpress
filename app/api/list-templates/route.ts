import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to list all templates and their steps
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get all templates
    const { data: templates, error } = await supabase
      .from('approval_templates')
      .select('id, name, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    // Get steps for each template
    const templatesWithSteps = await Promise.all(
      (templates || []).map(async (template) => {
        const { data: steps } = await supabase
          .from('template_steps')
          .select('id, step_name, step_order, approver_role')
          .eq('template_id', template.id)
          .order('step_order', { ascending: true });

        return {
          ...template,
          steps: steps || [],
          stepCount: steps?.length || 0
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: templatesWithSteps.length,
      templates: templatesWithSteps
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

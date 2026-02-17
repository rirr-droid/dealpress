import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to test template step fetching
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('template_id');

    if (!templateId) {
      return NextResponse.json({
        success: false,
        error: 'template_id query parameter required'
      });
    }

    const supabase = await createClient();

    // Try to fetch template steps the same way createRequest does
    console.log('Fetching template steps for template_id:', templateId);

    const { data: steps, error: stepsError } = await supabase
      .from('template_steps')
      .select('step_name, step_order, approver_role')
      .eq('template_id', templateId)
      .order('step_order', { ascending: true });

    console.log('Template steps fetched:', steps);
    console.log('Template steps error:', stepsError);

    // Also get template info
    const { data: template, error: templateError } = await supabase
      .from('approval_templates')
      .select('id, name, is_active')
      .eq('id', templateId)
      .single();

    return NextResponse.json({
      success: true,
      template: template,
      templateError: templateError,
      steps: steps,
      stepsError: stepsError,
      stepCount: steps?.length || 0,
      hasSteps: !!(steps && steps.length > 0)
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

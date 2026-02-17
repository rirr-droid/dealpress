import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to list all requests
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get all requests (bypass RLS for debugging)
    const { data: requests, error } = await supabase
      .from('approval_requests')
      .select('id, deal_name, status, share_token, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: requests?.length || 0,
      requests: requests?.map(r => ({
        id: r.id,
        deal_name: r.deal_name,
        status: r.status,
        created_at: r.created_at,
        share_token: r.share_token,
        share_url: r.share_token ? `https://dealpress.vercel.app/share/${r.share_token}` : null,
        detail_url: `https://dealpress.vercel.app/requests/${r.id}`,
      }))
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

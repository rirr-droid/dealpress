import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const name = requestUrl.searchParams.get('name');
  const company = requestUrl.searchParams.get('company');

  if (code) {
    const supabase = await createClient();

    // Exchange code for session
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // If new user, create profile and org
      if (!existingProfile) {
        // Extract name from Google profile metadata or fallback
        const userName = name ||
                        user.user_metadata?.full_name ||
                        user.user_metadata?.name ||
                        user.email?.split('@')[0] ||
                        'User';

        // Extract company from email domain
        const emailDomain = user.email?.split('@')[1] || '';
        const companyFromEmail = emailDomain.replace(/\.(com|io|net|org)$/, '');
        const orgName = company ||
                       (companyFromEmail !== 'gmail' && companyFromEmail !== 'yahoo' && companyFromEmail !== 'hotmail'
                         ? companyFromEmail.charAt(0).toUpperCase() + companyFromEmail.slice(1)
                         : `${userName}'s Organization`);

        // Create organization first
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: orgName,
          })
          .select()
          .single();

        if (!orgError && org) {
          // Create user profile
          await supabase.from('user_profiles').insert({
            id: user.id,
            email: user.email,
            name: userName,
            avatar_url: user.user_metadata?.avatar_url || null,
          });

          // Add user as admin to organization
          await supabase.from('organization_members').insert({
            organization_id: org.id,
            user_id: user.id,
            role: 'admin',
          });
        }
      }

      // Redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect to error page or login
  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
}

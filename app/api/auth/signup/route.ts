import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { signupSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting: 5 signups per IP per hour
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(`signup:${clientIp}`, {
      limit: 5,
      window: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many signup attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          }
        }
      );
    }

    const body = await request.json();
    const { invitationToken, ...signupData } = body;

    // Validate input with Zod
    const validation = signupSchema.safeParse(signupData);
    if (!validation.success) {
      const errors = validation.error.issues.map(issue => issue.message).join(', ');
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    const { email, password, name, companyName } = validation.data;

    // Require company name only if not joining via invitation
    if (!invitationToken && !companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Create admin client using service role key (server-side only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create the user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        company_name: companyName,
      },
    });

    if (error) {
      console.error('Supabase user creation error:', JSON.stringify(error, null, 2));
      return NextResponse.json({
        error: error.message || 'Failed to create user account'
      }, { status: 400 });
    }

    const userId = data.user.id;

    // If invitation token provided, accept the invitation
    if (invitationToken) {
      try {
        const { data: acceptResult, error: acceptError } = await supabase.rpc('accept_team_invitation', {
          p_token: invitationToken,
          p_user_id: data.user.id,
        });

        if (acceptError) {
          console.error('Error accepting invitation:', acceptError);
          // User was created but invitation acceptance failed
          // Return success anyway - they can be manually added
        }
      } catch (invError) {
        console.error('Exception accepting invitation:', invError);
      }
    } else {
      // No invitation - create new organization and add user as admin
      try {
        // Generate unique slug
        const orgSlug = (companyName || email.split('@')[0])
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-') +
          '-' +
          userId.substring(0, 8);

        // Create organization
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: companyName || `${email.split('@')[0]}'s Organization`,
            slug: orgSlug,
            subscription_plan: 'starter',
            subscription_status: 'active',
          })
          .select()
          .single();

        if (orgError) {
          console.error('Error creating organization:', orgError);
          throw orgError;
        }

        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            email: email,
            name: name || email.split('@')[0],
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          throw profileError;
        }

        // Add user as admin to organization
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: org.id,
            user_id: userId,
            role: 'admin',
            joined_at: new Date().toISOString(),
          });

        if (memberError) {
          console.error('Error creating organization membership:', memberError);
          throw memberError;
        }
      } catch (setupError) {
        console.error('Error setting up user organization:', setupError);
        // User was created but org setup failed - log it but don't fail the signup
        // The trigger should catch this on next login
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

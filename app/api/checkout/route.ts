import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getCurrentUser, getUserOrganization } from '@/lib/auth';
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit checkout requests to prevent abuse
    const ip = getClientIp(request);
    const rateLimitResult = rateLimit(ip, RATE_LIMITS.STRICT);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organization = await getUserOrganization();

    if (!organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Get the requested plan from request body
    const body = await request.json();
    const requestedPlan = body.plan as 'professional' | 'business' | undefined;

    if (!requestedPlan || !['professional', 'business'].includes(requestedPlan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "professional" or "business"' },
        { status: 400 }
      );
    }

    // Check if already subscribed to this or a higher plan
    const planHierarchy = { starter: 0, professional: 1, business: 2, enterprise: 3 };
    const currentPlanLevel = planHierarchy[organization.subscription_plan as keyof typeof planHierarchy] || 0;
    const requestedPlanLevel = planHierarchy[requestedPlan];

    if (currentPlanLevel >= requestedPlanLevel && organization.subscription_status === 'active') {
      return NextResponse.json(
        { error: `Already subscribed to ${organization.subscription_plan} plan` },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Get the price ID for the requested plan
    const priceId = requestedPlan === 'professional'
      ? process.env.STRIPE_PROFESSIONAL_PRICE_ID
      : process.env.STRIPE_BUSINESS_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Plan not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      customerId: organization.stripe_customer_id || undefined,
      customerEmail: user.email!,
      organizationId: organization.id,
      priceId,
      plan: requestedPlan,
      successUrl: `${origin}/settings/billing?success=true&plan=${requestedPlan}`,
      cancelUrl: `${origin}/settings/billing?canceled=true`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

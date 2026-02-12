import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getCurrentUser, getUserOrganization } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organization = await getUserOrganization();

    if (!organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Check if already subscribed
    if (organization.subscription_plan === 'pro' && organization.subscription_status === 'active') {
      return NextResponse.json(
        { error: 'Already subscribed to Pro plan' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      customerId: organization.stripe_customer_id || undefined,
      customerEmail: user.email!,
      organizationId: organization.id,
      successUrl: `${origin}/settings/billing?success=true`,
      cancelUrl: `${origin}/settings/billing?canceled=true`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

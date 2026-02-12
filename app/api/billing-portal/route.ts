import { NextRequest, NextResponse } from 'next/server';
import { createBillingPortalSession } from '@/lib/stripe';
import { getUserOrganization } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const organization = await getUserOrganization();

    if (!organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    if (!organization.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing information found' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Stripe billing portal session
    const session = await createBillingPortalSession({
      customerId: organization.stripe_customer_id,
      returnUrl: `${origin}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}

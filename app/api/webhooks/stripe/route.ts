import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// This is required to handle raw body for Stripe webhook signature verification
export const runtime = 'nodejs';

// Initialize Supabase client (will be created on demand if env vars are present)
const getSupabaseClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Supabase credentials not set - webhook will not work');
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // Use service role to bypass RLS
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

const supabase = getSupabaseClient()!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Received webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organization_id;

  if (!organizationId) {
    console.error('No organization_id in checkout session metadata');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  await supabase
    .from('organizations')
    .update({
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      subscription_plan: 'pro',
      subscription_status: subscription.status,
      current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
    })
    .eq('id', organizationId);

  console.log(`Checkout completed for organization ${organizationId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata?.organization_id;

  if (!organizationId) {
    // Try to find by customer ID
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single();

    if (!org) {
      console.error('Could not find organization for subscription update');
      return;
    }
  }

  const updateData: Record<string, string | number> = {
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
    current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
  };

  // Determine plan based on subscription status
  if (subscription.status === 'active') {
    updateData.subscription_plan = 'pro';
  }

  await supabase
    .from('organizations')
    .update(updateData)
    .eq(organizationId ? 'id' : 'stripe_customer_id', organizationId || subscription.customer);

  console.log(`Subscription updated for ${organizationId || subscription.customer}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!org) {
    console.error('Could not find organization for subscription deletion');
    return;
  }

  await supabase
    .from('organizations')
    .update({
      subscription_plan: 'free',
      subscription_status: 'canceled',
    })
    .eq('id', org.id);

  console.log(`Subscription canceled for organization ${org.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Payment succeeded - subscription should already be updated via subscription.updated event
  console.log(`Payment succeeded for customer ${invoice.customer}`);

  // Optional: Send receipt email or update audit log
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', invoice.customer as string)
    .single();

  if (!org) {
    console.error('Could not find organization for payment failure');
    return;
  }

  await supabase
    .from('organizations')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', org.id);

  console.log(`Payment failed for organization ${org.id}`);

  // Optional: Send email notification about payment failure
}

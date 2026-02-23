import Stripe from 'stripe';

// Initialize Stripe only if key is available (allows builds without Stripe configured)
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY is not set - Stripe features will not work');
    return null;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
  });
};

/**
 * Server-side Stripe client
 * Use this in Server Components, Server Actions, and API Routes
 */
export const stripe = getStripe()!;

/**
 * Stripe pricing configuration
 */
export const STRIPE_CONFIG = {
  // Update these with your actual Stripe Price IDs after creating products
  prices: {
    professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_xxx', // $49/month Professional plan
    business: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_xxx', // $99/month Business plan
    // Legacy support
    pro: process.env.STRIPE_PRO_PRICE_ID || process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_xxx',
  },
  products: {
    professional: process.env.STRIPE_PROFESSIONAL_PRODUCT_ID || 'prod_xxx',
    business: process.env.STRIPE_BUSINESS_PRODUCT_ID || 'prod_xxx',
    // Legacy support
    pro: process.env.STRIPE_PRO_PRODUCT_ID || process.env.STRIPE_PROFESSIONAL_PRODUCT_ID || 'prod_xxx',
  },
} as const;

/**
 * Create a Stripe checkout session for plan upgrade
 */
export async function createCheckoutSession({
  customerId,
  customerEmail,
  organizationId,
  priceId,
  plan,
  successUrl,
  cancelUrl,
}: {
  customerId?: string;
  customerEmail: string;
  organizationId: string;
  priceId: string;
  plan: 'professional' | 'business';
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: !customerId ? customerEmail : undefined,
    client_reference_id: organizationId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      organization_id: organizationId,
      plan: plan,
    },
    subscription_data: {
      metadata: {
        organization_id: organizationId,
        plan: plan,
      },
    },
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Create a Stripe billing portal session for managing subscription
 */
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Get subscription details for a customer
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return null;
  }
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Resume a subscription that was set to cancel
 */
export async function resumeSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return subscription;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    throw error;
  }
}

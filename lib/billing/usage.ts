import { createClient } from "@/lib/supabase/server";

/**
 * Get current usage for an organization in the current billing period
 */
export async function getUsage(organizationId: string) {
  const supabase = await createClient();

  // Get organization subscription status
  const { data: org } = await supabase
    .from('organizations')
    .select('subscription_status, subscription_plan, current_period_start, current_period_end')
    .eq('id', organizationId)
    .single();

  if (!org) {
    return {
      requestsUsed: 0,
      requestsLimit: 3, // Starter tier default
      templatesUsed: 0,
      templatesLimit: 1,
      usersCount: 0,
      usersLimit: 1,
      plan: 'starter' as const,
      status: 'active' as const,
    };
  }

  const plan = org.subscription_plan || 'starter';
  const status = org.subscription_status || 'active';

  // Count requests in current billing period
  const periodStart = org.current_period_start || getFirstDayOfMonth();
  const periodEnd = org.current_period_end || getLastDayOfMonth();

  const { count: requestsUsed } = await supabase
    .from('approval_requests')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('created_at', periodStart)
    .lte('created_at', periodEnd);

  // Count active templates
  const { count: templatesUsed } = await supabase
    .from('approval_templates')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('is_active', true);

  // Count users
  const { count: usersCount } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  // Determine limits based on plan
  const limits = getLimitsForPlan(plan);

  return {
    requestsUsed: requestsUsed || 0,
    requestsLimit: limits.requests,
    templatesUsed: templatesUsed || 0,
    templatesLimit: limits.templates,
    usersCount: usersCount || 0,
    usersLimit: limits.users,
    plan,
    status,
    periodStart,
    periodEnd,
  };
}

/**
 * Get limits for a given plan
 */
export function getLimitsForPlan(plan: string) {
  switch (plan) {
    case 'professional':
      return {
        requests: 50, // 50 requests per month
        templates: -1, // Unlimited templates
        users: 5, // Up to 5 users
      };
    case 'business':
      return {
        requests: -1, // Unlimited requests
        templates: -1, // Unlimited templates
        users: 15, // Up to 15 users
      };
    case 'enterprise':
      return {
        requests: -1, // Unlimited requests
        templates: -1, // Unlimited templates
        users: -1, // Unlimited users
      };
    case 'starter':
    case 'free': // Legacy support
    default:
      return {
        requests: 3, // Only 3 requests per month (down from 5)
        templates: 1, // Only 1 template (down from unlimited)
        users: 1, // 1 user only
      };
  }
}

/**
 * Check if organization can perform an action
 */
export async function canPerformAction(
  organizationId: string,
  action: 'create_request' | 'create_template' | 'invite_user'
): Promise<{ allowed: boolean; reason?: string }> {
  const usage = await getUsage(organizationId);

  switch (action) {
    case 'create_request':
      if (usage.requestsLimit === -1) {
        return { allowed: true };
      }
      if (usage.requestsUsed >= usage.requestsLimit) {
        return {
          allowed: false,
          reason: `You have reached your limit of ${usage.requestsLimit} requests per month. Upgrade to Pro for unlimited requests.`,
        };
      }
      return { allowed: true };

    case 'create_template':
      if (usage.templatesLimit === -1) {
        return { allowed: true };
      }
      if (usage.templatesUsed >= usage.templatesLimit) {
        return {
          allowed: false,
          reason: `You have reached your limit of ${usage.templatesLimit} templates. Upgrade to Pro for unlimited templates.`,
        };
      }
      return { allowed: true };

    case 'invite_user':
      if (usage.usersCount >= usage.usersLimit) {
        return {
          allowed: false,
          reason: `You have reached your limit of ${usage.usersLimit} user${usage.usersLimit === 1 ? '' : 's'}. Upgrade to Pro to add up to 50 users.`,
        };
      }
      return { allowed: true };

    default:
      return { allowed: false, reason: 'Unknown action' };
  }
}

/**
 * Track usage event (for analytics)
 */
export async function trackUsage(
  organizationId: string,
  event: string,
  metadata?: Record<string, unknown>
) {
  const supabase = await createClient();

  await supabase.from('usage_tracking').insert({
    organization_id: organizationId,
    event,
    metadata,
    created_at: new Date().toISOString(),
  });
}

// Helper functions
function getFirstDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function getLastDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
}

'use server'

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserOrgId } from "@/lib/auth";

export type ConversionSource =
  | 'usage_limit_dashboard'
  | 'usage_limit_modal'
  | 'analytics_banner'
  | 'analytics_locked_metric'
  | 'onboarding_checklist'
  | 'templates_limit'
  | 'email_branding'
  | 'other';

export type ConversionEvent =
  | 'upgrade_button_clicked'
  | 'settings_page_visited'
  | 'checkout_started'
  | 'subscription_created'
  | 'tier_upgraded';

/**
 * Track a conversion event (funnel step)
 */
export async function trackConversionEvent(
  event: ConversionEvent,
  source: ConversionSource,
  metadata?: Record<string, any>
) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'User not authenticated' };
    }

    // Insert tracking event
    const { error } = await supabase
      .from('conversion_events')
      .insert({
        organization_id: orgId,
        user_id: user.id,
        event_type: event,
        source,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error tracking conversion event:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in trackConversionEvent:', error);
    return { success: false, error: 'Failed to track event' };
  }
}

/**
 * Get conversion funnel metrics
 */
export async function getConversionMetrics(days: number = 30) {
  try {
    const supabase = await createClient();
    const orgId = await getUserOrgId();

    if (!orgId) {
      return null;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all conversion events for this org
    const { data: events } = await supabase
      .from('conversion_events')
      .select('*')
      .eq('organization_id', orgId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (!events) {
      return null;
    }

    // Calculate funnel metrics
    const metrics = {
      upgradeButtonClicks: events.filter(e => e.event_type === 'upgrade_button_clicked').length,
      settingsPageVisits: events.filter(e => e.event_type === 'settings_page_visited').length,
      checkoutStarts: events.filter(e => e.event_type === 'checkout_started').length,
      conversions: events.filter(e => e.event_type === 'tier_upgraded').length,

      // By source
      bySource: {} as Record<ConversionSource, number>,

      // Conversion rate
      clickToVisitRate: 0,
      visitToCheckoutRate: 0,
      checkoutToConversionRate: 0,
      overallConversionRate: 0,
    };

    // Count by source
    events.forEach(event => {
      if (!metrics.bySource[event.source as ConversionSource]) {
        metrics.bySource[event.source as ConversionSource] = 0;
      }
      if (event.event_type === 'upgrade_button_clicked') {
        metrics.bySource[event.source as ConversionSource]++;
      }
    });

    // Calculate conversion rates
    if (metrics.upgradeButtonClicks > 0) {
      metrics.clickToVisitRate = (metrics.settingsPageVisits / metrics.upgradeButtonClicks) * 100;
      metrics.overallConversionRate = (metrics.conversions / metrics.upgradeButtonClicks) * 100;
    }
    if (metrics.settingsPageVisits > 0) {
      metrics.visitToCheckoutRate = (metrics.checkoutStarts / metrics.settingsPageVisits) * 100;
    }
    if (metrics.checkoutStarts > 0) {
      metrics.checkoutToConversionRate = (metrics.conversions / metrics.checkoutStarts) * 100;
    }

    return metrics;
  } catch (error) {
    console.error('Error getting conversion metrics:', error);
    return null;
  }
}

/**
 * Get organization-wide conversion stats (admin only)
 */
export async function getGlobalConversionStats(days: number = 30) {
  try {
    const supabase = await createClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all conversion events across all orgs
    const { data: events } = await supabase
      .from('conversion_events')
      .select(`
        event_type,
        source,
        created_at,
        organizations(subscription_tier)
      `)
      .gte('created_at', startDate.toISOString());

    if (!events) {
      return null;
    }

    // Calculate global metrics
    const stats = {
      totalUpgradeClicks: events.filter(e => e.event_type === 'upgrade_button_clicked').length,
      totalConversions: events.filter(e => e.event_type === 'tier_upgraded').length,
      conversionRate: 0,

      topSources: [] as Array<{ source: ConversionSource; clicks: number; conversions: number; rate: number }>,

      timeline: [] as Array<{ date: string; clicks: number; conversions: number }>,
    };

    // Calculate conversion rate
    if (stats.totalUpgradeClicks > 0) {
      stats.conversionRate = (stats.totalConversions / stats.totalUpgradeClicks) * 100;
    }

    // Group by source
    const sourceMap = new Map<ConversionSource, { clicks: number; conversions: number }>();

    events.forEach(event => {
      const source = event.source as ConversionSource;
      if (!sourceMap.has(source)) {
        sourceMap.set(source, { clicks: 0, conversions: 0 });
      }

      const data = sourceMap.get(source)!;
      if (event.event_type === 'upgrade_button_clicked') {
        data.clicks++;
      } else if (event.event_type === 'tier_upgraded') {
        data.conversions++;
      }
    });

    // Convert to array and calculate rates
    stats.topSources = Array.from(sourceMap.entries())
      .map(([source, data]) => ({
        source,
        clicks: data.clicks,
        conversions: data.conversions,
        rate: data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0,
      }))
      .sort((a, b) => b.conversions - a.conversions);

    // Group by date for timeline
    const dateMap = new Map<string, { clicks: number; conversions: number }>();

    events.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, { clicks: 0, conversions: 0 });
      }

      const data = dateMap.get(date)!;
      if (event.event_type === 'upgrade_button_clicked') {
        data.clicks++;
      } else if (event.event_type === 'tier_upgraded') {
        data.conversions++;
      }
    });

    stats.timeline = Array.from(dateMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return stats;
  } catch (error) {
    console.error('Error getting global conversion stats:', error);
    return null;
  }
}

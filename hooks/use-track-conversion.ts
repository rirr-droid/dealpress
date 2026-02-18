"use client";

import { trackConversionEvent, ConversionSource } from "@/lib/analytics/tracking";
import { useRouter } from "next/navigation";

/**
 * Hook to track conversion events
 */
export function useTrackConversion() {
  const router = useRouter();

  /**
   * Track upgrade button click and navigate to settings
   */
  const trackUpgradeClick = async (source: ConversionSource, redirectPath: string = '/settings') => {
    try {
      // Track the click event
      await trackConversionEvent('upgrade_button_clicked', source);

      // Navigate to settings/checkout
      router.push(redirectPath);
    } catch (error) {
      console.error('Error tracking upgrade click:', error);
      // Still navigate even if tracking fails
      router.push(redirectPath);
    }
  };

  /**
   * Track settings page visit
   */
  const trackSettingsVisit = async (source: ConversionSource) => {
    try {
      await trackConversionEvent('settings_page_visited', source);
    } catch (error) {
      console.error('Error tracking settings visit:', error);
    }
  };

  /**
   * Track checkout start
   */
  const trackCheckoutStart = async (source: ConversionSource) => {
    try {
      await trackConversionEvent('checkout_started', source);
    } catch (error) {
      console.error('Error tracking checkout start:', error);
    }
  };

  return {
    trackUpgradeClick,
    trackSettingsVisit,
    trackCheckoutStart,
  };
}

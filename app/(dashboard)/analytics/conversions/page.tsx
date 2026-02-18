import { getUserOrganization } from "@/lib/auth";
import { getConversionMetrics, getGlobalConversionStats } from "@/lib/analytics/tracking";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import {
  TrendingUp,
  MousePointer,
  Eye,
  ShoppingCart,
  CheckCircle,
  Target,
  Zap,
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ConversionsPage() {
  const organization = await getUserOrganization();

  if (!organization) {
    redirect('/login');
  }

  const metrics = await getConversionMetrics(30);
  const globalStats = await getGlobalConversionStats(30);

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Conversion Analytics</h1>
          <p className="text-[#86868b]">Track your upgrade funnel performance</p>
        </div>
        <Card className="p-12 text-center">
          <p className="text-[#86868b]">No conversion data yet. Start tracking upgrades!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Conversion Analytics</h1>
        <p className="text-[#86868b]">
          Track Free → Pro conversion funnel (Last 30 days)
        </p>
      </div>

      {/* Funnel Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
              <MousePointer className="w-6 h-6 text-[#0071e3]" />
            </div>
          </div>
          <p className="text-sm text-[#86868b] mb-1">Upgrade Clicks</p>
          <p className="text-3xl font-bold text-[#1d1d1f]">{metrics.upgradeButtonClicks}</p>
          <p className="text-xs text-[#86868b] mt-1">Intent to upgrade</p>
        </Card>

        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-[#ff9500]/10 flex items-center justify-center">
              <Eye className="w-6 h-6 text-[#ff9500]" />
            </div>
            <Badge className="bg-orange-50 text-[#ff9500]">
              {metrics.clickToVisitRate.toFixed(1)}%
            </Badge>
          </div>
          <p className="text-sm text-[#86868b] mb-1">Settings Visits</p>
          <p className="text-3xl font-bold text-[#1d1d1f]">{metrics.settingsPageVisits}</p>
          <p className="text-xs text-[#86868b] mt-1">From {metrics.upgradeButtonClicks} clicks</p>
        </Card>

        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-[#34c759]/10 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[#34c759]" />
            </div>
            <Badge className="bg-green-50 text-[#34c759]">
              {metrics.visitToCheckoutRate.toFixed(1)}%
            </Badge>
          </div>
          <p className="text-sm text-[#86868b] mb-1">Checkout Starts</p>
          <p className="text-3xl font-bold text-[#1d1d1f]">{metrics.checkoutStarts}</p>
          <p className="text-xs text-[#86868b] mt-1">From {metrics.settingsPageVisits} visits</p>
        </Card>

        <Card className="p-6 rounded-[18px] border-2 border-[#34c759] bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-[#34c759] flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <Badge className="bg-green-600 text-white">
              {metrics.overallConversionRate.toFixed(1)}%
            </Badge>
          </div>
          <p className="text-sm text-[#86868b] mb-1">Conversions</p>
          <p className="text-3xl font-bold text-[#34c759]">{metrics.conversions}</p>
          <p className="text-xs text-[#86868b] mt-1">Free → Pro upgrades</p>
        </Card>
      </div>

      {/* Conversion Sources */}
      <Card className="p-6 rounded-[18px] border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-[#0071e3]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1d1d1f]">Conversion Sources</h2>
        </div>

        <div className="space-y-3">
          {Object.entries(metrics.bySource)
            .sort((a, b) => b[1] - a[1])
            .map(([source, count]) => (
              <div
                key={source}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-[12px]"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-[#0071e3]" />
                  <div>
                    <p className="text-sm font-medium text-[#1d1d1f] capitalize">
                      {source.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-[#86868b]">Upgrade button clicks</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#0071e3]">{count}</p>
                  <p className="text-xs text-[#86868b]">
                    {metrics.upgradeButtonClicks > 0
                      ? ((count / metrics.upgradeButtonClicks) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
            ))}

          {Object.keys(metrics.bySource).length === 0 && (
            <div className="text-center py-8">
              <p className="text-[#86868b]">No conversion sources tracked yet</p>
            </div>
          )}
        </div>
      </Card>

      {/* Global Stats (if admin) */}
      {globalStats && (
        <Card className="p-6 rounded-[18px] border-2 border-[#0071e3] bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#0071e3] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1d1d1f]">Global Performance</h2>
              <p className="text-sm text-[#86868b]">Across all organizations</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-[#86868b] mb-1">Total Clicks</p>
              <p className="text-2xl font-bold text-[#1d1d1f]">{globalStats.totalUpgradeClicks}</p>
            </div>
            <div>
              <p className="text-sm text-[#86868b] mb-1">Total Conversions</p>
              <p className="text-2xl font-bold text-[#34c759]">{globalStats.totalConversions}</p>
            </div>
            <div>
              <p className="text-sm text-[#86868b] mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-[#0071e3]">{globalStats.conversionRate.toFixed(1)}%</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Top Sources</h3>
            <div className="space-y-2">
              {globalStats.topSources.slice(0, 5).map((source) => (
                <div key={source.source} className="flex items-center justify-between text-sm">
                  <span className="text-[#1d1d1f] capitalize">{source.source.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[#86868b]">{source.clicks} clicks</span>
                    <span className="text-[#34c759] font-semibold">{source.conversions} conversions</span>
                    <Badge className="bg-green-50 text-[#34c759]">{source.rate.toFixed(1)}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

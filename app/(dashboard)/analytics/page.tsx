import { getUserOrganization } from "@/lib/auth";
import { getAnalytics, getTeamPerformance } from "@/lib/db/analytics";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Activity,
  Target,
  Award,
  Lock,
  Download,
  Share2,
  DollarSign,
  Zap,
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const organization = await getUserOrganization();

  if (!organization) {
    redirect('/login');
  }

  const isPro = organization.subscription_tier === 'pro' || organization.subscription_tier === 'enterprise';
  const analytics = await getAnalytics(organization.id, 30);
  const teamPerformance = await getTeamPerformance(organization.id, 30);

  const approvalRate = analytics.totalRequests > 0
    ? ((analytics.approvedRequests / analytics.totalRequests) * 100).toFixed(1)
    : '0';

  const rejectionRate = analytics.totalRequests > 0
    ? ((analytics.rejectedRequests / analytics.totalRequests) * 100).toFixed(1)
    : '0';

  // Calculate dollar impact (total deal value for approved requests)
  const totalDealValue = analytics.totalRequests > 0
    ? await (async () => {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const { data } = await supabase
          .from('approval_requests')
          .select('deal_amount')
          .eq('organization_id', organization.id)
          .eq('status', 'approved')
          .gte('submitted_at', startDate.toISOString())
          .not('deal_amount', 'is', null);

        const total = data?.reduce((sum, req) => sum + (req.deal_amount || 0), 0) || 0;
        const count = data?.length || 0;
        return { total, count };
      })()
    : { total: 0, count: 0 };

  return (
    <div className="space-y-6">
      {/* Header with Export/Share Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Analytics</h1>
          <p className="text-[#86868b]">
            Insights and metrics for the last 30 days {isPro && '• Pro tier'}
          </p>
        </div>
        {isPro && (
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" className="rounded-full">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        )}
      </div>

      {/* Upgrade CTA for Free Tier */}
      {!isPro && (
        <Card className="p-6 rounded-[18px] border-2 border-[#0071e3] bg-gradient-to-br from-blue-50 to-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0071e3] opacity-5 rounded-full -mr-16 -mt-16"></div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0071e3] to-[#0077ed] rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">
                Unlock Full Analytics with Pro
              </h3>
              <p className="text-sm text-[#86868b] mb-4">
                Get access to dollar impact tracking, all-time historical data, export to PDF/CSV, shareable dashboards, and advanced filters.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#34c759]" />
                  <span className="text-sm text-[#1d1d1f]">Dollar impact tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#0071e3]" />
                  <span className="text-sm text-[#1d1d1f]">Export reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#ff9500]" />
                  <span className="text-sm text-[#1d1d1f]">Shareable dashboards</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#ff3b30]" />
                  <span className="text-sm text-[#1d1d1f]">All-time data</span>
                </div>
              </div>
              <Link href="/settings/billing">
                <Button className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full">
                  Upgrade to Professional - $49/mo
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#0071e3]" />
            </div>
            <Badge className="bg-blue-50 text-[#0071e3]">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12%
            </Badge>
          </div>
          <p className="text-sm text-[#86868b] mb-1">Total Requests</p>
          <p className="text-3xl font-bold text-[#1d1d1f]">{analytics.totalRequests}</p>
        </Card>

        {isPro ? (
          <Card className="p-6 rounded-[18px] border-2 border-[#34c759] bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-full bg-[#34c759]/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#34c759]" />
              </div>
              <Badge className="bg-green-600 text-white">Pro</Badge>
            </div>
            <p className="text-sm text-[#86868b] mb-1">Dollar Impact</p>
            <p className="text-3xl font-bold text-[#1d1d1f]">
              ${(totalDealValue.total / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-[#86868b] mt-1">
              {totalDealValue.count} deals approved
            </p>
          </Card>
        ) : (
          <Card className="p-6 rounded-[18px] border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-[2px] bg-white/60 flex items-center justify-center z-10">
              <Link href="/settings">
                <Button className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between mb-3 opacity-40">
              <div className="w-12 h-12 rounded-full bg-[#34c759]/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#34c759]" />
              </div>
            </div>
            <p className="text-sm text-[#86868b] mb-1 opacity-40">Dollar Impact</p>
            <p className="text-3xl font-bold text-[#1d1d1f] opacity-40">$X.XM</p>
            <p className="text-xs text-[#86868b] mt-1 opacity-40">Deals approved</p>
          </Card>
        )}

        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-[#ff9500]/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#ff9500]" />
            </div>
            <Badge className="bg-orange-50 text-[#ff9500]">Avg</Badge>
          </div>
          <p className="text-sm text-[#86868b] mb-1">Approval Time</p>
          <p className="text-3xl font-bold text-[#1d1d1f]">
            {analytics.averageApprovalTime.toFixed(1)}h
          </p>
        </Card>

        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-[#34c759]/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#34c759]" />
            </div>
            <Badge className="bg-green-50 text-[#34c759]">{approvalRate}%</Badge>
          </div>
          <p className="text-sm text-[#86868b] mb-1">Approval Rate</p>
          <p className="text-3xl font-bold text-[#1d1d1f]">{analytics.approvedRequests}</p>
        </Card>
      </div>

      {/* Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#0071e3]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1d1d1f]">Requests by Priority</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#1d1d1f]">Urgent</span>
                <span className="text-sm font-semibold text-[#ff3b30]">
                  {analytics.requestsByPriority.urgent}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff3b30]"
                  style={{
                    width: `${(analytics.requestsByPriority.urgent / analytics.totalRequests) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#1d1d1f]">High</span>
                <span className="text-sm font-semibold text-[#ff9500]">
                  {analytics.requestsByPriority.high}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff9500]"
                  style={{
                    width: `${(analytics.requestsByPriority.high / analytics.totalRequests) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#1d1d1f]">Normal</span>
                <span className="text-sm font-semibold text-[#0071e3]">
                  {analytics.requestsByPriority.normal}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0071e3]"
                  style={{
                    width: `${(analytics.requestsByPriority.normal / analytics.totalRequests) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#34c759]/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#34c759]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1d1d1f]">Status Breakdown</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-[12px]">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#34c759]" />
                <span className="text-sm font-medium text-[#1d1d1f]">Approved</span>
              </div>
              <span className="text-lg font-bold text-[#34c759]">
                {analytics.requestsByStatus.approved}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-[12px]">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#ff9500]" />
                <span className="text-sm font-medium text-[#1d1d1f]">Pending</span>
              </div>
              <span className="text-lg font-bold text-[#ff9500]">
                {analytics.requestsByStatus.pending}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-[12px]">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-[#ff3b30]" />
                <span className="text-sm font-medium text-[#1d1d1f]">Rejected</span>
              </div>
              <span className="text-lg font-bold text-[#ff3b30]">
                {analytics.requestsByStatus.rejected}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Approvers */}
      <Card className="p-6 rounded-[18px] border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-[#0071e3]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1d1d1f]">Top Approvers</h2>
        </div>

        <div className="space-y-3">
          {analytics.topApprovers.slice(0, 5).map((approver, index) => (
            <div
              key={approver.user_id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-[12px] hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-[#1d1d1f]">
                  {approver.name}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-[#86868b]">Approved</p>
                  <p className="text-sm font-bold text-[#34c759]">
                    {approver.approved_count}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#86868b]">Avg Time</p>
                  <p className="text-sm font-bold text-[#1d1d1f]">
                    {approver.avg_response_time.toFixed(1)}h
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Team Performance */}
      <Card className="p-6 rounded-[18px] border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#0071e3]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1d1d1f]">Team Performance</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-[#86868b] uppercase pb-3">
                  Member
                </th>
                <th className="text-right text-xs font-semibold text-[#86868b] uppercase pb-3">
                  Assigned
                </th>
                <th className="text-right text-xs font-semibold text-[#86868b] uppercase pb-3">
                  Approved
                </th>
                <th className="text-right text-xs font-semibold text-[#86868b] uppercase pb-3">
                  Rejected
                </th>
                <th className="text-right text-xs font-semibold text-[#86868b] uppercase pb-3">
                  Pending
                </th>
                <th className="text-right text-xs font-semibold text-[#86868b] uppercase pb-3">
                  Avg Time
                </th>
              </tr>
            </thead>
            <tbody>
              {teamPerformance.map((member) => (
                <tr key={member.user_id} className="border-b border-gray-100">
                  <td className="py-4">
                    <div>
                      <p className="text-sm font-medium text-[#1d1d1f]">{member.name}</p>
                      <p className="text-xs text-[#86868b]">{member.email}</p>
                    </div>
                  </td>
                  <td className="py-4 text-right text-sm font-medium text-[#1d1d1f]">
                    {member.total_assigned}
                  </td>
                  <td className="py-4 text-right text-sm font-medium text-[#34c759]">
                    {member.approved}
                  </td>
                  <td className="py-4 text-right text-sm font-medium text-[#ff3b30]">
                    {member.rejected}
                  </td>
                  <td className="py-4 text-right text-sm font-medium text-[#ff9500]">
                    {member.pending}
                  </td>
                  <td className="py-4 text-right text-sm font-medium text-[#1d1d1f]">
                    {member.avg_response_time > 0 ? `${member.avg_response_time.toFixed(1)}h` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

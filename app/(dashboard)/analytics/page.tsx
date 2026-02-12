import { getUserOrganization } from "@/lib/auth";
import { getAnalytics, getTeamPerformance } from "@/lib/db/analytics";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Activity,
  Target,
  Award,
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const organization = await getUserOrganization();

  if (!organization) {
    redirect('/login');
  }

  const analytics = await getAnalytics(organization.id, 30);
  const teamPerformance = await getTeamPerformance(organization.id, 30);

  const approvalRate = analytics.totalRequests > 0
    ? ((analytics.approvedRequests / analytics.totalRequests) * 100).toFixed(1)
    : '0';

  const rejectionRate = analytics.totalRequests > 0
    ? ((analytics.rejectedRequests / analytics.totalRequests) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Analytics</h1>
        <p className="text-[#86868b]">
          Insights and metrics for the last 30 days
        </p>
      </div>

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

        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-[#34c759]/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#34c759]" />
            </div>
            <Badge className="bg-green-50 text-[#34c759]">{approvalRate}%</Badge>
          </div>
          <p className="text-sm text-[#86868b] mb-1">Approved</p>
          <p className="text-3xl font-bold text-[#1d1d1f]">{analytics.approvedRequests}</p>
        </Card>

        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-[#ff3b30]/10 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-[#ff3b30]" />
            </div>
            <Badge className="bg-red-50 text-[#ff3b30]">{rejectionRate}%</Badge>
          </div>
          <p className="text-sm text-[#86868b] mb-1">Rejected</p>
          <p className="text-3xl font-bold text-[#1d1d1f]">{analytics.rejectedRequests}</p>
        </Card>

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

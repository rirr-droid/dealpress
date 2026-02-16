import { createClient } from "@/lib/supabase/server";

export interface AnalyticsMetrics {
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  pendingRequests: number;
  averageApprovalTime: number; // in hours
  requestsByPriority: {
    urgent: number;
    high: number;
    normal: number;
  };
  requestsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  topApprovers: Array<{
    user_id: string;
    name: string;
    approved_count: number;
    avg_response_time: number; // in hours
  }>;
  requestTrend: Array<{
    date: string;
    count: number;
    approved: number;
    rejected: number;
  }>;
}

/**
 * Get comprehensive analytics for an organization
 */
export async function getAnalytics(organizationId: string, days: number = 30): Promise<AnalyticsMetrics> {
  const supabase = await createClient();

  // Calculate date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get total requests
  const { count: totalRequests } = await supabase
    .from('approval_requests')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('submitted_at', startDate.toISOString());

  // Get requests by status
  const { data: statusData } = await supabase
    .from('approval_requests')
    .select('status')
    .eq('organization_id', organizationId)
    .gte('submitted_at', startDate.toISOString());

  const requestsByStatus = {
    pending: statusData?.filter(r => r.status === 'pending').length || 0,
    approved: statusData?.filter(r => r.status === 'approved').length || 0,
    rejected: statusData?.filter(r => r.status === 'rejected').length || 0,
  };

  // Get requests by priority
  const { data: priorityData } = await supabase
    .from('approval_requests')
    .select('priority')
    .eq('organization_id', organizationId)
    .gte('submitted_at', startDate.toISOString());

  const requestsByPriority = {
    urgent: priorityData?.filter(r => r.priority === 'urgent').length || 0,
    high: priorityData?.filter(r => r.priority === 'high').length || 0,
    normal: priorityData?.filter(r => r.priority === 'normal').length || 0,
  };

  // Calculate average approval time
  const { data: completedRequests } = await supabase
    .from('approval_requests')
    .select('submitted_at, completed_at')
    .eq('organization_id', organizationId)
    .in('status', ['approved', 'rejected'])
    .not('completed_at', 'is', null)
    .gte('submitted_at', startDate.toISOString());

  let averageApprovalTime = 0;
  if (completedRequests && completedRequests.length > 0) {
    const totalTime = completedRequests.reduce((sum, req) => {
      const submitted = new Date(req.submitted_at).getTime();
      const completed = new Date(req.completed_at!).getTime();
      return sum + (completed - submitted);
    }, 0);
    averageApprovalTime = totalTime / completedRequests.length / (1000 * 60 * 60); // Convert to hours
  }

  // Get top approvers with their stats
  // First, get all request IDs for this organization
  const { data: orgRequests } = await supabase
    .from('approval_requests')
    .select('id')
    .eq('organization_id', organizationId)
    .gte('submitted_at', startDate.toISOString());

  const requestIds = orgRequests?.map(r => r.id) || [];

  // Then get approval steps for those requests
  const { data: approvalData } = requestIds.length > 0 ? await supabase
    .from('approval_steps')
    .select(`
      approver_id,
      status,
      assigned_at,
      acted_at
    `)
    .in('request_id', requestIds)
    .eq('status', 'approved')
    .not('acted_at', 'is', null)
    .gte('assigned_at', startDate.toISOString())
    : { data: [] };

  // Get user profiles for approvers
  const approverIds = Array.from(new Set(approvalData?.map(s => s.approver_id) || []));
  const { data: approvers } = approverIds.length > 0 ? await supabase
    .from('user_profiles')
    .select('id, name')
    .in('id', approverIds)
    : { data: [] };

  const approverProfileMap = new Map(approvers?.map(u => [u.id, u]) || []);

  // Process top approvers
  const approverMap = new Map<string, { name: string; count: number; totalTime: number }>();

  if (approvalData) {
    approvalData.forEach((step: { approver_id: string; assigned_at: string; acted_at: string }) => {
      const user = approverProfileMap.get(step.approver_id);
      if (!user) return;

      const existing = approverMap.get(step.approver_id) || {
        name: user.name,
        count: 0,
        totalTime: 0
      };

      const assigned = new Date(step.assigned_at).getTime();
      const acted = new Date(step.acted_at).getTime();
      const responseTime = acted - assigned;

      approverMap.set(step.approver_id, {
        name: existing.name,
        count: existing.count + 1,
        totalTime: existing.totalTime + responseTime,
      });
    });
  }

  const topApprovers = Array.from(approverMap.entries())
    .map(([user_id, data]) => ({
      user_id,
      name: data.name,
      approved_count: data.count,
      avg_response_time: data.totalTime / data.count / (1000 * 60 * 60), // hours
    }))
    .sort((a, b) => b.approved_count - a.approved_count)
    .slice(0, 10);

  // Get request trend (daily counts)
  const { data: trendData } = await supabase
    .from('approval_requests')
    .select('submitted_at, status')
    .eq('organization_id', organizationId)
    .gte('submitted_at', startDate.toISOString())
    .order('submitted_at', { ascending: true });

  // Group by date
  const trendMap = new Map<string, { count: number; approved: number; rejected: number }>();

  if (trendData) {
    trendData.forEach((req: { submitted_at: string; status: string }) => {
      const date = new Date(req.submitted_at).toISOString().split('T')[0];
      const existing = trendMap.get(date) || { count: 0, approved: 0, rejected: 0 };

      trendMap.set(date, {
        count: existing.count + 1,
        approved: existing.approved + (req.status === 'approved' ? 1 : 0),
        rejected: existing.rejected + (req.status === 'rejected' ? 1 : 0),
      });
    });
  }

  const requestTrend = Array.from(trendMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRequests: totalRequests || 0,
    approvedRequests: requestsByStatus.approved,
    rejectedRequests: requestsByStatus.rejected,
    pendingRequests: requestsByStatus.pending,
    averageApprovalTime,
    requestsByPriority,
    requestsByStatus,
    topApprovers,
    requestTrend,
  };
}

/**
 * Get team performance metrics
 */
export async function getTeamPerformance(organizationId: string, days: number = 30) {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // First get all requests for this organization
  const { data: orgRequests } = await supabase
    .from('approval_requests')
    .select('id')
    .eq('organization_id', organizationId)
    .gte('submitted_at', startDate.toISOString());

  const requestIds = orgRequests?.map(r => r.id) || [];

  // Then get approval steps for those requests
  const { data: teamData } = requestIds.length > 0 ? await supabase
    .from('approval_steps')
    .select(`
      approver_id,
      status,
      assigned_at,
      acted_at
    `)
    .in('request_id', requestIds)
    .gte('assigned_at', startDate.toISOString())
    : { data: [] };

  // Get user profiles
  const approverIds = Array.from(new Set(teamData?.map(s => s.approver_id) || []));
  const { data: users } = approverIds.length > 0 ? await supabase
    .from('user_profiles')
    .select('id, name, email')
    .in('id', approverIds)
    : { data: [] };

  const userProfileMap = new Map(users?.map(u => [u.id, u]) || []);

  const memberStats = new Map<string, {
    name: string;
    email: string;
    total_assigned: number;
    approved: number;
    rejected: number;
    pending: number;
    avg_response_time: number;
  }>();

  if (teamData) {
    teamData.forEach((step: {
      approver_id: string;
      status: string;
      assigned_at: string;
      acted_at: string | null;
    }) => {
      const user = userProfileMap.get(step.approver_id);
      if (!user) return;

      const existing = memberStats.get(step.approver_id) || {
        name: user.name,
        email: user.email,
        total_assigned: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        avg_response_time: 0,
      };

      let responseTime = 0;
      if (step.acted_at) {
        const assigned = new Date(step.assigned_at).getTime();
        const acted = new Date(step.acted_at).getTime();
        responseTime = (acted - assigned) / (1000 * 60 * 60); // hours
      }

      memberStats.set(step.approver_id, {
        ...existing,
        total_assigned: existing.total_assigned + 1,
        approved: existing.approved + (step.status === 'approved' ? 1 : 0),
        rejected: existing.rejected + (step.status === 'rejected' ? 1 : 0),
        pending: existing.pending + (step.status === 'pending' ? 1 : 0),
        avg_response_time: step.acted_at
          ? (existing.avg_response_time * existing.total_assigned + responseTime) / (existing.total_assigned + 1)
          : existing.avg_response_time,
      });
    });
  }

  return Array.from(memberStats.entries()).map(([user_id, stats]) => ({
    user_id,
    ...stats,
  }));
}
